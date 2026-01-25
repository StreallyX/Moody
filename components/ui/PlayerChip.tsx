/**
 * PlayerChip - Premium pill-shaped player name chip
 * Features:
 * - Hot red border accent with glow
 * - Press animation with scale + glow pulse
 * - Remove animation (scale + slide out)
 * - Haptic feedback on remove
 */

import React from 'react';
import { StyleSheet, Text, Pressable, ViewStyle, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { colors, borderRadius, spacing, textStyles, springs, timings } from '../../theme';
import { haptics } from '../../utils/haptics';

interface PlayerChipProps {
  name: string;
  onRemove?: () => void;
  removable?: boolean;
  highlighted?: boolean;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function PlayerChip({
  name,
  onRemove,
  removable = true,
  highlighted = false,
  style,
}: PlayerChipProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const translateX = useSharedValue(0);

  const handlePressIn = () => {
    scale.value = withSpring(1.03, springs.snappy);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springs.bouncy);
  };

  const handleRemove = () => {
    if (!removable || !onRemove) return;

    haptics.lightTap();

    // Animate out then call onRemove
    scale.value = withTiming(0.8, timings.fast);
    opacity.value = withTiming(0, timings.fast);
    translateX.value = withTiming(-50, timings.fast, () => {
      runOnJS(onRemove)();
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handleRemove}
      disabled={!removable}
      style={[
        styles.chip,
        highlighted && styles.highlighted,
        animatedStyle,
        style,
      ]}
    >
      {removable && (
        <View style={styles.removeIconContainer}>
          <Text style={styles.removeIcon}>✕</Text>
        </View>
      )}
      <Text style={[styles.name, highlighted && styles.highlightedText]}>
        {name}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.full,
    paddingLeft: spacing[2],
    paddingRight: spacing[4],
    paddingVertical: spacing[2] + 2,
    borderWidth: 2,
    borderColor: colors.primary.main,
    marginHorizontal: spacing[2],
    gap: spacing[2],
    // Red glow - glossy effect
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  highlighted: {
    backgroundColor: colors.primary.dark,
    borderColor: colors.primary.light,
  },
  removeIconContainer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(224, 32, 32, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeIcon: {
    fontSize: 12,
    color: colors.primary.light,
    fontWeight: '700',
  },
  name: {
    ...textStyles.playerName,
    color: colors.text.primary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  highlightedText: {
    color: colors.text.primary,
  },
});
