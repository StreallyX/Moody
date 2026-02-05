import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View, ActivityIndicator, Text, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';

import HeatProgress from '../../../components/game/HeatProgress';
import GameCard from '../../../components/game/GameCard';
import { useGame } from '../../../hooks/useGame';
import { loadPlayers } from '../../../lib/storage';
import { colors, spacing } from '../../../theme';

// Card type background colors - using theme-consistent colors
const CARD_BG_COLORS: Record<string, string> = {
  truth: '#120812',   // Purple tint
  dare: '#120608',    // Red tint
  group: '#120A06',   // Orange tint
};

export default function PlayGame() {
  const { i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [players, setPlayers] = useState<string[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);

  const language = (i18n.language?.startsWith('fr') ? 'fr' : 'en') as 'fr' | 'en';
  const mode = id || 'friendly';

  // Load players on mount
  useEffect(() => {
    const init = async () => {
      const savedPlayers = await loadPlayers();
      if (!savedPlayers || savedPlayers.length === 0) {
        router.replace('/');
        return;
      }
      setPlayers(savedPlayers);
      setIsInitializing(false);
    };
    init();
  }, []);

  // Game hook
  const {
    currentChallenge,
    currentPlayer,
    secondPlayer,
    thirdPlayer,
    leastDrunkPlayer,
    currentRound,
    currentLevel,
    isLoading,
    nextCard,
  } = useGame({ players, mode });

  // Game is now infinite, no completion handling needed

  // Get background color based on card type
  const cardBgColor = currentChallenge ? (CARD_BG_COLORS[currentChallenge.type] || colors.background.primary) : colors.background.primary;

  // Loading state
  if (isInitializing || isLoading || !currentChallenge) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background.primary} />
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>
          {language === 'fr' ? 'Chargement...' : 'Loading...'}
        </Text>
      </View>
    );
  }

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={[styles.container, { paddingTop: insets.top, backgroundColor: cardBgColor }]}
    >
      <StatusBar barStyle="light-content" backgroundColor={cardBgColor} />
      {/* Progress bar */}
      <HeatProgress
        currentHeat={currentLevel}
        currentRound={currentRound}
        language={language}
        cardType={currentChallenge.type}
      />

      {/* Game card */}
      <View style={styles.cardContainer}>
        <GameCard
          key={currentChallenge.id}
          challenge={currentChallenge}
          playerName={currentPlayer}
          secondPlayer={secondPlayer}
          thirdPlayer={thirdPlayer}
          leastDrunkPlayer={leastDrunkPlayer}
          language={language}
          onNext={nextCard}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[4],
  },
  loadingText: {
    color: colors.text.secondary,
    fontSize: 16,
  },
  cardContainer: {
    flex: 1,
  },
});
