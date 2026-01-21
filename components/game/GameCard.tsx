import { useEffect } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, borderRadius, spacing, shadows } from '../../theme';

// Card type configurations
const CARD_CONFIG = {
  truth: {
    label: { fr: 'VERITE', en: 'TRUTH' },
    color: '#8B5CF6', // Purple
    backgroundColor: '#1A1428',
    icon: '?',
  },
  dare: {
    label: { fr: 'DEFI', en: 'DARE' },
    color: '#EF4444', // Red
    backgroundColor: '#1A0D10',
    icon: '!',
  },
  group: {
    label: { fr: 'GROUPE', en: 'GROUP' },
    color: '#F59E0B', // Amber
    backgroundColor: '#1A1408',
    icon: '*',
  },
};

interface Challenge {
  id: string;
  type: 'truth' | 'dare' | 'group';
  text: string;
}

interface GameCardProps {
  challenge: Challenge;
  playerName: string;
  secondPlayer?: string;
  thirdPlayer?: string;
  leastDrunkPlayer?: string;
  language?: 'fr' | 'en';
  onNext: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function GameCard({
  challenge,
  playerName,
  secondPlayer = '',
  thirdPlayer = '',
  leastDrunkPlayer = '',
  language = 'fr',
  onNext,
}: GameCardProps) {
  const insets = useSafeAreaInsets();
  const buttonScale = useSharedValue(1);
  const cardOpacity = useSharedValue(0);
  const cardTranslateY = useSharedValue(20);

  const config = CARD_CONFIG[challenge.type] || CARD_CONFIG.truth;

  // Replace player placeholders with actual player names
  const displayText = challenge.text
    .replace(/%PLAYER%/g, playerName)
    .replace(/%PLAYER2%/g, secondPlayer)
    .replace(/%PLAYER3%/g, thirdPlayer)
    .replace(/%LOSER%/g, leastDrunkPlayer);

  useEffect(() => {
    // Card entrance animation
    cardOpacity.value = withSpring(1, { damping: 15 });
    cardTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
  }, [challenge.id]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Button animation
    buttonScale.value = withSequence(
      withSpring(0.95, { damping: 10, stiffness: 400 }),
      withSpring(1, { damping: 15, stiffness: 200 })
    );

    // Small delay for animation to complete
    setTimeout(onNext, 100);
  };

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardTranslateY.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <View style={[styles.container, { backgroundColor: config.backgroundColor, paddingBottom: insets.bottom + spacing[2] }]}>
      <Animated.View style={[styles.card, cardStyle]}>
        {/* Type badge */}
        <View style={[styles.badge, { borderColor: config.color }]}>
          <Text style={[styles.badgeIcon, { color: config.color }]}>{config.icon}</Text>
          <Text style={[styles.badgeText, { color: config.color }]}>
            {config.label[language]}
          </Text>
        </View>

        {/* Challenge text */}
        <Text style={styles.challengeText}>{displayText}</Text>

        {/* Player highlight - only show for truth/dare, not group */}
        {playerName && challenge.type !== 'group' && (
          <View style={[styles.playerTag, { backgroundColor: config.color + '20' }]}>
            <Text style={[styles.playerName, { color: config.color }]}>{playerName}</Text>
          </View>
        )}
      </Animated.View>

      {/* Next button */}
      <AnimatedPressable
        onPress={handlePress}
        style={[styles.button, buttonStyle, { backgroundColor: config.color }]}
      >
        <Text style={styles.buttonText}>
          {language === 'fr' ? 'Suivant' : 'Next'}
        </Text>
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing[4],
    justifyContent: 'space-between',
  },
  card: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: borderRadius.full,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    marginBottom: spacing[8],
    gap: spacing[2],
  },
  badgeIcon: {
    fontSize: 18,
    fontWeight: '800',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
  },
  challengeText: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: 38,
    letterSpacing: 0.5,
  },
  playerTag: {
    marginTop: spacing[6],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.lg,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  button: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[8],
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    marginBottom: spacing[2],
    ...shadows.md,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: 1,
  },
});
