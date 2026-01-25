// PremiumBadge Component - Badge for premium users

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePurchaseContext } from '@/context/PurchaseContext';

interface PremiumBadgeProps {
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  showIfNotPremium?: boolean;
}

export function PremiumBadge({ size = 'medium', style, showIfNotPremium = false }: PremiumBadgeProps) {
  const { isPremium } = usePurchaseContext();

  if (!isPremium && !showIfNotPremium) {
    return null;
  }

  const sizeStyles = {
    small: {
      container: styles.containerSmall,
      icon: 12,
      text: styles.textSmall,
    },
    medium: {
      container: styles.containerMedium,
      icon: 16,
      text: styles.textMedium,
    },
    large: {
      container: styles.containerLarge,
      icon: 20,
      text: styles.textLarge,
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <View style={[styles.container, currentSize.container, style]}>
      <Ionicons name="star" size={currentSize.icon} color="#1A1A2E" />
      <Text style={[styles.text, currentSize.text]}>PRO</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    borderRadius: 20,
  },
  containerSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 2,
  },
  containerMedium: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  containerLarge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 6,
  },
  text: {
    color: '#1A1A2E',
    fontWeight: 'bold',
  },
  textSmall: {
    fontSize: 10,
  },
  textMedium: {
    fontSize: 12,
  },
  textLarge: {
    fontSize: 14,
  },
});

export default PremiumBadge;
