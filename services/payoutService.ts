// Payout Service - Stripe Connect integration for creator payouts

import { supabase } from '@/lib/supabase';
import type { Payout, PayoutStatus } from '@/types/affiliate';

const MINIMUM_PAYOUT_THRESHOLD = 2000; // $20.00 in cents
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

// Initialize Stripe (server-side only)
let stripe: any = null;
if (typeof window === 'undefined' && STRIPE_SECRET_KEY) {
  const Stripe = require('stripe');
  stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
}

export async function createConnectedAccount(
  affiliateId: string,
  email: string
): Promise<{ accountId: string; onboardingUrl: string }> {
  if (!stripe) throw new Error('Stripe not configured');

  // Create Stripe Connect Express account
  const account = await stripe.accounts.create({
    type: 'express',
    email,
    capabilities: {
      transfers: { requested: true },
    },
    metadata: { affiliateId },
  });

  // Update affiliate with Stripe account ID
  await supabase
    .from('affiliates')
    .update({ stripe_connected_account_id: account.id })
    .eq('id', affiliateId);

  // Create onboarding link
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${process.env.APP_URL}/affiliate/onboarding?refresh=true`,
    return_url: `${process.env.APP_URL}/affiliate/dashboard?onboarded=true`,
    type: 'account_onboarding',
  });

  return {
    accountId: account.id,
    onboardingUrl: accountLink.url,
  };
}

export async function processPayoutRequest(payoutId: string): Promise<boolean> {
  if (!stripe) throw new Error('Stripe not configured');

  // Get payout details
  const { data: payout, error } = await supabase
    .from('affiliate_payouts')
    .select(`
      *,
      affiliates(stripe_connected_account_id)
    `)
    .eq('id', payoutId)
    .single();

  if (error || !payout) {
    throw new Error('Payout not found');
  }

  if (payout.status !== 'pending') {
    throw new Error('Payout is not in pending status');
  }

  const stripeAccountId = (payout.affiliates as any)?.stripe_connected_account_id;
  if (!stripeAccountId) {
    await updatePayoutStatus(payoutId, 'failed', 'No Stripe account connected');
    throw new Error('Affiliate has no connected Stripe account');
  }

  // Check minimum threshold
  const amountInCents = Math.round(payout.amount * 100);
  if (amountInCents < MINIMUM_PAYOUT_THRESHOLD) {
    await updatePayoutStatus(payoutId, 'failed', `Minimum payout is $${MINIMUM_PAYOUT_THRESHOLD / 100}`);
    throw new Error(`Minimum payout threshold is $${MINIMUM_PAYOUT_THRESHOLD / 100}`);
  }

  // Update status to processing
  await updatePayoutStatus(payoutId, 'processing');

  try {
    // Create transfer to connected account
    const transfer = await stripe.transfers.create({
      amount: amountInCents,
      currency: 'usd',
      destination: stripeAccountId,
      metadata: { payoutId, affiliateId: payout.affiliate_id },
    });

    // Update payout with transfer ID and completed status
    await supabase
      .from('affiliate_payouts')
      .update({
        stripe_transfer_id: transfer.id,
        status: 'completed',
        processed_at: new Date().toISOString(),
      })
      .eq('id', payoutId);

    return true;
  } catch (err: any) {
    await updatePayoutStatus(payoutId, 'failed', err.message);
    throw err;
  }
}

export async function getPayoutHistory(affiliateId: string): Promise<Payout[]> {
  const { data, error } = await supabase
    .from('affiliate_payouts')
    .select('*')
    .eq('affiliate_id', affiliateId)
    .order('requested_at', { ascending: false });

  if (error) throw new Error(`Failed to get payout history: ${error.message}`);
  return (data || []).map(mapPayout);
}

export async function getConnectedAccountStatus(affiliateId: string): Promise<{
  connected: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
}> {
  if (!stripe) return { connected: false, chargesEnabled: false, payoutsEnabled: false };

  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('stripe_connected_account_id')
    .eq('id', affiliateId)
    .single();

  if (!affiliate?.stripe_connected_account_id) {
    return { connected: false, chargesEnabled: false, payoutsEnabled: false };
  }

  try {
    const account = await stripe.accounts.retrieve(affiliate.stripe_connected_account_id);
    return {
      connected: true,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
    };
  } catch {
    return { connected: false, chargesEnabled: false, payoutsEnabled: false };
  }
}

export function getMinimumPayoutThreshold(): number {
  return MINIMUM_PAYOUT_THRESHOLD / 100; // Return in dollars
}

// Helper functions
async function updatePayoutStatus(
  payoutId: string,
  status: PayoutStatus,
  failureReason?: string
): Promise<void> {
  const update: any = { status };
  if (failureReason) update.failure_reason = failureReason;
  if (status === 'completed' || status === 'failed') {
    update.processed_at = new Date().toISOString();
  }

  await supabase
    .from('affiliate_payouts')
    .update(update)
    .eq('id', payoutId);
}

function mapPayout(data: any): Payout {
  return {
    id: data.id,
    affiliateId: data.affiliate_id,
    amount: data.amount,
    status: data.status,
    stripeTransferId: data.stripe_transfer_id,
    requestedAt: new Date(data.requested_at || data.created_at),
    processedAt: data.processed_at ? new Date(data.processed_at) : undefined,
    failureReason: data.failure_reason,
  };
}
