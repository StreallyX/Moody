/**
 * Moody - App Mascot Component
 * Animated demon character with various mood states
 *
 * States:
 * - idle: Subtle floating animation
 * - excited: Bounce/wiggle (game start, victories)
 * - teasing: Wink animation (locked modes)
 * - shocked: Surprised reaction
 * - seductive: Slow, coy animation
 *
 * Note: Currently uses emoji placeholder. Replace with SVG/Lottie assets.
 */

import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { colors, springs } from '../../theme';

export type MoodyMood = 'idle' | 'excited' | 'teasing' | 'shocked' | 'seductive';
export type MoodySize = 'sm' | 'md' | 'lg' | 'xl';

interface MoodyProps {
  mood?: MoodyMood;
  size?: MoodySize;
  style?: ViewStyle;
}

const EMOJI_MAP: Record<MoodyMood, string> = {
  idle: '😈',
  excited: '🤩',
  teasing: '😏',
  shocked: '😱',
  seductive: '😈',
};

const SIZE_MAP: Record<MoodySize, number> = {
  sm: 40,
  md: 60,
  lg: 80,
  xl: 120,
};

export default function Moody({ mood = 'idle', size = 'md', style }: MoodyProps) {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    // Cancel any existing animations
    cancelAnimation(translateY);
    cancelAnimation(scale);
    cancelAnimation(rotate);

    // Reset values
    translateY.value = 0;
    scale.value = 1;
    rotate.value = 0;
    opacity.value = 1;

    switch (mood) {
      case 'idle':
        // Gentle floating
        translateY.value = withRepeat(
          withSequence(
            withTiming(-6, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
            withTiming(6, { duration: 1500, easing: Easing.inOut(Easing.sin) })
          ),
          -1, // infinite
          true
        );
        break;

      case 'excited':
        // Bouncy wiggle
        scale.value = withRepeat(
          withSequence(
            withSpring(1.15, springs.bouncy),
            withSpring(0.95, springs.bouncy),
            withSpring(1.1, springs.bouncy),
            withSpring(1, springs.bouncy)
          ),
          -1,
          false
        );
        rotate.value = withRepeat(
          withSequence(
            withTiming(-10, { duration: 100 }),
            withTiming(10, { duration: 100 }),
            withTiming(-10, { duration: 100 }),
            withTiming(10, { duration: 100 }),
            withTiming(0, { duration: 100 })
          ),
          -1,
          false
        );
        break;

      case 'teasing':
        // Slow sway with occasional "wink" (scale pulse)
        rotate.value = withRepeat(
          withSequence(
            withTiming(-5, { duration: 800, easing: Easing.inOut(Easing.ease) }),
            withTiming(5, { duration: 800, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        scale.value = withRepeat(
          withSequence(
            withTiming(1, { duration: 2000 }),
            withSpring(1.1, springs.snappy),
            withSpring(1, springs.snappy)
          ),
          -1,
          false
        );
        break;

      case 'shocked':
        // Quick jump back
        translateY.value = withSequence(
          withSpring(-20, springs.stiff),
          withSpring(0, springs.bouncy)
        );
        scale.value = withSequence(
          withSpring(1.3, springs.stiff),
          withSpring(1, springs.bouncy)
        );
        break;

      case 'seductive':
        // Slow, smooth movement
        translateY.value = withRepeat(
          withSequence(
            withTiming(-4, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
            withTiming(4, { duration: 2000, easing: Easing.inOut(Easing.sin) })
          ),
          -1,
          true
        );
        rotate.value = withRepeat(
          withSequence(
            withTiming(-3, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
            withTiming(3, { duration: 3000, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        scale.value = withRepeat(
          withSequence(
            withTiming(1.02, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
            withTiming(0.98, { duration: 2000, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        break;
    }
  }, [mood]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  const fontSize = SIZE_MAP[size];

  return (
    <Animated.View style={[styles.container, animatedStyle, style]}>
      <View style={[styles.emojiContainer, { width: fontSize * 1.2, height: fontSize * 1.2 }]}>
        <Text style={[styles.emoji, { fontSize }]}>
          {EMOJI_MAP[mood]}
        </Text>
        {/* Glow effect */}
        <View
          style={[
            styles.glow,
            {
              width: fontSize,
              height: fontSize,
              borderRadius: fontSize / 2,
            },
          ]}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  emoji: {
    textAlign: 'center',
    zIndex: 2,
  },
  glow: {
    position: 'absolute',
    backgroundColor: colors.primary.main,
    opacity: 0.2,
    zIndex: 1,
  },
});
