/**
 * PurchaseContext - Global purchase state using react-native-iap
 * Simplified version without RevenueCat
 */

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import {
  initializeIAP,
  getProducts,
  getPurchasedProducts,
  restorePurchases as restoreIAPPurchases,
  hasPurchased,
  closeIAP,
  PRODUCT_IDS,
  Product,
} from '../services/iapService';
import { grantModeAccess } from '../lib/auth';

interface PurchaseContextType {
  // State
  products: Product[];
  purchasedProducts: string[];
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Derived state
  hasCouplesMode: boolean;
  hasCalienteMode: boolean;

  // Actions
  restore: () => Promise<string[]>;
  refresh: () => Promise<void>;
  checkPurchase: (productId: string) => Promise<boolean>;
}

const PurchaseContext = createContext<PurchaseContextType | undefined>(undefined);

interface PurchaseProviderProps {
  children: ReactNode;
  userId?: string;
}

export function PurchaseProvider({ children, userId }: PurchaseProviderProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [purchasedProducts, setPurchasedProducts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derived state
  const hasCouplesMode = purchasedProducts.includes(PRODUCT_IDS.COUPLES);
  const hasCalienteMode = purchasedProducts.includes(PRODUCT_IDS.CALIENTE);

  // Initialize on mount
  useEffect(() => {
    initialize();

    return () => {
      closeIAP();
    };
  }, []);

  // Refresh when userId changes (user logged in/out)
  useEffect(() => {
    if (isInitialized && userId) {
      refresh();
    }
  }, [userId, isInitialized]);

  const initialize = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Initialize IAP connection
      const success = await initializeIAP();

      if (success) {
        // Get products and purchases
        const [productList, purchased] = await Promise.all([
          getProducts(),
          getPurchasedProducts(),
        ]);

        setProducts(productList);
        setPurchasedProducts(purchased);

        // Grant access for purchased modes
        for (const productId of purchased) {
          if (productId === PRODUCT_IDS.COUPLES) {
            await grantModeAccess('couples');
          } else if (productId === PRODUCT_IDS.CALIENTE) {
            await grantModeAccess('caliente');
          }
        }
      }

      setIsInitialized(true);
    } catch (err: any) {
      console.error('Failed to initialize purchases:', err);
      setError(err.message || 'Failed to initialize purchases');
      setIsInitialized(true);
    } finally {
      setIsLoading(false);
    }
  };

  const restore = useCallback(async (): Promise<string[]> => {
    setError(null);
    setIsLoading(true);

    try {
      const restored = await restoreIAPPurchases();
      setPurchasedProducts(prev => [...new Set([...prev, ...restored])]);

      // Grant access for restored modes
      for (const productId of restored) {
        if (productId === PRODUCT_IDS.COUPLES) {
          await grantModeAccess('couples');
        } else if (productId === PRODUCT_IDS.CALIENTE) {
          await grantModeAccess('caliente');
        }
      }

      return restored;
    } catch (err: any) {
      setError(err.message || 'Failed to restore purchases');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const [productList, purchased] = await Promise.all([
        getProducts(),
        getPurchasedProducts(),
      ]);

      setProducts(productList);
      setPurchasedProducts(purchased);
    } catch (err: any) {
      setError(err.message || 'Failed to refresh');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkPurchase = useCallback(async (productId: string): Promise<boolean> => {
    return hasPurchased(productId);
  }, []);

  const value: PurchaseContextType = {
    products,
    purchasedProducts,
    isLoading,
    isInitialized,
    error,
    hasCouplesMode,
    hasCalienteMode,
    restore,
    refresh,
    checkPurchase,
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
