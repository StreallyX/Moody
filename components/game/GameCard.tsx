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

// Card type configurations - using theme-consistent colors
const CARD_CONFIG = {
  truth: {
    label: { fr: 'VERITE', en: 'TRUTH' },
    color: colors.modes.soft.primary, // Purple
    backgroundColor: '#120812',
    icon: '?',
  },
  dare: {
    label: { fr: 'DEFI', en: 'DARE' },
    color: colors.primary.main, // Red
    backgroundColor: '#120608',
    icon: '!',
  },
  group: {
    label: { fr: 'GROUPE', en: 'GROUP' },
    color: colors.modes.caliente.primary, // Orange
    backgroundColor: '#120A06',
    icon: '*',
  },
};

// Player name colors
const PLAYER_COLORS = {
  PLAYER: colors.semantic.gold, // Gold for main player
  PLAYER2: '#06B6D4', // Cyan for second player
  PLAYER3: '#10B981', // Green for third player
  LOSER: colors.secondary.main, // Pink for loser
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

// Render text with styled player names
function renderStyledText(
  text: string,
  playerName: string,
  secondPlayer: string,
  thirdPlayer: string,
  leastDrunkPlayer: string
) {
  // Define replacements with their colors
  const replacements = [
    { placeholder: '%PLAYER%', name: playerName, color: PLAYER_COLORS.PLAYER },
    { placeholder: '%PLAYER2%', name: secondPlayer, color: PLAYER_COLORS.PLAYER2 },
    { placeholder: '%PLAYER3%', name: thirdPlayer, color: PLAYER_COLORS.PLAYER3 },
    { placeholder: '%LOSER%', name: leastDrunkPlayer, color: PLAYER_COLORS.LOSER },
  ];

  // Build regex pattern for all placeholders
  const pattern = /%PLAYER%|%PLAYER2%|%PLAYER3%|%LOSER%/g;

  // Split text by placeholders
  const parts: { text: string; isPlayer: boolean; color?: string }[] = [];
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index), isPlayer: false });
    }

    // Find the replacement for this placeholder
    const replacement = replacements.find(r => r.placeholder === match[0]);
    if (replacement && replacement.name) {
      parts.push({ text: replacement.name, isPlayer: true, color: replacement.color });
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), isPlayer: false });
  }

  return parts.map((part, index) => (
    <Text
      key={index}
      style={part.isPlayer ? { fontWeight: '800', color: part.color } : undefined}
    >
      {part.text}
    </Text>
  ));
}

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

  const config = CARD_CONFIG[challenge.type] || CARD_CONFIG.truth;

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

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <View style={[styles.container, { backgroundColor: config.backgroundColor, paddingBottom: insets.bottom + spacing[2] }]}>
      <View style={styles.card}>
        {/* Type badge */}
        <View style={[styles.badge, { borderColor: config.color }]}>
          <Text style={[styles.badgeIcon, { color: config.color }]}>{config.icon}</Text>
          <Text style={[styles.badgeText, { color: config.color }]}>
            {config.label[language]}
          </Text>
        </View>

        {/* Challenge text with styled player names */}
        <Text style={styles.challengeText}>
          {renderStyledText(challenge.text, playerName, secondPlayer, thirdPlayer, leastDrunkPlayer)}
        </Text>

        {/* Player highlight - only show for truth/dare, not group */}
        {playerName && challenge.type !== 'group' && (
          <View style={[styles.playerTag, { backgroundColor: PLAYER_COLORS.PLAYER + '20' }]}>
            <Text style={[styles.playerTagName, { color: PLAYER_COLORS.PLAYER }]}>{playerName}</Text>
          </View>
        )}
      </View>

      {/* Next button */}
      <AnimatedPressable
        onPress={handlePress}
        style={[
          styles.button,
          buttonStyle,
          {
            backgroundColor: config.color,
            shadowColor: config.color,
            borderBottomColor: config.color + '80',
          }
        ]}
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
  playerTagName: {
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
    borderBottomWidth: 5,
    // Glow effect - shadowColor set dynamically
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: 1,
  },
});
