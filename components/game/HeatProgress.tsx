import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, borderRadius, spacing } from '../../theme';

// Configuration
export const CARDS_PER_LEVEL = 10;
export const MAX_HEAT_LEVEL = 5;
export const TOTAL_CARDS = CARDS_PER_LEVEL * MAX_HEAT_LEVEL;

// Level colors - gradient from cool to hot
const LEVEL_COLORS = [
  '#3B82F6', // Level 1 - Blue (cool)
  '#8B5CF6', // Level 2 - Purple
  '#F59E0B', // Level 3 - Amber
  '#EF4444', // Level 4 - Red
  '#DC2626', // Level 5 - Deep red (hot)
];

// Level names for each language
const LEVEL_NAMES = {
  fr: ['', 'Brise-glace', 'On se rechauffe', 'Ca chauffe', "C'est chaud", 'NO LIMIT'],
  en: ['', 'Ice Breaker', 'Warming Up', 'Getting Hot', 'On Fire', 'NO LIMIT'],
};

interface HeatProgressProps {
  currentHeat: number;
  currentRound: number;
  language?: 'fr' | 'en';
  cardType?: 'truth' | 'dare' | 'group';
  onLevelChange?: (newLevel: number) => void;
}

// Card type colors (matching GameCard)
const CARD_TYPE_COLORS = {
  truth: '#8B5CF6', // Purple
  dare: '#EF4444', // Red
  group: '#F59E0B', // Amber
};

// Card type background colors (matching GameCard)
const CARD_TYPE_BG_COLORS = {
  truth: '#1A1428',
  dare: '#1A0D10',
  group: '#1A1408',
};

function LevelSegment({
  index,
  isActive,
  isCurrent,
  progress,
  isNew,
}: {
  index: number;
  isActive: boolean;
  isCurrent: boolean;
  progress: number;
  isNew: boolean;
}) {
  const fillWidth = useSharedValue(isActive ? (isCurrent ? progress : 1) : 0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isNew && isActive) {
      // New level animation - pulse effect
      scale.value = withSequence(
        withSpring(1.1, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 150 })
      );
    }

    fillWidth.value = withSpring(isActive ? (isCurrent ? progress : 1) : 0, {
      damping: 15,
      stiffness: 100,
    });
  }, [isActive, isCurrent, progress, isNew]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    width: `${fillWidth.value * 100}%`,
  }));

  return (
    <Animated.View style={[styles.segmentContainer, containerStyle]}>
      <View style={[styles.segment, isActive && styles.segmentActive]}>
        <Animated.View
          style={[
            styles.segmentFill,
            fillStyle,
            { backgroundColor: LEVEL_COLORS[index] },
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
  onLevelChange,
}: HeatProgressProps) {
  const accentColor = CARD_TYPE_COLORS[cardType] || CARD_TYPE_COLORS.truth;
  const bgColor = CARD_TYPE_BG_COLORS[cardType] || CARD_TYPE_BG_COLORS.truth;
  const prevHeatRef = useRef(currentHeat);
  const levelTextScale = useSharedValue(1);
  const levelTextOpacity = useSharedValue(1);

  // Calculate progress within current level (0-1)
  // After reaching max level (50 cards), keep progress at 100%
  const isMaxedOut = currentRound > TOTAL_CARDS;
  const progressInLevel = isMaxedOut ? 1 : ((currentRound - 1) % CARDS_PER_LEVEL) / CARDS_PER_LEVEL;

  useEffect(() => {
    // Check if level changed
    if (currentHeat !== prevHeatRef.current && currentHeat > prevHeatRef.current) {
      // Haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Animate level text
      levelTextScale.value = withSequence(
        withSpring(1.15, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 150 })
      );
      levelTextOpacity.value = withSequence(
        withSpring(0.6, { damping: 15 }),
        withSpring(1, { damping: 15 })
      );

      // Callback
      if (onLevelChange) {
        onLevelChange(currentHeat);
      }

      prevHeatRef.current = currentHeat;
    }
  }, [currentHeat, currentRound]);

  const levelTextStyle = useAnimatedStyle(() => ({
    transform: [{ scale: levelTextScale.value }],
    opacity: levelTextOpacity.value,
  }));

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
            isNew={index === currentHeat - 1 && currentHeat !== prevHeatRef.current}
          />
        ))}
      </View>

      {/* Level name and counter */}
      <View style={styles.infoRow}>
        <Animated.Text style={[styles.levelName, levelTextStyle, { color: accentColor }]}>
          {levelName}
        </Animated.Text>
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
  },
  segmentActive: {
    backgroundColor: colors.background.tertiary,
  },
  segmentFill: {
    height: '100%',
    borderRadius: borderRadius.full,
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
