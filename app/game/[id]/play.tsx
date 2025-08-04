import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import challenges from '../../../app/data/challenges.json';
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
import ReflexGame from '../../../components/minigames/ReflexGame';
import RouletteCard from '../../../components/minigames/RouletteCard';
import SelfieCard from '../../../components/minigames/SelfieCard';
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
  const [showTestMode, setShowTestMode] = useState(false);

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
        return '#1a0000';
      case 'question':
        return '#001f2f';
      case 'event':
        return '#1e0038';
      case 'roulette':
        return '#1a0022';
      case 'wheelshot':
        return '#4a004f';
      case 'hotseat':
        return '#400000'; // 🔥 brun chaud
      case 'flashquiz':
        return '#002f1a'; // 🧠 vert sombre
      case 'guessword':
        return '#1a1a4d'; // 🧩 violet foncé
      case 'explosion':
        return '#4d0000'; // 💥 rouge vif
      case 'oracle':
        return '#330033'; // 🔮 violet mystique
      case 'selfie':
        return '#00334d'; // 📸 bleu sombre
      case 'tapbattle':
        return '#3d3d00'; // 🕹️ jaune brun
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
        return <WheelShotCard players={game.players} onNext={() => nextChallenge()} />;
      case 'flashquiz':
        return <FlashQuizCard data={current} onNext={nextChallenge} />;
      case 'hotseat':
        return <HotSeatCard data={{ ...current, players: game.players }} onNext={nextChallenge} />;
      case 'tapbattle':
        return <ReflexGame players={game.players} onNext={nextChallenge} />;
      case 'selfie':
        return <SelfieCard data={current} onNext={nextChallenge} />;
      case 'guessword':
        return (
          <GuessWordCard
            data={current}
            onNext={nextChallenge}
            players={game.players}
            selectedPlayers={current.targets || game.players.slice(0, 2)}
          />
        );

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

  const allTestItems = challenges.filter((c) => !!c);

  return (
    <>
      <TouchableOpacity
        onPress={() => setShowTestMode(true)}
        style={styles.testButton}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>🧪 TEST</Text>
      </TouchableOpacity>

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

      <Modal visible={showTestMode} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🎯 Choisir un défi à tester</Text>
            <FlatList
              data={allTestItems}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.testItem}
                  onPress={() => {
                    setCurrent({
                      ...item,
                      targets: game?.players.slice(0, 2) || [],
                      text: item.text,
                    });
                    setShowTestMode(false);
                  }}
                >
                  <Text style={{ color: '#fff' }}>{item.id} — {item.type}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => setShowTestMode(false)} style={styles.closeButton}>
              <Text style={styles.closeText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  testButton: {
    position: 'absolute',
    top: 50,
    right: 70,
    backgroundColor: '#222',
    padding: 10,
    borderRadius: 8,
    zIndex: 99,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a0000',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  testItem: {
    padding: 12,
    backgroundColor: '#333',
    borderRadius: 8,
    marginBottom: 10,
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: '#ffb347',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeText: {
    color: '#000',
    fontWeight: 'bold',
  },
});
