import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, borderRadius, spacing } from '../../theme';

// Configuration
export const CARDS_PER_LEVEL = 10;
export const MAX_HEAT_LEVEL = 5;
export const TOTAL_CARDS = CARDS_PER_LEVEL * MAX_HEAT_LEVEL;

// Level colors - gradient from cool to hot
const LEVEL_COLORS = [
  '#3B82F6', // Level 1 - Blue
  colors.modes.soft.primary, // Level 2 - Purple
  colors.modes.caliente.primary, // Level 3 - Orange
  colors.primary.main, // Level 4 - Red
  colors.primary.light, // Level 5 - Bright red
];

// Level names
const LEVEL_NAMES = {
  fr: ['', 'Brise-glace', 'On se réchauffe', 'Ça chauffe', "C'est chaud", 'NO LIMIT'],
  en: ['', 'Ice Breaker', 'Warming Up', 'Getting Hot', 'On Fire', 'NO LIMIT'],
};

interface HeatProgressProps {
  currentHeat: number;
  currentRound: number;
  language?: 'fr' | 'en';
  cardType?: 'truth' | 'dare' | 'group';
}

// Card type background colors
const CARD_TYPE_BG_COLORS = {
  truth: '#120812',
  dare: '#120608',
  group: '#120A06',
};

function LevelSegment({
  index,
  isActive,
  isCurrent,
  progress,
  justCompleted,
}: {
  index: number;
  isActive: boolean;
  isCurrent: boolean;
  progress: number;
  justCompleted: boolean;
}) {
  const fillWidth = useSharedValue(isActive ? (isCurrent ? progress : 1) : 0);
  const glowOpacity = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    fillWidth.value = withSpring(isActive ? (isCurrent ? progress : 1) : 0, {
      damping: 15,
      stiffness: 100,
    });

    if (justCompleted) {
      // Pulse scale
      scale.value = withSequence(
        withSpring(1.1, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 150 })
      );
      // Glow pulse (3 times)
      glowOpacity.value = withSequence(
        withTiming(1, { duration: 150 }),
        withTiming(0.3, { duration: 150 }),
        withTiming(1, { duration: 150 }),
        withTiming(0.3, { duration: 150 }),
        withTiming(1, { duration: 150 }),
        withTiming(0, { duration: 300 })
      );
    }
  }, [isActive, isCurrent, progress, justCompleted]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    width: `${fillWidth.value * 100}%`,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const color = LEVEL_COLORS[index];

  return (
    <Animated.View style={[styles.segmentContainer, containerStyle]}>
      <View style={styles.segment}>
        <Animated.View
          style={[
            styles.segmentFill,
            fillStyle,
            { backgroundColor: color },
          ]}
        />
        {/* Glow overlay */}
        <Animated.View
          style={[
            styles.segmentGlow,
            glowStyle,
            {
              backgroundColor: color,
              shadowColor: color,
            },
          ]}
        />
      </View>
    </Animated.View>
  );
}

export default function HeatProgress({
  currentHeat,
  currentRound,
  language = 'fr',
  cardType = 'truth',
}: HeatProgressProps) {
  const bgColor = CARD_TYPE_BG_COLORS[cardType] || CARD_TYPE_BG_COLORS.truth;
  const prevHeatRef = useRef(currentHeat);
  const justLeveledUp = useRef(false);

  // Calculate progress within current level (0-1)
  const isMaxedOut = currentRound > TOTAL_CARDS;
  const progressInLevel = isMaxedOut ? 1 : ((currentRound - 1) % CARDS_PER_LEVEL) / CARDS_PER_LEVEL;

  useEffect(() => {
    if (currentHeat > prevHeatRef.current) {
      // Level up!
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      justLeveledUp.current = true;
      prevHeatRef.current = currentHeat;
    } else {
      justLeveledUp.current = false;
    }
  }, [currentHeat]);

  const levelName = LEVEL_NAMES[language][currentHeat] || '';
  const currentColor = LEVEL_COLORS[currentHeat - 1] || LEVEL_COLORS[0];

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Progress segments */}
      <View style={styles.segmentsRow}>
        {[0, 1, 2, 3, 4].map((index) => (
          <LevelSegment
            key={index}
            index={index}
            isActive={index < currentHeat}
            isCurrent={index === currentHeat - 1 && !isMaxedOut}
            progress={isMaxedOut || index < currentHeat - 1 ? 1 : (index === currentHeat - 1 ? progressInLevel : 0)}
            justCompleted={justLeveledUp.current && index === currentHeat - 2}
          />
        ))}
      </View>

      {/* Level name and counter */}
      <View style={styles.infoRow}>
        <Text style={[styles.levelName, { color: currentColor }]}>
          {levelName}
        </Text>
        <Text style={styles.roundCounter}>
          {currentRound <= TOTAL_CARDS ? `${currentRound} / ${TOTAL_CARDS}` : `${currentRound}`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
  },
  segmentsRow: {
    flexDirection: 'row',
    gap: spacing[1],
    marginBottom: spacing[2],
  },
  segmentContainer: {
    flex: 1,
  },
  segment: {
    height: 8,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    position: 'relative',
  },
  segmentFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  segmentGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: borderRadius.full,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelName: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  roundCounter: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
});
