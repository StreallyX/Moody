import { useEffect } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius } from '../../theme';

// Level colors matching HeatProgress (using theme)
const LEVEL_COLORS = [
  '#3B82F6', // Level 1 - Blue
  colors.modes.soft.primary, // Level 2 - Purple
  colors.modes.caliente.primary, // Level 3 - Orange
  colors.primary.main, // Level 4 - Red
  colors.primary.light, // Level 5 - Bright red
];

const LEVEL_NAMES = {
  fr: ['', 'Brise-glace', 'On se réchauffe', 'Ça chauffe', "C'est chaud", 'NO LIMIT'],
  en: ['', 'Ice Breaker', 'Warming Up', 'Getting Hot', 'On Fire', 'NO LIMIT'],
};

const LEVEL_EMOJIS = ['', '🧊', '🔥', '🔥🔥', '🔥🔥🔥', '💀'];

interface LevelUpOverlayProps {
  visible: boolean;
  level: number;
  language?: 'fr' | 'en';
  onComplete: () => void;
}

export default function LevelUpOverlay({
  visible,
  level,
  language = 'fr',
  onComplete,
}: LevelUpOverlayProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);
  const numberScale = useSharedValue(0.3);
  const glowOpacity = useSharedValue(0);

  const color = LEVEL_COLORS[level - 1] || LEVEL_COLORS[0];
  const name = LEVEL_NAMES[language][level] || '';
  const emoji = LEVEL_EMOJIS[level] || '';

  useEffect(() => {
    if (visible) {
      // Strong haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }, 100);

      // Animations
      opacity.value = withTiming(1, { duration: 150 });
      scale.value = withSpring(1, { damping: 12, stiffness: 150 });
      numberScale.value = withSequence(
        withSpring(1.2, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 150 })
      );
      glowOpacity.value = withSequence(
        withTiming(0.8, { duration: 200 }),
        withTiming(0.4, { duration: 300 }),
        withTiming(0.6, { duration: 300 }),
        withTiming(0.4, { duration: 300 })
      );

      // Auto close after 2 seconds
      const timer = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 300 });
        scale.value = withTiming(0.8, { duration: 300 }, () => {
          runOnJS(onComplete)();
        });
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      opacity.value = 0;
      scale.value = 0.5;
      numberScale.value = 0.3;
      glowOpacity.value = 0;
    }
  }, [visible, level]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const numberStyle = useAnimatedStyle(() => ({
    transform: [{ scale: numberScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <Animated.View style={[styles.container, containerStyle]}>
          {/* Glow background */}
          <Animated.View
            style={[
              styles.glowBackground,
              glowStyle,
              { backgroundColor: color }
            ]}
          />

          {/* Level badge */}
          <View style={[styles.levelBadge, { borderColor: color }]}>
            <Text style={[styles.levelLabel, { color }]}>
              {language === 'fr' ? 'NIVEAU' : 'LEVEL'}
            </Text>
          </View>

          {/* Level number */}
          <Animated.Text
            style={[
              styles.levelNumber,
              numberStyle,
              {
                color,
                textShadowColor: color,
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 30,
              }
            ]}
          >
            {level}
          </Animated.Text>

          {/* Level name */}
          <Text style={[styles.levelName, { color }]}>
            {name}
          </Text>

          {/* Emoji */}
          <Text style={styles.emoji}>{emoji}</Text>

          {/* Progress dots */}
          <View style={styles.dotsContainer}>
            {[1, 2, 3, 4, 5].map((i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i <= level && {
                    backgroundColor: LEVEL_COLORS[i - 1],
                    shadowColor: LEVEL_COLORS[i - 1],
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.8,
                    shadowRadius: 6,
                  },
                ]}
              />
            ))}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 5, 6, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    alignItems: 'center',
    paddingHorizontal: spacing[6],
  },
  glowBackground: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    top: '50%',
    left: '50%',
    marginTop: -125,
    marginLeft: -125,
    opacity: 0.15,
  },
  levelBadge: {
    borderWidth: 2,
    borderRadius: borderRadius.full,
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[4],
    marginBottom: spacing[4],
  },
  levelLabel: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 3,
  },
  levelNumber: {
    fontSize: 120,
    fontWeight: '900',
    marginBottom: spacing[2],
  },
  levelName: {
    fontSize: 28,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: spacing[4],
    textAlign: 'center',
  },
  emoji: {
    fontSize: 40,
    marginBottom: spacing[6],
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.background.tertiary,
  },
});
