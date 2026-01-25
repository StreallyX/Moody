# Affiliate / Creator Code System

This document describes the affiliate/creator code system for Moody, allowing creators to earn commissions by referring new users.

## Overview

The affiliate system enables:
- Creators to generate unique referral codes
- Users to apply referral codes at signup
- Automatic commission tracking on purchases
- Payouts via Stripe Connect

## Architecture

### Database Tables

- `affiliates` - Stores affiliate accounts and codes
- `user_referrals` - Links users to their referrer
- `affiliate_conversions` - Tracks purchases from referred users
- `affiliate_payouts` - Payout requests and history
- `referral_attempts` - Audit log for anti-fraud

### Services

#### `affiliateService.ts`
Core affiliate logic:
- `createAffiliateCode(userId)` - Generate unique code for user
- `validateCode(code)` - Check if code exists and is active
- `applyCode(userId, code)` - Link user to affiliate
- `trackConversion(userId, amount, txId)` - Record purchase commission
- `getAffiliateStats(affiliateId)` - Dashboard statistics
- `getAffiliateEarnings(affiliateId)` - Earnings breakdown
- `requestPayout(affiliateId, amount)` - Request withdrawal

#### `payoutService.ts`
Stripe Connect integration:
- `createConnectedAccount(affiliateId, email)` - Onboard to Stripe
- `processPayoutRequest(payoutId)` - Execute payout transfer
- `getPayoutHistory(affiliateId)` - List past payouts
- Minimum payout threshold: $20

### React Hooks

#### `useAffiliate`
For affiliate creators:
```tsx
const {
  isAffiliate,
  affiliate,
  stats,
  earnings,
  payoutHistory,
  stripeConnected,
  createCode,
  requestPayoutAmount,
  connectStripe,
} = useAffiliate();
```

#### `useReferral`
For referred users:
```tsx
const {
  appliedReferral,
  pendingCode,
  applyReferralCode,
  storePendingCode,
  applyPendingCode,
} = useReferral();
```

## Commission Structure

- Default commission rate: 10%
- Commission calculated on purchase amount
- Pending until purchase confirmed (not refunded)
- Available for payout after confirmation period

## Anti-Fraud Measures

### Rate Limiting
- Max 5 code applications per user per hour
- Prevents abuse of referral system

### Self-Referral Prevention
- Users cannot apply their own affiliate code
- Checked at application time

### Suspicious Activity Detection
- New account flagging (< 1 hour old)
- Multiple attempt tracking (> 10/day triggers block)
- Audit logging of all referral attempts

### Payout Validation
- Minimum threshold: $20
- Maximum single payout: $10,000
- Balance verification before request

## Stripe Connect Integration

### Onboarding Flow
1. Creator clicks "Connect Stripe" in dashboard
2. Redirected to Stripe Express onboarding
3. Completes identity verification
4. Returns to app with connected account

### Payout Flow
1. Creator requests payout from available balance
2. System creates payout record (pending)
3. Admin/cron processes payout
4. Stripe transfer executed to connected account
5. Status updated to completed/failed

## Usage Examples

### Creating an Affiliate Code
```tsx
import { useAffiliate } from '@/hooks/useAffiliate';

function BecomeAffiliate() {
  const { createCode, loading } = useAffiliate();
  
  return (
    <Button onPress={createCode} disabled={loading}>
      Create My Code
    </Button>
  );
}
```

### Applying a Referral Code
```tsx
import { useReferral } from '@/hooks/useReferral';

function SignupScreen() {
  const { applyReferralCode } = useReferral();
  const [code, setCode] = useState('');
  
  const handleApply = async () => {
    try {
      await applyReferralCode(code);
      Alert.alert('Success', 'Referral code applied!');
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };
}
```

### Tracking a Purchase
```tsx
import { trackConversion } from '@/services/affiliateService';

async function handlePurchaseComplete(userId, amount, transactionId) {
  // Track conversion for affiliate commission
  await trackConversion(userId, amount, transactionId);
}
```

## Environment Variables

```env
STRIPE_SECRET_KEY=sk_...
APP_URL=https://moody.app
```

## Future Enhancements

- Tiered commission rates based on performance
- Custom codes (vanity codes)
- Referral link generation with UTM tracking
- Real-time conversion notifications
- Affiliate leaderboard
- Multi-currency support
