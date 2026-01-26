/**
 * IAP Service - Google Play Billing & App Store direct integration
 * Uses react-native-iap for official in-app purchases
 *
 * Note: In development (Expo Go), IAP is mocked. Real purchases only work in production builds.
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

// Product IDs - must match Google Play Console / App Store Connect
export const PRODUCT_IDS = {
  COUPLES: Platform.select({
    android: 'moody_couples',
    ios: 'moody_couples',
    default: 'moody_couples',
  })!,
  CALIENTE: Platform.select({
    android: 'moody_caliente',
    ios: 'moody_caliente',
    default: 'moody_caliente',
  })!,
};

// All product IDs as array
export const ALL_PRODUCT_IDS = [PRODUCT_IDS.COUPLES, PRODUCT_IDS.CALIENTE];

// Local cache key for purchases
const PURCHASES_CACHE_KEY = '@moody_iap_purchases';

// Types
export interface Product {
  productId: string;
  title: string;
  description: string;
  price: string;
  localizedPrice: string;
  currency: string;
}

export interface PurchaseResult {
  success: boolean;
  productId?: string;
  transactionId?: string;
  error?: string;
  cancelled?: boolean;
}

// Track initialization state
let isInitialized = false;
let availableProducts: Product[] = [];
let RNIap: any = null;

// Check if we're in a native environment where IAP can work
const isNativeIAPAvailable = (): boolean => {
  // IAP only works in production builds, not Expo Go
  return !__DEV__ && Platform.OS !== 'web';
};

// Try to load react-native-iap (only works in production builds)
const loadIAPModule = async (): Promise<boolean> => {
  // Always use mock in development - react-native-iap requires native modules
  if (__DEV__ || Platform.OS === 'web') {
    console.log('IAP: Running in dev mode, using mock');
    return false;
  }

  // In production, try to load the module
  try {
    // Dynamic require to avoid bundling issues in dev
    RNIap = require('react-native-iap');
    return true;
  } catch (error) {
    console.warn('IAP: Could not load react-native-iap:', error);
    return false;
  }
};

/**
 * Initialize IAP connection
 */
export async function initializeIAP(): Promise<boolean> {
  if (isInitialized) return true;

  const iapLoaded = await loadIAPModule();

  if (!iapLoaded || !RNIap) {
    // Use mock products in development
    availableProducts = getMockProducts();
    isInitialized = true;
    console.log('IAP: Initialized with mock products (dev mode)');
    return true;
  }

  try {
    // Initialize connection to store
    await RNIap.initConnection();

    // Get available products
    const products = await RNIap.getProducts({ skus: ALL_PRODUCT_IDS });
    availableProducts = products.map((p: any) => ({
      productId: p.productId,
      title: p.title,
      description: p.description,
      price: p.price,
      localizedPrice: p.localizedPrice,
      currency: p.currency,
    }));

    console.log('IAP: Initialized with real products:', availableProducts.map(p => p.productId));
    isInitialized = true;
    return true;
  } catch (error) {
    console.error('IAP: Failed to initialize:', error);
    // Fall back to mock products
    availableProducts = getMockProducts();
    isInitialized = true;
    return true;
  }
}

/**
 * Get mock products for development
 */
function getMockProducts(): Product[] {
  return [
    {
      productId: PRODUCT_IDS.COUPLES,
      title: 'Couples Mode',
      description: 'Unlock couples mode',
      price: '4.99',
      localizedPrice: '4,99 €',
      currency: 'EUR',
    },
    {
      productId: PRODUCT_IDS.CALIENTE,
      title: 'Caliente Mode',
      description: 'Unlock caliente mode',
      price: '4.99',
      localizedPrice: '4,99 €',
      currency: 'EUR',
    },
  ];
}

/**
 * Get available products with prices
 */
export async function getProducts(): Promise<Product[]> {
  if (!isInitialized) {
    await initializeIAP();
  }
  return availableProducts;
}

/**
 * Get a specific product by ID
 */
export async function getProduct(productId: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find(p => p.productId === productId) || null;
}

/**
 * Purchase a product
 */
export async function purchaseProduct(productId: string): Promise<PurchaseResult> {
  if (!isInitialized) {
    const init = await initializeIAP();
    if (!init) {
      return { success: false, error: 'Store not available' };
    }
  }

  // In development, simulate purchase
  if (!RNIap || __DEV__) {
    console.log('IAP: Simulating purchase in dev mode for:', productId);

    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Save purchase locally and to database
    await savePurchase(productId, `dev_${Date.now()}`);

    return {
      success: true,
      productId,
      transactionId: `dev_${Date.now()}`,
    };
  }

  try {
    // Request purchase
    const purchase = await RNIap.requestPurchase({
      sku: productId,
      andDangerouslyFinishTransactionAutomaticallyIOS: false,
    });

    // Handle purchase result
    if (purchase) {
      const purchaseData = Array.isArray(purchase) ? purchase[0] : purchase;

      // Acknowledge/finish the purchase
      if (Platform.OS === 'android') {
        await RNIap.acknowledgePurchaseAndroid({
          token: purchaseData.purchaseToken!,
        });
      } else {
        await RNIap.finishTransaction({ purchase: purchaseData });
      }

      // Save purchase locally and to database
      await savePurchase(productId, purchaseData.transactionId || '');

      return {
        success: true,
        productId,
        transactionId: purchaseData.transactionId,
      };
    }

    return { success: false, error: 'Purchase failed' };
  } catch (error: any) {
    console.error('IAP: Purchase error:', error);

    // Handle user cancellation
    if (error.code === 'E_USER_CANCELLED' || error.message?.includes('cancelled')) {
      return { success: false, cancelled: true };
    }

    return { success: false, error: error.message || 'Purchase failed' };
  }
}

/**
 * Restore previous purchases
 */
export async function restorePurchases(): Promise<string[]> {
  if (!isInitialized) {
    await initializeIAP();
  }

  // In development, return local purchases
  if (!RNIap || __DEV__) {
    return getLocalPurchases();
  }

  try {
    const purchases = await RNIap.getAvailablePurchases();
    const restoredProductIds: string[] = [];

    for (const purchase of purchases) {
      if (ALL_PRODUCT_IDS.includes(purchase.productId)) {
        await savePurchase(purchase.productId, purchase.transactionId || '');
        restoredProductIds.push(purchase.productId);
      }
    }

    console.log('IAP: Restored purchases:', restoredProductIds);
    return restoredProductIds;
  } catch (error) {
    console.error('IAP: Restore purchases error:', error);
    return getLocalPurchases();
  }
}

/**
 * Check if a product has been purchased
 */
export async function hasPurchased(productId: string): Promise<boolean> {
  // Check local cache first
  const localPurchases = await getLocalPurchases();
  if (localPurchases.includes(productId)) {
    return true;
  }

  // Check database
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
      .from('user_purchases')
      .select('mode_id')
      .eq('user_id', user.id)
      .eq('mode_id', productIdToModeId(productId))
      .maybeSingle();

    if (data) {
      // Sync to local cache
      await saveLocalPurchase(productId);
      return true;
    }
  } catch (error) {
    console.error('IAP: Error checking purchase:', error);
  }

  return false;
}

/**
 * Get all purchased product IDs
 */
export async function getPurchasedProducts(): Promise<string[]> {
  const localPurchases = await getLocalPurchases();

  // Also check database
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('user_purchases')
        .select('mode_id')
        .eq('user_id', user.id);

      if (data) {
        const dbPurchases = data.map(row => modeIdToProductId(row.mode_id));
        // Merge with local
        const allPurchases = [...new Set([...localPurchases, ...dbPurchases])];
        return allPurchases;
      }
    }
  } catch (error) {
    console.error('IAP: Error getting purchases:', error);
  }

  return localPurchases;
}

/**
 * Close IAP connection (call on app unmount)
 */
export async function closeIAP(): Promise<void> {
  if (!RNIap) return;

  try {
    await RNIap.endConnection();
    isInitialized = false;
  } catch (error) {
    console.error('IAP: Error closing:', error);
  }
}

// ============ Helper Functions ============

/**
 * Convert product ID to mode ID (for database)
 */
function productIdToModeId(productId: string): string {
  if (productId === PRODUCT_IDS.COUPLES) return 'couples';
  if (productId === PRODUCT_IDS.CALIENTE) return 'caliente';
  return productId;
}

/**
 * Convert mode ID to product ID
 */
function modeIdToProductId(modeId: string): string {
  if (modeId === 'couples') return PRODUCT_IDS.COUPLES;
  if (modeId === 'caliente') return PRODUCT_IDS.CALIENTE;
  return modeId;
}

/**
 * Save purchase to database and local cache
 */
async function savePurchase(productId: string, transactionId: string): Promise<void> {
  const modeId = productIdToModeId(productId);

  // Save locally
  await saveLocalPurchase(productId);

  // Save to database
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('user_purchases')
        .upsert({
          user_id: user.id,
          mode_id: modeId,
          purchased_at: new Date().toISOString(),
          transaction_id: transactionId,
        }, {
          onConflict: 'user_id,mode_id',
        });
      console.log(`IAP: Purchase saved to database: ${modeId}`);
    }
  } catch (error) {
    console.error('IAP: Error saving purchase to database:', error);
  }
}

/**
 * Save purchase to local storage
 */
async function saveLocalPurchase(productId: string): Promise<void> {
  try {
    const purchases = await getLocalPurchases();
    if (!purchases.includes(productId)) {
      purchases.push(productId);
      await AsyncStorage.setItem(PURCHASES_CACHE_KEY, JSON.stringify(purchases));
    }
  } catch (error) {
    console.error('IAP: Error saving local purchase:', error);
  }
}

/**
 * Get purchases from local storage
 */
async function getLocalPurchases(): Promise<string[]> {
  try {
    const data = await AsyncStorage.getItem(PURCHASES_CACHE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('IAP: Error getting local purchases:', error);
    return [];
  }
}

/**
 * Clear all local purchases (for debug)
 */
export async function clearLocalPurchases(): Promise<void> {
  await AsyncStorage.removeItem(PURCHASES_CACHE_KEY);
}
