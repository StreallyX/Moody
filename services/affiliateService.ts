// Affiliate Service - Core affiliate/creator code logic

import { supabase } from '@/lib/supabase';
import type { Affiliate, AffiliateStats, AffiliateEarnings, Conversion } from '@/types/affiliate';
import { validateCodeApplication, checkSelfReferral } from '@/utils/affiliateValidation';

const COMMISSION_RATE = 0.10; // 10% default commission

// Generate a unique affiliate code
function generateCode(length = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function createAffiliateCode(userId: string): Promise<Affiliate> {
  // Check if user already has an affiliate code
  const { data: existing } = await supabase
    .from('affiliates')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (existing) {
    return mapAffiliate(existing);
  }

  // Generate unique code
  let code: string;
  let isUnique = false;
  do {
    code = generateCode();
    const { data } = await supabase
      .from('affiliates')
      .select('id')
      .eq('code', code)
      .single();
    isUnique = !data;
  } while (!isUnique);

  const { data, error } = await supabase
    .from('affiliates')
    .insert({
      user_id: userId,
      code,
      commission_rate: COMMISSION_RATE,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create affiliate: ${error.message}`);
  return mapAffiliate(data);
}

export async function validateCode(code: string): Promise<Affiliate | null> {
  const { data } = await supabase
    .from('affiliates')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single();

  return data ? mapAffiliate(data) : null;
}

export async function applyCode(userId: string, code: string): Promise<boolean> {
  // Validate rate limiting and anti-fraud
  const validation = await validateCodeApplication(userId, code);
  if (!validation.valid) {
    throw new Error(validation.reason || 'Invalid code application');
  }

  const affiliate = await validateCode(code);
  if (!affiliate) {
    throw new Error('Invalid or inactive affiliate code');
  }

  // Prevent self-referral
  if (await checkSelfReferral(userId, affiliate.id)) {
    throw new Error('Cannot use your own referral code');
  }

  // Check if user already has a referral
  const { data: existingRef } = await supabase
    .from('user_referrals')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (existingRef) {
    throw new Error('User already has a referral code applied');
  }

  // Apply the referral
  const { error } = await supabase
    .from('user_referrals')
    .insert({
      user_id: userId,
      affiliate_id: affiliate.id,
      code: code.toUpperCase(),
    });

  if (error) throw new Error(`Failed to apply code: ${error.message}`);
  return true;
}

export async function trackConversion(
  userId: string,
  purchaseAmount: number,
  transactionId: string
): Promise<Conversion | null> {
  // Get user's referral
  const { data: referral } = await supabase
    .from('user_referrals')
    .select('affiliate_id, affiliates(commission_rate)')
    .eq('user_id', userId)
    .single();

  if (!referral) return null;

  const commissionRate = (referral.affiliates as any)?.commission_rate || COMMISSION_RATE;
  const commissionAmount = purchaseAmount * commissionRate;

  const { data, error } = await supabase
    .from('affiliate_conversions')
    .insert({
      affiliate_id: referral.affiliate_id,
      user_id: userId,
      transaction_id: transactionId,
      purchase_amount: purchaseAmount,
      commission_amount: commissionAmount,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to track conversion: ${error.message}`);
  return mapConversion(data);
}

export async function getAffiliateStats(affiliateId: string): Promise<AffiliateStats> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Get all referrals
  const { data: referrals } = await supabase
    .from('user_referrals')
    .select('id, created_at')
    .eq('affiliate_id', affiliateId);

  // Get all conversions
  const { data: conversions } = await supabase
    .from('affiliate_conversions')
    .select('*')
    .eq('affiliate_id', affiliateId);

  // Get payouts
  const { data: payouts } = await supabase
    .from('affiliate_payouts')
    .select('amount, status')
    .eq('affiliate_id', affiliateId);

  const totalReferrals = referrals?.length || 0;
  const totalConversions = conversions?.length || 0;
  const totalRevenue = conversions?.reduce((sum, c) => sum + c.purchase_amount, 0) || 0;
  const totalEarnings = conversions?.reduce((sum, c) => sum + c.commission_amount, 0) || 0;
  const paidEarnings = payouts
    ?.filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0) || 0;
  const pendingEarnings = conversions
    ?.filter(c => c.status === 'pending')
    .reduce((sum, c) => sum + c.commission_amount, 0) || 0;

  const last30DaysReferrals = referrals?.filter(
    r => new Date(r.created_at) >= thirtyDaysAgo
  ).length || 0;
  const last30DaysConversions = conversions?.filter(
    c => new Date(c.created_at) >= thirtyDaysAgo
  ).length || 0;
  const last30DaysEarnings = conversions
    ?.filter(c => new Date(c.created_at) >= thirtyDaysAgo)
    .reduce((sum, c) => sum + c.commission_amount, 0) || 0;

  return {
    totalReferrals,
    totalConversions,
    conversionRate: totalReferrals > 0 ? totalConversions / totalReferrals : 0,
    totalRevenue,
    totalEarnings,
    pendingEarnings,
    paidEarnings,
    last30DaysReferrals,
    last30DaysConversions,
    last30DaysEarnings,
  };
}

export async function getAffiliateEarnings(affiliateId: string): Promise<AffiliateEarnings> {
  const { data: conversions } = await supabase
    .from('affiliate_conversions')
    .select('commission_amount, status')
    .eq('affiliate_id', affiliateId);

  const { data: payouts } = await supabase
    .from('affiliate_payouts')
    .select('amount, status')
    .eq('affiliate_id', affiliateId);

  const total = conversions?.reduce((sum, c) => sum + c.commission_amount, 0) || 0;
  const pending = conversions
    ?.filter(c => c.status === 'pending')
    .reduce((sum, c) => sum + c.commission_amount, 0) || 0;
  const paid = payouts
    ?.filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0) || 0;
  const available = total - pending - paid;

  return { total, pending, paid, available };
}

export async function requestPayout(affiliateId: string, amount: number): Promise<string> {
  const earnings = await getAffiliateEarnings(affiliateId);
  
  if (amount > earnings.available) {
    throw new Error('Insufficient available balance');
  }

  const { data, error } = await supabase
    .from('affiliate_payouts')
    .insert({
      affiliate_id: affiliateId,
      amount,
      status: 'pending',
    })
    .select('id')
    .single();

  if (error) throw new Error(`Failed to request payout: ${error.message}`);
  return data.id;
}

// Helper mappers
function mapAffiliate(data: any): Affiliate {
  return {
    id: data.id,
    userId: data.user_id,
    code: data.code,
    commissionRate: data.commission_rate,
    isActive: data.is_active,
    stripeConnectedAccountId: data.stripe_connected_account_id,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

function mapConversion(data: any): Conversion {
  return {
    id: data.id,
    affiliateId: data.affiliate_id,
    userId: data.user_id,
    transactionId: data.transaction_id,
    purchaseAmount: data.purchase_amount,
    commissionAmount: data.commission_amount,
    status: data.status,
    createdAt: new Date(data.created_at),
  };
}
