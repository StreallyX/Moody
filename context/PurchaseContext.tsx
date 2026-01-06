// PurchaseContext - Global purchase state provider

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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

interface PurchaseContextType {
  // State
  offerings: Offering | null;
  customerInfo: CustomerInfo | null;
  isPremium: boolean;
  hasMiniGames: boolean;
  hasCalienteMode: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  purchase: (pkg: PurchasesPackage) => Promise<PurchaseResult>;
  restore: () => Promise<PurchaseResult>;
  refresh: () => Promise<void>;
  setUserId: (userId: string) => Promise<void>;
  logout: () => Promise<void>;
}

const PurchaseContext = createContext<PurchaseContextType | undefined>(undefined);

interface PurchaseProviderProps {
  children: ReactNode;
  userId?: string;
}

export function PurchaseProvider({ children, userId }: PurchaseProviderProps) {
  const [offerings, setOfferings] = useState<Offering | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derived state
  const isPremium = customerInfo?.entitlements.active[ENTITLEMENTS.PREMIUM] !== undefined;
  const hasMiniGames = isPremium || customerInfo?.entitlements.active[ENTITLEMENTS.MINI_GAMES_PACK] !== undefined;
  const hasCalienteMode = isPremium || customerInfo?.entitlements.active[ENTITLEMENTS.CALIENTE_MODE] !== undefined;

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, []);

  // Re-identify when userId changes
  useEffect(() => {
    if (isInitialized && userId) {
      identifyUser(userId).then(setCustomerInfo).catch(console.error);
    }
  }, [userId, isInitialized]);

  // Listen to customer info updates
  useEffect(() => {
    Purchases.addCustomerInfoUpdateListener((info: CustomerInfo) => {
      setCustomerInfo(info);
    });
    // Note: addCustomerInfoUpdateListener returns void in newer versions
    // Cleanup is handled internally by RevenueCat
  }, []);

  const initialize = async () => {
    try {
      setIsLoading(true);
      setError(null);

      await initializePurchases(userId);

      const [offeringsData, info] = await Promise.all([
        getOfferings(),
        getCustomerInfo(),
      ]);

      setOfferings(offeringsData);
      setCustomerInfo(info);
      setIsInitialized(true);
    } catch (err: any) {
      console.error('Failed to initialize purchases:', err);
      setError(err.message || 'Failed to initialize purchases');
    } finally {
      setIsLoading(false);
    }
  };

  const purchase = async (pkg: PurchasesPackage): Promise<PurchaseResult> => {
    setError(null);
    const result = await purchasePackage(pkg, userId);

    if (result.success && result.customerInfo) {
      setCustomerInfo(result.customerInfo);
    } else if (result.error && !result.cancelled) {
      setError(result.error.message);
    }

    return result;
  };

  const restore = async (): Promise<PurchaseResult> => {
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
  };

  const refresh = async (): Promise<void> => {
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
  };

  const setUserId = async (newUserId: string): Promise<void> => {
    try {
      const info = await identifyUser(newUserId);
      setCustomerInfo(info);
    } catch (err: any) {
      console.error('Failed to set user ID:', err);
      setError(err.message);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await resetUser();
      setCustomerInfo(null);
    } catch (err: any) {
      console.error('Failed to logout:', err);
    }
  };

  const value: PurchaseContextType = {
    offerings,
    customerInfo,
    isPremium,
    hasMiniGames,
    hasCalienteMode,
    isLoading,
    isInitialized,
    error,
    purchase,
    restore,
    refresh,
    setUserId,
    logout,
  };

  return (
    <PurchaseContext.Provider value={value}>
      {children}
    </PurchaseContext.Provider>
  );
}

export function usePurchaseContext(): PurchaseContextType {
  const context = useContext(PurchaseContext);
  if (context === undefined) {
    throw new Error('usePurchaseContext must be used within a PurchaseProvider');
  }
  return context;
}

export default PurchaseContext;
