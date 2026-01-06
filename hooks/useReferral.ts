// useReferral Hook - React hook for referred users

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { applyCode, validateCode } from '@/services/affiliateService';
import type { ReferralApplication } from '@/types/affiliate';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PENDING_REFERRAL_KEY = 'pending_referral_code';

interface UseReferralReturn {
  appliedReferral: ReferralApplication | null;
  pendingCode: string | null;
  loading: boolean;
  error: string | null;
  applyReferralCode: (code: string) => Promise<boolean>;
  storePendingCode: (code: string) => Promise<void>;
  applyPendingCode: () => Promise<boolean>;
  clearPendingCode: () => Promise<void>;
}

export function useReferral(): UseReferralReturn {
  const { user } = useAuth();
  const [appliedReferral, setAppliedReferral] = useState<ReferralApplication | null>(null);
  const [pendingCode, setPendingCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing referral and pending code
  useEffect(() => {
    const init = async () => {
      try {
        // Check for pending code in storage
        const stored = await AsyncStorage.getItem(PENDING_REFERRAL_KEY);
        if (stored) setPendingCode(stored);

        // Check if user has applied referral
        if (user?.id) {
          const { data } = await supabase
            .from('user_referrals')
            .select('code, affiliate_id, created_at')
            .eq('user_id', user.id)
            .single();

          if (data) {
            setAppliedReferral({
              code: data.code,
              affiliateId: data.affiliate_id,
              appliedAt: new Date(data.created_at),
            });
          }
        }
      } catch (err) {
        // No referral applied yet
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [user?.id]);

  // Store code for later application (before signup)
  const storePendingCode = useCallback(async (code: string) => {
    const affiliate = await validateCode(code);
    if (!affiliate) {
      throw new Error('Invalid referral code');
    }
    await AsyncStorage.setItem(PENDING_REFERRAL_KEY, code.toUpperCase());
    setPendingCode(code.toUpperCase());
  }, []);

  // Apply referral code
  const applyReferralCode = useCallback(async (code: string): Promise<boolean> => {
    if (!user?.id) {
      // Store for later if not logged in
      await storePendingCode(code);
      return false;
    }

    if (appliedReferral) {
      throw new Error('You already have a referral code applied');
    }

    setLoading(true);
    setError(null);

    try {
      await applyCode(user.id, code);
      
      // Fetch the applied referral
      const { data } = await supabase
        .from('user_referrals')
        .select('code, affiliate_id, created_at')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setAppliedReferral({
          code: data.code,
          affiliateId: data.affiliate_id,
          appliedAt: new Date(data.created_at),
        });
      }

      // Clear pending code
      await AsyncStorage.removeItem(PENDING_REFERRAL_KEY);
      setPendingCode(null);

      return true;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id, appliedReferral, storePendingCode]);

  // Apply pending code after signup
  const applyPendingCode = useCallback(async (): Promise<boolean> => {
    if (!pendingCode || !user?.id) return false;
    return applyReferralCode(pendingCode);
  }, [pendingCode, user?.id, applyReferralCode]);

  const clearPendingCode = useCallback(async () => {
    await AsyncStorage.removeItem(PENDING_REFERRAL_KEY);
    setPendingCode(null);
  }, []);

  return {
    appliedReferral,
    pendingCode,
    loading,
    error,
    applyReferralCode,
    storePendingCode,
    applyPendingCode,
    clearPendingCode,
  };
}
