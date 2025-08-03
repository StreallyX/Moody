import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import ChallengeCard from '../../../components/ChallengeCard';
import EventCard from '../../../components/events/EventCard';
import EventSpecial1 from '../../../components/events/EventSpecial1';
import EventSpecial2 from '../../../components/events/EventSpecial2';
import GameHeader from '../../../components/GameHeader';
import ExplosionCard from '../../../components/minigames/ExplosionCard';
import FlashQuizCard from '../../../components/minigames/FlashQuizCard';
import GuessWordCard from '../../../components/minigames/GuessWordCard';
import HotSeatCard from '../../../components/minigames/HotSeatCard';
import OracleCard from '../../../components/minigames/OracleCard';
import RouletteCard from '../../../components/minigames/RouletteCard';
import SelfieCard from '../../../components/minigames/SelfieCard';
import TapBattleCard from '../../../components/minigames/TapBattleCard';
import WheelShotCard from '../../../components/minigames/WheelShotCard';
import QuestionCard from '../../../components/QuestionCard';
import StatsModal from '../../../components/StatsModal';
import { useGameEngine } from '../../../hooks/useGameEngine';
import { GameState, loadGameState, loadPlayers, saveGameState } from '../../../lib/storage';

export default function PlayGame() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [game, setGame] = useState<GameState | null>(null);
  const [current, setCurrent] = useState<any | null>(null);
  const [showStats, setShowStats] = useState(false);

  const { nextChallenge } = useGameEngine(game, setGame, setCurrent);

  useEffect(() => {
    const init = async () => {
      const saved = await loadGameState();
      if (saved && saved.players.length > 0) {
        console.log('✅ Partie existante chargée');
        setGame(saved);
        return;
      }

      const players = await loadPlayers();
      if (!players || players.length === 0) {
        console.log('❌ Aucun joueur trouvé');
        router.replace('/');
        return;
      }

      const freshGame: GameState = {
        players,
        stats: Object.fromEntries(players.map((p) => [p, 0])),
        heat: 1,
        rounds: 0,
        mode: id || 'friends',
      };

      console.log('🆕 Nouvelle partie créée');
      await saveGameState(freshGame);
      setGame(freshGame);
    };

    init();
  }, []);

  useEffect(() => {
    if (game && !current) {
      nextChallenge();
    }
  }, [game]);

  if (!game || !current) return null;

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'challenge':
        return '#1a0000'; // rouge foncé
      case 'question':
        return '#001f2f'; // bleu foncé
      case 'event':
        return '#07076e'; // jaune-brun
      case 'roulette':
        return '#1a0022'; // violet foncé
      case 'wheelshot':
        return '#4a004f'; // vert foncé
      default:
        return '#000000';
    }
  };

  const renderCard = () => {
    switch (current.type) {
      case 'challenge':
        return <ChallengeCard data={current} onNext={nextChallenge} />;
      case 'question':
        return <QuestionCard data={current} onNext={nextChallenge} />;
      case 'roulette':
        return (
          <RouletteCard
            players={game.players}
            onNext={({ level, target }) => nextChallenge({ level, target })}
          />
        );
      case 'wheelshot':
        return (
          <WheelShotCard
            players={game.players}
            onNext={() => nextChallenge()}
          />
        );
      case 'flashquiz':
        return <FlashQuizCard data={current} onNext={nextChallenge} />;
      case 'hotseat':
        return <HotSeatCard data={current} onNext={nextChallenge} />;
      case 'tapbattle':
        return <TapBattleCard players={game.players} onNext={nextChallenge} />;
      case 'selfie':
        return <SelfieCard data={current} onNext={nextChallenge} />;
      case 'guessword':
        return <GuessWordCard data={current} onNext={nextChallenge} />;
      case 'explosion':
        return <ExplosionCard data={current} onNext={nextChallenge} />;
      case 'oracle':
        return <OracleCard data={current} players={game.players} onNext={nextChallenge} />;
      case 'event':
        if (current.id?.startsWith('event:special_')) {
          switch (current.id) {
            case 'event:special_1':
              return <EventSpecial1 onNext={nextChallenge} />;
            case 'event:special_2':
              return <EventSpecial2 onNext={nextChallenge} />;
            default:
              return <EventCard text="Événement spécial inconnu." onNext={nextChallenge} />;
          }
        }
        return <EventCard text={current.text} onNext={nextChallenge} />;
      default:
        return <ChallengeCard data={current} onNext={nextChallenge} />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: getBackgroundColor(current.type) }]}>
      <GameHeader round={game.rounds} type={current.type} onStatsPress={() => setShowStats(true)} />
      {renderCard()}
      <StatsModal
        visible={showStats}
        onClose={() => setShowStats(false)}
        heat={game.heat}
        rounds={game.rounds}
        stats={game.stats}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
