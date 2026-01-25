// RevenueCat Offerings Configuration

import { Platform } from 'react-native';

// Entitlement identifiers - must match RevenueCat dashboard
export const ENTITLEMENTS = {
  PREMIUM: 'premium',
  MINI_GAMES_PACK: 'mini_games_pack',
  CALIENTE_MODE: 'caliente_mode',
} as const;

// Product IDs for each platform - must match App Store Connect / Google Play Console
export const PRODUCT_IDS = {
  ios: {
    MONTHLY: 'com.tonorga.moody.premium.monthly',
    ANNUAL: 'com.tonorga.moody.premium.annual',
    LIFETIME: 'com.tonorga.moody.premium.lifetime',
    MINI_GAMES: 'com.tonorga.moody.minigames',
    CALIENTE: 'com.tonorga.moody.caliente',
  },
  android: {
    MONTHLY: 'moody_premium_monthly',
    ANNUAL: 'moody_premium_annual',
    LIFETIME: 'moody_premium_lifetime',
    MINI_GAMES: 'moody_minigames',
    CALIENTE: 'moody_caliente',
  },
} as const;

// Get platform-specific product IDs
export const getProductIds = () => {
  return Platform.OS === 'ios' ? PRODUCT_IDS.ios : PRODUCT_IDS.android;
};

// RevenueCat API Keys - Replace with your actual keys
export const REVENUECAT_API_KEYS = {
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || '',
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || '',
} as const;

// Offering identifiers
export const OFFERING_IDS = {
  DEFAULT: 'default',
  PREMIUM: 'premium_offering',
  MINI_GAMES: 'mini_games_offering',
} as const;

// Feature flags for premium content
export const PREMIUM_FEATURES = {
  UNLIMITED_GAMES: 'unlimited_games',
  ALL_MODES: 'all_modes',
  NO_ADS: 'no_ads',
  EXCLUSIVE_CONTENT: 'exclusive_content',
  MINI_GAMES: 'mini_games',
  CALIENTE_MODE: 'caliente_mode',
  STATS_HISTORY: 'stats_history',
} as const;

// Map entitlements to features
export const ENTITLEMENT_FEATURES: Record<string, string[]> = {
  [ENTITLEMENTS.PREMIUM]: [
    PREMIUM_FEATURES.UNLIMITED_GAMES,
    PREMIUM_FEATURES.ALL_MODES,
    PREMIUM_FEATURES.NO_ADS,
    PREMIUM_FEATURES.EXCLUSIVE_CONTENT,
    PREMIUM_FEATURES.STATS_HISTORY,
  ],
  [ENTITLEMENTS.MINI_GAMES_PACK]: [
    PREMIUM_FEATURES.MINI_GAMES,
  ],
  [ENTITLEMENTS.CALIENTE_MODE]: [
    PREMIUM_FEATURES.CALIENTE_MODE,
  ],
};
