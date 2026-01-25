// Purchase Service - RevenueCat integration

import Purchases, {
  PurchasesPackage,
  CustomerInfo,
  LOG_LEVEL,
  PurchasesOfferings,
  PurchasesOffering,
} from 'react-native-purchases';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { REVENUECAT_API_KEYS, ENTITLEMENTS } from '@/config/offerings';
import { trackConversion } from './affiliateService';
import type { Offering, Package, PurchaseResult, Entitlement } from '@/types/purchases';

const CUSTOMER_INFO_CACHE_KEY = '@moody_customer_info';

// Initialize RevenueCat SDK
export async function initializePurchases(userId?: string): Promise<void> {
  const apiKey = Platform.OS === 'ios' 
    ? REVENUECAT_API_KEYS.ios 
    : REVENUECAT_API_KEYS.android;

  if (!apiKey) {
    console.warn('RevenueCat API key not configured for', Platform.OS);
    return;
  }

  try {
    // Enable debug logs in development
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }

    // Configure with or without user ID
    if (userId) {
      Purchases.configure({ apiKey, appUserID: userId });
    } else {
      Purchases.configure({ apiKey });
    }

    console.log('RevenueCat initialized successfully');
  } catch (error) {
    console.error('Failed to initialize RevenueCat:', error);
    throw error;
  }
}

// Identify user (call after login)
export async function identifyUser(userId: string): Promise<CustomerInfo> {
  try {
    const { customerInfo } = await Purchases.logIn(userId);
    await cacheCustomerInfo(customerInfo);
    return customerInfo;
  } catch (error) {
    console.error('Failed to identify user:', error);
    throw error;
  }
}

// Reset user (call after logout)
export async function resetUser(): Promise<void> {
  try {
    await Purchases.logOut();
    await AsyncStorage.removeItem(CUSTOMER_INFO_CACHE_KEY);
  } catch (error) {
    console.error('Failed to reset user:', error);
  }
}

// Fetch available offerings
export async function getOfferings(): Promise<Offering | null> {
  try {
    const offerings: PurchasesOfferings = await Purchases.getOfferings();
    
    if (!offerings.current || offerings.current.availablePackages.length === 0) {
      console.log('No offerings available');
      return null;
    }

    return mapOffering(offerings.current);
  } catch (error) {
    console.error('Failed to fetch offerings:', error);
    throw error;
  }
}

// Purchase a package
export async function purchasePackage(
  pkg: PurchasesPackage,
  userId?: string
): Promise<PurchaseResult> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    
    // Cache updated customer info
    await cacheCustomerInfo(customerInfo);

    // Track conversion for affiliate system
    if (userId && pkg.product.price > 0) {
      await syncPurchaseWithAffiliate(userId, pkg.product.price, pkg.identifier);
    }

    return {
      success: true,
      customerInfo,
    };
  } catch (error: unknown) {
    const purchaseError = error as { userCancelled?: boolean; code?: string; message?: string };
    if (purchaseError.userCancelled) {
      return {
        success: false,
        cancelled: true,
        error: {
          code: 'USER_CANCELLED',
          message: 'Purchase was cancelled',
          userCancelled: true,
        },
      };
    }

    console.error('Purchase failed:', error);
    return {
      success: false,
      error: {
        code: purchaseError.code || 'UNKNOWN',
        message: purchaseError.message || 'Purchase failed. Please try again.',
      },
    };
  }
}

// Restore previous purchases
export async function restorePurchases(): Promise<PurchaseResult> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    await cacheCustomerInfo(customerInfo);

    const hasActiveEntitlements = Object.keys(customerInfo.entitlements.active).length > 0;

    return {
      success: hasActiveEntitlements,
      customerInfo,
      error: hasActiveEntitlements ? undefined : {
        code: 'NO_PURCHASES',
        message: 'No previous purchases found to restore.',
      },
    };
  } catch (error: unknown) {
    const restoreError = error as { code?: string; message?: string };
    console.error('Restore failed:', error);
    return {
      success: false,
      error: {
        code: restoreError.code || 'RESTORE_FAILED',
        message: restoreError.message || 'Failed to restore purchases. Please try again.',
      },
    };
  }
}

// Check if user has a specific entitlement
export async function checkEntitlement(entitlementId: string): Promise<boolean> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active[entitlementId] !== undefined;
  } catch (error) {
    console.error('Failed to check entitlement:', error);
    // Fall back to cached info
    const cached = await getCachedCustomerInfo();
    return cached?.entitlements.active[entitlementId] !== undefined;
  }
}

// Get current customer info
export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    await cacheCustomerInfo(customerInfo);
    return customerInfo;
  } catch (error) {
    console.error('Failed to get customer info:', error);
    return getCachedCustomerInfo();
  }
}

// Check premium status
export async function isPremiumUser(): Promise<boolean> {
  return checkEntitlement(ENTITLEMENTS.PREMIUM);
}

// Sync purchase with affiliate system
export async function syncPurchaseWithAffiliate(
  userId: string,
  purchaseAmount: number,
  transactionId: string
): Promise<void> {
  try {
    await trackConversion(userId, purchaseAmount, transactionId);
    console.log('Purchase synced with affiliate system');
  } catch (error) {
    // Don't fail the purchase if affiliate tracking fails
    console.error('Failed to sync with affiliate system:', error);
  }
}

// Get all active entitlements
export async function getActiveEntitlements(): Promise<Record<string, Entitlement>> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const entitlements: Record<string, Entitlement> = {};

    for (const [id, ent] of Object.entries(customerInfo.entitlements.active)) {
      const entInfo = ent as { identifier: string; isActive: boolean; willRenew: boolean; periodType: string; latestPurchaseDate: string | null; originalPurchaseDate: string | null; expirationDate: string | null; productIdentifier: string; isSandbox: boolean };
      entitlements[id] = {
        identifier: entInfo.identifier,
        isActive: entInfo.isActive,
        willRenew: entInfo.willRenew,
        periodType: entInfo.periodType,
        latestPurchaseDate: entInfo.latestPurchaseDate ? new Date(entInfo.latestPurchaseDate) : null,
        originalPurchaseDate: entInfo.originalPurchaseDate ? new Date(entInfo.originalPurchaseDate) : null,
        expirationDate: entInfo.expirationDate ? new Date(entInfo.expirationDate) : null,
        productIdentifier: entInfo.productIdentifier,
        isSandbox: entInfo.isSandbox,
      };
    }

    return entitlements;
  } catch (error) {
    console.error('Failed to get active entitlements:', error);
    return {};
  }
}

// Helper: Map RevenueCat offering to our type
function mapOffering(rcOffering: PurchasesOffering): Offering {
  return {
    identifier: rcOffering.identifier,
    serverDescription: rcOffering.serverDescription,
    availablePackages: rcOffering.availablePackages.map(mapPackage),
    monthly: rcOffering.monthly ?? undefined ? mapPackage(rcOffering.monthly!) : undefined,
    annual: rcOffering.annual ?? undefined ? mapPackage(rcOffering.annual!) : undefined,
    lifetime: rcOffering.lifetime ?? undefined ? mapPackage(rcOffering.lifetime!) : undefined,
  };
}

// Helper: Map RevenueCat package to our type
function mapPackage(rcPackage: PurchasesPackage): Package {
  return {
    identifier: rcPackage.identifier,
    packageType: rcPackage.packageType as Package['packageType'],
    offeringIdentifier: rcPackage.offeringIdentifier,
    rcPackage, // Keep original for purchase
    product: {
      identifier: rcPackage.product.identifier,
      title: rcPackage.product.title,
      description: rcPackage.product.description,
      price: rcPackage.product.price,
      priceString: rcPackage.product.priceString,
      currencyCode: rcPackage.product.currencyCode,
      introPrice: rcPackage.product.introPrice ? {
        price: rcPackage.product.introPrice.price,
        priceString: rcPackage.product.introPrice.priceString,
        period: rcPackage.product.introPrice.period,
        periodUnit: rcPackage.product.introPrice.periodUnit,
        periodNumberOfUnits: rcPackage.product.introPrice.periodNumberOfUnits,
      } : undefined,
    },
  };
}

// Helper: Cache customer info locally
async function cacheCustomerInfo(customerInfo: CustomerInfo): Promise<void> {
  try {
    await AsyncStorage.setItem(CUSTOMER_INFO_CACHE_KEY, JSON.stringify(customerInfo));
  } catch (error) {
    console.error('Failed to cache customer info:', error);
  }
}

// Helper: Get cached customer info
async function getCachedCustomerInfo(): Promise<CustomerInfo | null> {
  try {
    const cached = await AsyncStorage.getItem(CUSTOMER_INFO_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Failed to get cached customer info:', error);
    return null;
  }
}
