// LockedFeature Component - Wrapper for premium-only content

import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { usePurchaseContext } from '@/context/PurchaseContext';
import { useEntitlements } from '@/hooks/useEntitlements';
import { PREMIUM_FEATURES } from '@/config/offerings';

interface LockedFeatureProps {
  children: ReactNode;
  feature?: string;
  requirePremium?: boolean;
  requireMiniGames?: boolean;
  requireCaliente?: boolean;
  fallback?: ReactNode;
  style?: ViewStyle;
  lockMessage?: string;
  showUpgradeButton?: boolean;
}

export function LockedFeature({
  children,
  feature,
  requirePremium = false,
  requireMiniGames = false,
  requireCaliente = false,
  fallback,
  style,
  lockMessage = 'Unlock with Premium',
  showUpgradeButton = true,
}: LockedFeatureProps) {
  const router = useRouter();
  const { isPremium, hasMiniGames, hasCalienteMode } = usePurchaseContext();
  const { hasFeature } = useEntitlements();

  // Determine if user has access
  const hasAccess = (() => {
    if (requirePremium && !isPremium) return false;
    if (requireMiniGames && !hasMiniGames) return false;
    if (requireCaliente && !hasCalienteMode) return false;
    if (feature && !hasFeature(feature)) return false;
    return true;
  })();

  if (hasAccess) {
    return <>{children}</>;
  }

  // Show fallback or lock overlay
  if (fallback) {
    return <>{fallback}</>;
  }

  const handleUpgrade = () => {
    router.push('/paywall');
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.lockedContent}>
        {children}
      </View>
      <View style={styles.overlay}>
        <View style={styles.lockContainer}>
          <Ionicons name="lock-closed" size={32} color="#FFD700" />
          <Text style={styles.lockText}>{lockMessage}</Text>
          {showUpgradeButton && (
            <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
              <Text style={styles.upgradeButtonText}>Upgrade</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

// Convenience components for specific features
export function PremiumOnly({ children, ...props }: Omit<LockedFeatureProps, 'requirePremium'>) {
  return (
    <LockedFeature requirePremium {...props}>
      {children}
    </LockedFeature>
  );
}

export function MiniGamesOnly({ children, ...props }: Omit<LockedFeatureProps, 'requireMiniGames'>) {
  return (
    <LockedFeature requireMiniGames lockMessage="Unlock Mini-Games Pack" {...props}>
      {children}
    </LockedFeature>
  );
}

export function CalienteOnly({ children, ...props }: Omit<LockedFeatureProps, 'requireCaliente'>) {
  return (
    <LockedFeature requireCaliente lockMessage="Unlock Caliente Mode" {...props}>
      {children}
    </LockedFeature>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 12,
  },
  lockedContent: {
    opacity: 0.3,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 26, 46, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockContainer: {
    alignItems: 'center',
    padding: 20,
  },
  lockText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  upgradeButton: {
    marginTop: 16,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  upgradeButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default LockedFeature;
