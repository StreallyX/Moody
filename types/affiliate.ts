// Affiliate/Creator Code System Types

export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface Affiliate {
  id: string;
  userId: string;
  code: string;
  commissionRate: number; // percentage (e.g., 0.10 for 10%)
  isActive: boolean;
  stripeConnectedAccountId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AffiliateStats {
  totalReferrals: number;
  totalConversions: number;
  conversionRate: number;
  totalRevenue: number;
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
  last30DaysReferrals: number;
  last30DaysConversions: number;
  last30DaysEarnings: number;
}

export interface Conversion {
  id: string;
  affiliateId: string;
  userId: string;
  transactionId: string;
  purchaseAmount: number;
  commissionAmount: number;
  status: 'pending' | 'confirmed' | 'reversed';
  createdAt: Date;
}

export interface Payout {
  id: string;
  affiliateId: string;
  amount: number;
  status: PayoutStatus;
  stripeTransferId?: string;
  requestedAt: Date;
  processedAt?: Date;
  failureReason?: string;
}

export interface AffiliateEarnings {
  total: number;
  pending: number;
  paid: number;
  available: number; // confirmed but not yet paid
}

export interface ReferralApplication {
  code: string;
  appliedAt: Date;
  affiliateId: string;
}
