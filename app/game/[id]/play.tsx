import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import challenges from '../../../app/data/data.json';
import {
  ChallengeCard,
  EventCard,
  EventSpecial1,
  EventSpecial2,
  ExplosionCard,
  FlashQuizCard,
  GuessWordCard,
  HotSeatCard,
  OracleCard,
  QuestionCard,
  ReflexGame,
  RouletteCard,
  SelfieCard,
  WheelShotCard,
} from '../../../components/cards/index';
import FooterBar from '../../../components/FooterBar';
import GameHeader from '../../../components/GameHeader';
import ReportModal from '../../../components/ReportModal';
import SelectModal from '../../../components/SelectModal';
import StatsModal from '../../../components/StatsModal';
import { useGameEngine } from '../../../hooks/useGameEngine';
import {
  GameState,
  loadGameState,
  loadPlayers,
  saveGameState,
} from '../../../lib/storage';

type CardData = {
  id: string;
  type: string;
  text?: string;
  targets?: string[];
  [key: string]: any;
};

export default function PlayGame() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [game, setGame] = useState<GameState | null>(null);
  const [current, setCurrent] = useState<any | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const { nextChallenge } = useGameEngine(game, setGame, setCurrent);

  useEffect(() => {
    const init = async () => {
      const saved = await loadGameState();
      if (saved && saved.players.length > 0) {
        setGame(saved);
        return;
      }
      const players = await loadPlayers();
      if (!players || players.length === 0) {
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
    const map: Record<string, string> = {
      challenge: '#1a0000',
      question: '#001f2f',
      event: '#1e0038',
      roulette: '#1a0022',
      wheelshot: '#4a004f',
      hotseat: '#400000',
      flashquiz: '#002f1a',
      guessword: '#1a1a4d',
      explosion: '#4d0000',
      oracle: '#330033',
      selfie: '#00334d',
      tapbattle: '#3d3d00',
    };
    return map[type] || '#000';
  };

  const renderCard = () => {
    const data = current;
    switch (data.type) {
      case 'challenge': return <ChallengeCard data={data} onNext={nextChallenge} />;
      case 'question': return <QuestionCard data={data} onNext={nextChallenge} />;
      case 'event':
        if (data.id?.startsWith('event:special_')) {
          if (data.id === 'event:special_1') return <EventSpecial1 onNext={nextChallenge} />;
          if (data.id === 'event:special_2') return <EventSpecial2 onNext={nextChallenge} />;
        }
        return <EventCard text={data.text} onNext={nextChallenge} />;
      case 'roulette': return <RouletteCard players={game.players} onNext={({ level, target }) => nextChallenge({ level, target })} />;
      case 'wheelshot': return <WheelShotCard players={game.players} onNext={nextChallenge} />;
      case 'flashquiz': return <FlashQuizCard data={data} onNext={nextChallenge} />;
      case 'hotseat': return <HotSeatCard data={{ ...data, players: game.players }} onNext={nextChallenge} />;
      case 'tapbattle': return <ReflexGame players={game.players} onNext={nextChallenge} />;
      case 'selfie': return <SelfieCard data={data} onNext={nextChallenge} />;
      case 'guessword': return <GuessWordCard data={data} onNext={nextChallenge} players={game.players} selectedPlayers={data.targets || game.players.slice(0, 2)} />;
      case 'explosion': return <ExplosionCard data={data} onNext={nextChallenge} />;
      case 'oracle': return <OracleCard data={data} players={game.players} onNext={nextChallenge} />;
      default: return <ChallengeCard data={data} onNext={nextChallenge} />;
    }
  };

  return (
    <>
      <View style={[styles.container, { backgroundColor: getBackgroundColor(current.type) }]}>
        <GameHeader round={game.rounds} type={current.type} onStatsPress={() => setShowStats(true)} />
        {renderCard()}
        <StatsModal
          visible={showStats}
          onClose={() => setShowStats(false)}
          heat={game.heat}
          rounds={game.rounds}
          stats={game.stats}
          history={game.history || []}
        />
        <SelectModal
          visible={showSelectModal}
          onClose={() => setShowSelectModal(false)}
          items={challenges}
          onSelect={(item: CardData) => {
            setCurrent({
              ...item,
              targets: game.players.slice(0, 2),
              text: item.text,
            });
            setShowSelectModal(false);
          }}
        />
        <ReportModal
          visible={showReportModal}
          onClose={() => setShowReportModal(false)}
          cardId={current.id}
        />
        <FooterBar
          onSelectPress={() => setShowSelectModal(true)}
          onReportPress={() => setShowReportModal(true)}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
