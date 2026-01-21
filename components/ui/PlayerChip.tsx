/**
 * PlayerChip - Pill-shaped player name chip
 * Features:
 * - Red border accent
 * - Remove animation (scale + slide out)
 * - Haptic feedback on remove
 */

import React from 'react';
import { StyleSheet, Text, Pressable, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
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
    scale.value = withSpring(0.95, springs.snappy);
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
      {removable && <Text style={styles.removeIcon}>✕</Text>}
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
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderWidth: 1,
    borderColor: colors.secondary.main,
    marginHorizontal: spacing[1],
    gap: spacing[2],
  },
  highlighted: {
    backgroundColor: colors.secondary.main,
    borderColor: colors.secondary.dark,
  },
  removeIcon: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  name: {
    ...textStyles.playerName,
    color: colors.text.primary,
  },
  highlightedText: {
    color: colors.text.inverse,
  },
});
