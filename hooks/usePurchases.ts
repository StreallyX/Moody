// usePurchases Hook - React hook for RevenueCat purchases

import { useState, useEffect, useCallback } from 'react';
import Purchases, { CustomerInfo, PurchasesPackage } from 'react-native-purchases';
import {
  initializePurchases,
  getOfferings,
  purchasePackage,
  restorePurchases,
  getCustomerInfo,
  identifyUser,
  resetUser,
} from '@/services/purchaseService';
import { ENTITLEMENTS } from '@/config/offerings';
import type { Offering, PurchaseResult } from '@/types/purchases';

interface UsePurchasesReturn {
  offerings: Offering | null;
  isPremium: boolean;
  isLoading: boolean;
  error: string | null;
  customerInfo: CustomerInfo | null;
  purchase: (pkg: PurchasesPackage) => Promise<PurchaseResult>;
  restore: () => Promise<PurchaseResult>;
  refresh: () => Promise<void>;
}

export function usePurchases(userId?: string): UsePurchasesReturn {
  const [offerings, setOfferings] = useState<Offering | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user has premium entitlement
  const isPremium = customerInfo?.entitlements.active[ENTITLEMENTS.PREMIUM] !== undefined;

  // Initialize and fetch data
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Initialize RevenueCat
        await initializePurchases(userId);

        // Identify user if provided
        if (userId) {
          await identifyUser(userId);
        }

        // Fetch offerings and customer info in parallel
        const [offeringsData, info] = await Promise.all([
          getOfferings(),
          getCustomerInfo(),
        ]);

        if (isMounted) {
          setOfferings(offeringsData);
          setCustomerInfo(info);
        }
      } catch (err: any) {
        console.error('Failed to initialize purchases:', err);
        if (isMounted) {
          setError(err.message || 'Failed to load purchase options');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  // Listen to customer info updates
  useEffect(() => {
    const listener = Purchases.addCustomerInfoUpdateListener((info: CustomerInfo) => {
      setCustomerInfo(info);
    });

    return () => {
      // listener may be void or an object with remove method
      const sub = listener as unknown as { remove?: () => void } | undefined;
      if (sub && typeof sub.remove === 'function') {
        sub.remove();
      }
    };
  }, []);

  // Purchase a package
  const purchase = useCallback(async (pkg: PurchasesPackage): Promise<PurchaseResult> => {
    setError(null);
    const result = await purchasePackage(pkg, userId);
    
    if (result.success && result.customerInfo) {
      setCustomerInfo(result.customerInfo);
    } else if (result.error && !result.cancelled) {
      setError(result.error.message);
    }

    return result;
  }, [userId]);

  // Restore purchases
  const restore = useCallback(async (): Promise<PurchaseResult> => {
    setError(null);
    setIsLoading(true);

    try {
      const result = await restorePurchases();
      
      if (result.customerInfo) {
        setCustomerInfo(result.customerInfo);
      }
      if (result.error) {
        setError(result.error.message);
      }

      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh offerings and customer info
  const refresh = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const [offeringsData, info] = await Promise.all([
        getOfferings(),
        getCustomerInfo(),
      ]);

      setOfferings(offeringsData);
      setCustomerInfo(info);
    } catch (err: any) {
      setError(err.message || 'Failed to refresh');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    offerings,
    isPremium,
    isLoading,
    error,
    customerInfo,
    purchase,
    restore,
    refresh,
  };
}

export default usePurchases;
