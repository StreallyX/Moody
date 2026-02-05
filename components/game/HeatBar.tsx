import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as Haptics from 'expo-haptics';
import { colors, borderRadius, spacing } from '../../theme';

// Configuration
export const CARDS_PER_LEVEL = 10;
export const MAX_HEAT_LEVEL = 5;

const LEVEL_NAMES = [
  '',
  'Brise-glace',
  'On se réchauffe',
  'Ça chauffe',
  "C'est chaud",
  'NO LIMIT',
];

const LEVEL_COLORS = [
  '',
  '#4A90D9', // Level 1 - Cool blue
  '#F5A623', // Level 2 - Warm orange
  '#E85D04', // Level 3 - Hot orange
  '#D00000', // Level 4 - Red
  '#9D0208', // Level 5 - Deep red
];

interface HeatBarProps {
  currentHeat: number;
  currentRound: number;
  onLevelChange?: (newLevel: number) => void;
}

function Flame({
  index,
  isActive,
  isNew
}: {
  index: number;
  isActive: boolean;
  isNew: boolean;
}) {
  const scale = useSharedValue(isActive ? 1 : 0.7);
  const opacity = useSharedValue(isActive ? 1 : 0.3);

  useEffect(() => {
    if (isNew && isActive) {
      // New flame animation - bounce effect
      scale.value = withSequence(
        withSpring(1.4, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 150 })
      );
      opacity.value = withSpring(1, { damping: 15 });
    } else if (isActive) {
      scale.value = withSpring(1, { damping: 15 });
      opacity.value = withSpring(1, { damping: 15 });
    } else {
      scale.value = withSpring(0.7, { damping: 15 });
      opacity.value = withSpring(0.3, { damping: 15 });
    }
  }, [isActive, isNew]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.flameContainer, animatedStyle]}>
      <Icon
        name="fire"
        size={28}
        color={isActive ? LEVEL_COLORS[index + 1] : colors.text.tertiary}
        style={{ opacity: isActive ? 1 : 0.3 }}
      />
      {isActive && (
        <View style={[styles.flameGlow, { backgroundColor: LEVEL_COLORS[index + 1] + '40' }]} />
      )}
    </Animated.View>
  );
}

export default function HeatBar({ currentHeat, currentRound, onLevelChange }: HeatBarProps) {
  const prevHeatRef = useRef(currentHeat);
  const levelTextOpacity = useSharedValue(1);
  const levelTextScale = useSharedValue(1);
  const barProgress = useSharedValue(0);

  // Calculate progress within current level (0-1)
  const progressInLevel = ((currentRound - 1) % CARDS_PER_LEVEL) / CARDS_PER_LEVEL;

  useEffect(() => {
    // Update progress bar
    barProgress.value = withSpring(progressInLevel, { damping: 15, stiffness: 100 });

    // Check if level changed
    if (currentHeat !== prevHeatRef.current) {
      // Haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Animate level text
      levelTextScale.value = withSequence(
        withSpring(1.2, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 150 })
      );
      levelTextOpacity.value = withSequence(
        withSpring(0.5, { damping: 15 }),
        withSpring(1, { damping: 15 })
      );

      // Callback
      if (onLevelChange) {
        onLevelChange(currentHeat);
      }

      prevHeatRef.current = currentHeat;
    }
  }, [currentHeat, currentRound, progressInLevel]);

  const levelTextStyle = useAnimatedStyle(() => ({
    transform: [{ scale: levelTextScale.value }],
    opacity: levelTextOpacity.value,
  }));

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${barProgress.value * 100}%`,
  }));

  return (
    <View style={styles.container}>
      {/* Flames row */}
      <View style={styles.flamesRow}>
        {[0, 1, 2, 3, 4].map((index) => (
          <Flame
            key={index}
            index={index}
            isActive={index < currentHeat}
            isNew={index === currentHeat - 1 && currentHeat !== prevHeatRef.current}
          />
        ))}
      </View>

      {/* Level name */}
      <Animated.Text style={[styles.levelName, levelTextStyle, { color: LEVEL_COLORS[currentHeat] }]}>
        {LEVEL_NAMES[currentHeat]}
      </Animated.Text>

      {/* Progress bar within level */}
      <View style={styles.progressBarContainer}>
        <Animated.View
          style={[
            styles.progressBarFill,
            progressBarStyle,
            { backgroundColor: LEVEL_COLORS[currentHeat] }
          ]}
        />
      </View>

      {/* Round counter */}
      <Text style={styles.roundCounter}>
        {currentRound} / {MAX_HEAT_LEVEL * CARDS_PER_LEVEL}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
  },
  flamesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  flameContainer: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  flameGlow: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    zIndex: -1,
  },
  levelName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing[2],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  progressBarContainer: {
    width: '80%',
    height: 6,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing[1],
  },
  progressBarFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  roundCounter: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
});
