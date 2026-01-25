// useEntitlements Hook - Entitlement management with caching

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkEntitlement, getActiveEntitlements } from '@/services/purchaseService';
import { ENTITLEMENTS, ENTITLEMENT_FEATURES, PREMIUM_FEATURES } from '@/config/offerings';
import type { EntitlementState, EntitlementId } from '@/types/purchases';

const ENTITLEMENTS_CACHE_KEY = '@moody_entitlements';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CachedEntitlements {
  data: EntitlementState;
  timestamp: number;
}

interface UseEntitlementsReturn extends EntitlementState {
  hasFeature: (feature: string) => boolean;
  checkFeatureAccess: (feature: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useEntitlements(): UseEntitlementsReturn {
  const [state, setState] = useState<EntitlementState>({
    premium: false,
    miniGamesPack: false,
    calienteMode: false,
    isLoading: true,
  });

  // Load entitlements on mount
  useEffect(() => {
    loadEntitlements();
  }, []);

  // Load entitlements with cache
  const loadEntitlements = async () => {
    try {
      // Try to load from cache first
      const cached = await getCachedEntitlements();
      if (cached) {
        setState({ ...cached, isLoading: false });
        // Refresh in background if cache is stale
        if (Date.now() - (await getCacheTimestamp()) > CACHE_DURATION) {
          refreshEntitlements();
        }
        return;
      }

      // No cache, fetch fresh
      await refreshEntitlements();
    } catch (error) {
      console.error('Failed to load entitlements:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Refresh entitlements from RevenueCat
  const refreshEntitlements = async () => {
    try {
      const [premium, miniGamesPack, calienteMode] = await Promise.all([
        checkEntitlement(ENTITLEMENTS.PREMIUM),
        checkEntitlement(ENTITLEMENTS.MINI_GAMES_PACK),
        checkEntitlement(ENTITLEMENTS.CALIENTE_MODE),
      ]);

      const newState: EntitlementState = {
        premium,
        miniGamesPack,
        calienteMode,
        isLoading: false,
      };

      setState(newState);
      await cacheEntitlements(newState);
    } catch (error) {
      console.error('Failed to refresh entitlements:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Check if user has access to a specific feature
  const hasFeature = useCallback((feature: string): boolean => {
    // Premium unlocks most features
    if (state.premium && ENTITLEMENT_FEATURES[ENTITLEMENTS.PREMIUM]?.includes(feature)) {
      return true;
    }

    // Check mini games pack
    if (feature === PREMIUM_FEATURES.MINI_GAMES && (state.premium || state.miniGamesPack)) {
      return true;
    }

    // Check caliente mode
    if (feature === PREMIUM_FEATURES.CALIENTE_MODE && (state.premium || state.calienteMode)) {
      return true;
    }

    return false;
  }, [state]);

  // Async check for feature access (fetches fresh data)
  const checkFeatureAccess = useCallback(async (feature: string): Promise<boolean> => {
    // First check local state
    if (hasFeature(feature)) {
      return true;
    }

    // Fetch fresh entitlements
    try {
      const activeEntitlements = await getActiveEntitlements();
      
      // Check if any active entitlement grants this feature
      for (const [entId, ent] of Object.entries(activeEntitlements)) {
        if (ent.isActive && ENTITLEMENT_FEATURES[entId]?.includes(feature)) {
          return true;
        }
      }
    } catch (error) {
      console.error('Failed to check feature access:', error);
    }

    return false;
  }, [hasFeature]);

  // Public refresh function
  const refresh = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    await refreshEntitlements();
  }, []);

  return {
    ...state,
    hasFeature,
    checkFeatureAccess,
    refresh,
  };
}

// Cache helpers
async function cacheEntitlements(data: EntitlementState): Promise<void> {
  try {
    const cached: CachedEntitlements = {
      data,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(ENTITLEMENTS_CACHE_KEY, JSON.stringify(cached));
  } catch (error) {
    console.error('Failed to cache entitlements:', error);
  }
}

async function getCachedEntitlements(): Promise<EntitlementState | null> {
  try {
    const cached = await AsyncStorage.getItem(ENTITLEMENTS_CACHE_KEY);
    if (!cached) return null;

    const parsed: CachedEntitlements = JSON.parse(cached);
    
    // Check if cache is still valid
    if (Date.now() - parsed.timestamp > CACHE_DURATION * 2) {
      return null; // Cache too old
    }

    return parsed.data;
  } catch (error) {
    return null;
  }
}

async function getCacheTimestamp(): Promise<number> {
  try {
    const cached = await AsyncStorage.getItem(ENTITLEMENTS_CACHE_KEY);
    if (!cached) return 0;
    const parsed: CachedEntitlements = JSON.parse(cached);
    return parsed.timestamp;
  } catch {
    return 0;
  }
}

export default useEntitlements;
