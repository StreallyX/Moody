// Affiliate Validation Utils - Anti-fraud measures

import { supabase } from '@/lib/supabase';

// Rate limiting: max code applications per IP/user per time window
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_APPLICATIONS_PER_WINDOW = 5;

// In-memory rate limit store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

export async function validateCodeApplication(
  userId: string,
  code: string
): Promise<ValidationResult> {
  // Check rate limit
  const rateLimitKey = `apply:${userId}`;
  const now = Date.now();
  const rateLimit = rateLimitStore.get(rateLimitKey);

  if (rateLimit) {
    if (now < rateLimit.resetAt) {
      if (rateLimit.count >= MAX_APPLICATIONS_PER_WINDOW) {
        return {
          valid: false,
          reason: 'Too many code application attempts. Please try again later.',
        };
      }
      rateLimit.count++;
    } else {
      rateLimitStore.set(rateLimitKey, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    }
  } else {
    rateLimitStore.set(rateLimitKey, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  }

  // Validate code format
  if (!code || code.length < 4 || code.length > 20) {
    return { valid: false, reason: 'Invalid code format' };
  }

  // Check for suspicious patterns
  const suspiciousCheck = await detectSuspiciousActivity(userId);
  if (!suspiciousCheck.valid) {
    return suspiciousCheck;
  }

  return { valid: true };
}

export async function checkSelfReferral(
  userId: string,
  affiliateId: string
): Promise<boolean> {
  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('user_id')
    .eq('id', affiliateId)
    .single();

  return affiliate?.user_id === userId;
}

export async function detectSuspiciousActivity(
  userId: string
): Promise<ValidationResult> {
  // Check account age (new accounts are higher risk)
  const { data: user } = await supabase
    .from('profiles')
    .select('created_at')
    .eq('id', userId)
    .single();

  if (user) {
    const accountAge = Date.now() - new Date(user.created_at).getTime();
    const oneHour = 60 * 60 * 1000;
    
    if (accountAge < oneHour) {
      // Very new account - flag for review but allow
      console.warn(`[Affiliate] New account applying code: ${userId}`);
    }
  }

  // Check for multiple referral attempts from same device/IP
  // In production, implement device fingerprinting and IP tracking
  const { data: recentAttempts } = await supabase
    .from('referral_attempts')
    .select('id')
    .eq('user_id', userId)
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  if (recentAttempts && recentAttempts.length > 10) {
    return {
      valid: false,
      reason: 'Suspicious activity detected. Please contact support.',
    };
  }

  return { valid: true };
}

export function validatePayoutRequest(
  amount: number,
  availableBalance: number,
  minimumThreshold: number
): ValidationResult {
  if (amount <= 0) {
    return { valid: false, reason: 'Invalid payout amount' };
  }

  if (amount < minimumThreshold) {
    return { valid: false, reason: `Minimum payout is $${minimumThreshold}` };
  }

  if (amount > availableBalance) {
    return { valid: false, reason: 'Insufficient available balance' };
  }

  // Max single payout limit
  const maxPayout = 10000; // $10,000
  if (amount > maxPayout) {
    return { valid: false, reason: `Maximum single payout is $${maxPayout}` };
  }

  return { valid: true };
}

export async function logReferralAttempt(
  userId: string,
  code: string,
  success: boolean,
  reason?: string
): Promise<void> {
  try {
    await supabase.from('referral_attempts').insert({
      user_id: userId,
      code,
      success,
      failure_reason: reason,
    });
  } catch (err) {
    console.error('[Affiliate] Failed to log referral attempt:', err);
  }
}
