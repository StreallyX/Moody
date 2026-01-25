// Purchase Types - RevenueCat integration types

import type { PurchasesPackage, CustomerInfo } from 'react-native-purchases';

export interface Offering {
  identifier: string;
  serverDescription: string;
  availablePackages: Package[];
  monthly?: Package;
  annual?: Package;
  lifetime?: Package;
}

export interface Package {
  identifier: string;
  packageType: PackageType;
  product: Product;
  offeringIdentifier: string;
  rcPackage: PurchasesPackage; // Original RevenueCat package
}

export interface Product {
  identifier: string;
  title: string;
  description: string;
  price: number;
  priceString: string;
  currencyCode: string;
  introPrice?: IntroductoryPrice;
}

export interface IntroductoryPrice {
  price: number;
  priceString: string;
  period: string;
  periodUnit: string;
  periodNumberOfUnits: number;
}

export type PackageType = 
  | 'MONTHLY'
  | 'ANNUAL'
  | 'LIFETIME'
  | 'WEEKLY'
  | 'SIX_MONTH'
  | 'THREE_MONTH'
  | 'TWO_MONTH'
  | 'CUSTOM'
  | 'UNKNOWN';

export interface Entitlement {
  identifier: string;
  isActive: boolean;
  willRenew: boolean;
  periodType: string;
  latestPurchaseDate: Date | null;
  originalPurchaseDate: Date | null;
  expirationDate: Date | null;
  productIdentifier: string;
  isSandbox: boolean;
}

export interface PurchaseResult {
  success: boolean;
  customerInfo?: CustomerInfo;
  error?: PurchaseError;
  cancelled?: boolean;
}

export interface PurchaseError {
  code: string;
  message: string;
  userCancelled?: boolean;
}

export interface PurchaseState {
  offerings: Offering | null;
  isPremium: boolean;
  isLoading: boolean;
  error: string | null;
  customerInfo: CustomerInfo | null;
}

export interface EntitlementState {
  premium: boolean;
  miniGamesPack: boolean;
  calienteMode: boolean;
  isLoading: boolean;
}

export type EntitlementId = 'premium' | 'mini_games_pack' | 'caliente_mode';
