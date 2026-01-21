import { useEffect } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing } from '../../theme';

// Level colors matching HeatProgress
const LEVEL_COLORS = [
  '#3B82F6', // Level 1 - Blue
  '#8B5CF6', // Level 2 - Purple
  '#F59E0B', // Level 3 - Amber
  '#EF4444', // Level 4 - Red
  '#DC2626', // Level 5 - Deep red
];

const LEVEL_NAMES = {
  fr: ['', 'Brise-glace', 'On se rechauffe', 'Ca chauffe', "C'est chaud", 'NO LIMIT'],
  en: ['', 'Ice Breaker', 'Warming Up', 'Getting Hot', 'On Fire', 'NO LIMIT'],
};

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

  const color = LEVEL_COLORS[level - 1] || LEVEL_COLORS[0];
  const name = LEVEL_NAMES[language][level] || '';

  useEffect(() => {
    if (visible) {
      // Haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Simple fade in
      opacity.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.ease) });

      // Auto close after 1.5 seconds
      const timer = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 200 }, () => {
          runOnJS(onComplete)();
        });
      }, 1500);

      return () => clearTimeout(timer);
    } else {
      opacity.value = 0;
    }
  }, [visible, level]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View style={[styles.overlay, animatedStyle]}>
        <View style={styles.container}>
          {/* Level number */}
          <Text style={[styles.levelNumber, { color }]}>
            {level}
          </Text>

          {/* Level name */}
          <Text style={[styles.levelName, { color }]}>
            {name}
          </Text>

          {/* Progress dots */}
          <View style={styles.dotsContainer}>
            {[1, 2, 3, 4, 5].map((i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i <= level && { backgroundColor: LEVEL_COLORS[i - 1] },
                ]}
              />
            ))}
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    alignItems: 'center',
  },
  levelNumber: {
    fontSize: 80,
    fontWeight: '800',
    marginBottom: spacing[2],
  },
  levelName: {
    fontSize: 24,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: spacing[6],
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.background.tertiary,
  },
});
