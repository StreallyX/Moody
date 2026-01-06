// Paywall Component - Main paywall screen

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePurchaseContext } from '@/context/PurchaseContext';
import type { Package } from '@/types/purchases';

interface PaywallProps {
  onClose?: () => void;
  onPurchaseSuccess?: () => void;
}

const FEATURES = [
  { icon: 'infinite', text: 'Unlimited games' },
  { icon: 'game-controller', text: 'All game modes' },
  { icon: 'ban', text: 'No advertisements' },
  { icon: 'star', text: 'Exclusive content' },
  { icon: 'flame', text: 'Caliente mode' },
  { icon: 'dice', text: 'Mini-games pack' },
  { icon: 'stats-chart', text: 'Stats & history' },
];

export function Paywall({ onClose, onPurchaseSuccess }: PaywallProps) {
  const { offerings, isPremium, isLoading, error, purchase, restore } = usePurchaseContext();
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // Auto-select annual package
  React.useEffect(() => {
    if (offerings?.annual && !selectedPackage) {
      setSelectedPackage(offerings.annual);
    } else if (offerings?.availablePackages[0] && !selectedPackage) {
      setSelectedPackage(offerings.availablePackages[0]);
    }
  }, [offerings]);

  const handlePurchase = async () => {
    if (!selectedPackage) return;

    setIsPurchasing(true);
    try {
      const result = await purchase(selectedPackage.rcPackage);
      
      if (result.success) {
        Alert.alert('Success!', 'Welcome to Moody Premium!', [
          { text: 'OK', onPress: onPurchaseSuccess },
        ]);
      } else if (result.error && !result.cancelled) {
        Alert.alert('Purchase Failed', result.error.message);
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      const result = await restore();
      
      if (result.success) {
        Alert.alert('Restored!', 'Your purchases have been restored.', [
          { text: 'OK', onPress: onPurchaseSuccess },
        ]);
      } else {
        Alert.alert('No Purchases Found', 'We couldn\'t find any previous purchases to restore.');
      }
    } finally {
      setIsRestoring(false);
    }
  };

  if (isPremium) {
    return (
      <View style={styles.container}>
        <View style={styles.premiumBanner}>
          <Ionicons name="checkmark-circle" size={64} color="#FFD700" />
          <Text style={styles.premiumTitle}>You're Premium!</Text>
          <Text style={styles.premiumSubtitle}>Enjoy all features</Text>
        </View>
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading offers...</Text>
      </View>
    );
  }

  if (error || !offerings) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#FF6B6B" />
        <Text style={styles.errorText}>{error || 'Unable to load offers'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => {}}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        {onClose && (
          <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
            <Ionicons name="close" size={28} color="#FFF" />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>Unlock Premium</Text>
        <Text style={styles.subtitle}>Get the full Moody experience</Text>
      </View>

      {/* Features */}
      <View style={styles.featuresContainer}>
        {FEATURES.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Ionicons name={feature.icon as any} size={24} color="#FFD700" />
            <Text style={styles.featureText}>{feature.text}</Text>
          </View>
        ))}
      </View>

      {/* Packages */}
      <View style={styles.packagesContainer}>
        {offerings.monthly && (
          <PackageOption
            pkg={offerings.monthly}
            isSelected={selectedPackage?.identifier === offerings.monthly.identifier}
            onSelect={() => setSelectedPackage(offerings.monthly!)}
            label="Monthly"
          />
        )}
        {offerings.annual && (
          <PackageOption
            pkg={offerings.annual}
            isSelected={selectedPackage?.identifier === offerings.annual.identifier}
            onSelect={() => setSelectedPackage(offerings.annual!)}
            label="Annual"
            badge="Best Value"
          />
        )}
        {offerings.lifetime && (
          <PackageOption
            pkg={offerings.lifetime}
            isSelected={selectedPackage?.identifier === offerings.lifetime.identifier}
            onSelect={() => setSelectedPackage(offerings.lifetime!)}
            label="Lifetime"
          />
        )}
      </View>

      {/* Purchase Button */}
      <TouchableOpacity
        style={[styles.purchaseButton, isPurchasing && styles.purchaseButtonDisabled]}
        onPress={handlePurchase}
        disabled={isPurchasing || !selectedPackage}
      >
        {isPurchasing ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.purchaseButtonText}>Continue</Text>
        )}
      </TouchableOpacity>

      {/* Restore */}
      <TouchableOpacity
        style={styles.restoreButton}
        onPress={handleRestore}
        disabled={isRestoring}
      >
        {isRestoring ? (
          <ActivityIndicator size="small" color="#AAA" />
        ) : (
          <Text style={styles.restoreButtonText}>Restore Purchases</Text>
        )}
      </TouchableOpacity>

      {/* Terms */}
      <Text style={styles.terms}>
        Payment will be charged to your App Store account. Subscription automatically renews unless
        canceled at least 24 hours before the end of the current period.
      </Text>
    </ScrollView>
  );
}

// Package Option Component
interface PackageOptionProps {
  pkg: Package;
  isSelected: boolean;
  onSelect: () => void;
  label: string;
  badge?: string;
}

function PackageOption({ pkg, isSelected, onSelect, label, badge }: PackageOptionProps) {
  return (
    <TouchableOpacity
      style={[styles.packageOption, isSelected && styles.packageOptionSelected]}
      onPress={onSelect}
    >
      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      <View style={styles.packageContent}>
        <Text style={styles.packageLabel}>{label}</Text>
        <Text style={styles.packagePrice}>{pkg.product.priceString}</Text>
        {pkg.packageType === 'ANNUAL' && (
          <Text style={styles.packageSubtext}>per year</Text>
        )}
        {pkg.packageType === 'MONTHLY' && (
          <Text style={styles.packageSubtext}>per month</Text>
        )}
      </View>
      <View style={[styles.radio, isSelected && styles.radioSelected]}>
        {isSelected && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
  },
  loadingText: {
    color: '#FFF',
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    padding: 20,
  },
  errorText: {
    color: '#FFF',
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  closeIcon: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#AAA',
    marginTop: 8,
  },
  featuresContainer: {
    backgroundColor: '#252542',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    color: '#FFF',
    fontSize: 16,
    marginLeft: 12,
  },
  packagesContainer: {
    marginBottom: 24,
  },
  packageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252542',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  packageOptionSelected: {
    borderColor: '#FF6B6B',
  },
  badge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: '#1A1A2E',
    fontSize: 12,
    fontWeight: 'bold',
  },
  packageContent: {
    flex: 1,
  },
  packageLabel: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  packagePrice: {
    color: '#FF6B6B',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  packageSubtext: {
    color: '#AAA',
    fontSize: 14,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#AAA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#FF6B6B',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF6B6B',
  },
  purchaseButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  purchaseButtonDisabled: {
    opacity: 0.7,
  },
  purchaseButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  restoreButton: {
    alignItems: 'center',
    padding: 12,
  },
  restoreButtonText: {
    color: '#AAA',
    fontSize: 14,
  },
  terms: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
  premiumBanner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumTitle: {
    color: '#FFD700',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 16,
  },
  premiumSubtitle: {
    color: '#FFF',
    fontSize: 16,
    marginTop: 8,
  },
  closeButton: {
    backgroundColor: '#252542',
    borderRadius: 12,
    padding: 16,
    margin: 20,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Paywall;
