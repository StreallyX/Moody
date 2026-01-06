// useAffiliate Hook - React hook for affiliate/creator functionality

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  createAffiliateCode,
  validateCode,
  getAffiliateStats,
  getAffiliateEarnings,
  requestPayout,
} from '@/services/affiliateService';
import {
  getPayoutHistory,
  createConnectedAccount,
  getConnectedAccountStatus,
  getMinimumPayoutThreshold,
} from '@/services/payoutService';
import type { Affiliate, AffiliateStats, AffiliateEarnings, Payout } from '@/types/affiliate';
import { supabase } from '@/lib/supabase';

interface UseAffiliateReturn {
  isAffiliate: boolean;
  affiliate: Affiliate | null;
  stats: AffiliateStats | null;
  earnings: AffiliateEarnings | null;
  payoutHistory: Payout[];
  stripeConnected: boolean;
  loading: boolean;
  error: string | null;
  createCode: () => Promise<void>;
  refreshStats: () => Promise<void>;
  requestPayoutAmount: (amount: number) => Promise<string>;
  connectStripe: () => Promise<string>;
  minimumPayout: number;
}

export function useAffiliate(): UseAffiliateReturn {
  const { user } = useAuth();
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [earnings, setEarnings] = useState<AffiliateEarnings | null>(null);
  const [payoutHistory, setPayoutHistory] = useState<Payout[]>([]);
  const [stripeConnected, setStripeConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const minimumPayout = getMinimumPayoutThreshold();

  // Check if user is already an affiliate
  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchAffiliate = async () => {
      try {
        const { data } = await supabase
          .from('affiliates')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (data) {
          setAffiliate({
            id: data.id,
            userId: data.user_id,
            code: data.code,
            commissionRate: data.commission_rate,
            isActive: data.is_active,
            stripeConnectedAccountId: data.stripe_connected_account_id,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
          });
        }
      } catch (err) {
        // Not an affiliate yet, that's fine
      } finally {
        setLoading(false);
      }
    };

    fetchAffiliate();
  }, [user?.id]);

  // Fetch stats and earnings when affiliate is loaded
  useEffect(() => {
    if (!affiliate?.id) return;

    const fetchData = async () => {
      try {
        const [statsData, earningsData, historyData, stripeStatus] = await Promise.all([
          getAffiliateStats(affiliate.id),
          getAffiliateEarnings(affiliate.id),
          getPayoutHistory(affiliate.id),
          getConnectedAccountStatus(affiliate.id),
        ]);

        setStats(statsData);
        setEarnings(earningsData);
        setPayoutHistory(historyData);
        setStripeConnected(stripeStatus.payoutsEnabled);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchData();
  }, [affiliate?.id]);

  const createCode = useCallback(async () => {
    if (!user?.id) throw new Error('Must be logged in');
    setLoading(true);
    setError(null);

    try {
      const newAffiliate = await createAffiliateCode(user.id);
      setAffiliate(newAffiliate);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const refreshStats = useCallback(async () => {
    if (!affiliate?.id) return;

    try {
      const [statsData, earningsData, historyData] = await Promise.all([
        getAffiliateStats(affiliate.id),
        getAffiliateEarnings(affiliate.id),
        getPayoutHistory(affiliate.id),
      ]);

      setStats(statsData);
      setEarnings(earningsData);
      setPayoutHistory(historyData);
    } catch (err: any) {
      setError(err.message);
    }
  }, [affiliate?.id]);

  const requestPayoutAmount = useCallback(async (amount: number): Promise<string> => {
    if (!affiliate?.id) throw new Error('Not an affiliate');
    if (!stripeConnected) throw new Error('Stripe account not connected');
    if (amount < minimumPayout) throw new Error(`Minimum payout is $${minimumPayout}`);

    const payoutId = await requestPayout(affiliate.id, amount);
    await refreshStats();
    return payoutId;
  }, [affiliate?.id, stripeConnected, minimumPayout, refreshStats]);

  const connectStripe = useCallback(async (): Promise<string> => {
    if (!affiliate?.id || !user?.email) throw new Error('Not an affiliate');

    const { onboardingUrl } = await createConnectedAccount(affiliate.id, user.email);
    return onboardingUrl;
  }, [affiliate?.id, user?.email]);

  return {
    isAffiliate: !!affiliate,
    affiliate,
    stats,
    earnings,
    payoutHistory,
    stripeConnected,
    loading,
    error,
    createCode,
    refreshStats,
    requestPayoutAmount,
    connectStripe,
    minimumPayout,
  };
}
