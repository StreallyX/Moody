/**
 * Card - Reusable themed card component
 * Features:
 * - Consistent border-radius and shadows
 * - Entry animation (fade + slide up)
 * - Multiple variants
 */

import React, { useEffect } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { colors, borderRadius, spacing, cardShadows, springs } from '../../theme';

type CardVariant = 'default' | 'elevated' | 'outlined' | 'glow' | 'redGlow';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  animate?: boolean;
  animationDelay?: number;
  style?: ViewStyle;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export default function Card({
  children,
  variant = 'default',
  animate = true,
  animationDelay = 0,
  style,
  padding = 'md',
}: CardProps) {
  const opacity = useSharedValue(animate ? 0 : 1);
  const translateY = useSharedValue(animate ? 30 : 0);

  useEffect(() => {
    if (animate) {
      opacity.value = withDelay(animationDelay, withSpring(1, springs.gentle));
      translateY.value = withDelay(animationDelay, withSpring(0, springs.gentle));
    }
  }, [animate, animationDelay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const variantStyles = getVariantStyles(variant);
  const paddingStyle = getPaddingStyle(padding);

  return (
    <Animated.View
      style={[
        styles.card,
        variantStyles,
        paddingStyle,
        animatedStyle,
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

function getVariantStyles(variant: CardVariant): ViewStyle {
  switch (variant) {
    case 'default':
      return {
        backgroundColor: colors.background.secondary,
        ...cardShadows.default,
      };
    case 'elevated':
      return {
        backgroundColor: colors.background.secondary,
        ...cardShadows.elevated,
      };
    case 'outlined':
      return {
        backgroundColor: colors.background.secondary,
        borderWidth: 1,
        borderColor: colors.ui.border,
      };
    case 'glow':
      return {
        backgroundColor: colors.background.secondary,
        ...cardShadows.glow,
      };
    case 'redGlow':
      return {
        backgroundColor: colors.background.secondary,
        ...cardShadows.redGlow,
      };
    default:
      return {
        backgroundColor: colors.background.secondary,
      };
  }
}

function getPaddingStyle(padding: 'none' | 'sm' | 'md' | 'lg'): ViewStyle {
  switch (padding) {
    case 'none':
      return { padding: 0 };
    case 'sm':
      return { padding: spacing[3] };
    case 'md':
      return { padding: spacing[5] };
    case 'lg':
      return { padding: spacing[7] };
    default:
      return { padding: spacing[5] };
  }
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
  },
});
