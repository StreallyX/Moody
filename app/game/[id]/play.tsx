import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View, ActivityIndicator, Text, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';

import HeatProgress from '../../../components/game/HeatProgress';
import GameCard from '../../../components/game/GameCard';
import LevelUpOverlay from '../../../components/game/LevelUpOverlay';
import { useGame } from '../../../hooks/useGame';
import { loadPlayers } from '../../../lib/storage';
import { colors, spacing } from '../../../theme';

// Card type background colors (matching GameCard and HeatProgress)
const CARD_BG_COLORS: Record<string, string> = {
  truth: '#1A1428',
  dare: '#1A0D10',
  group: '#1A1408',
};

export default function PlayGame() {
  const { i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [players, setPlayers] = useState<string[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpLevel, setLevelUpLevel] = useState(1);
  const [prevLevel, setPrevLevel] = useState(1);

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

  // Handle level change
  useEffect(() => {
    if (currentLevel > prevLevel && currentLevel > 1) {
      setLevelUpLevel(currentLevel);
      setShowLevelUp(true);
      setPrevLevel(currentLevel);
    }
  }, [currentLevel, prevLevel]);

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
        onLevelChange={(newLevel) => {
          if (newLevel > 1) {
            setLevelUpLevel(newLevel);
            setShowLevelUp(true);
          }
        }}
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

      {/* Level up overlay */}
      <LevelUpOverlay
        visible={showLevelUp}
        level={levelUpLevel}
        language={language}
        onComplete={() => setShowLevelUp(false)}
      />
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
