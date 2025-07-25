import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ChallengeCard from '../../../components/ChallengeCard';
import QuestionCard from '../../../components/QuestionCard';
import RouletteCard from '../../../components/RouletteCard';
import WheelShotCard from '../../../components/WheelShotCard';
import {
  GameState,
  loadGameState,
  loadPlayers,
  saveGameState,
} from '../../../lib/storage';
import rawChallenges from '../../data/challenges.json';
const challenges = rawChallenges as Challenge[]; // ✅ cast explicite

type NextOpts = { level?: number; target?: string };
type Challenge = {
  id: string;
  type: 'challenge' | 'question' | 'roulette' | 'wheelshot';
  text: string;
  level: number;
  modes: string[]; // 👈 ceci est crucial
  minPlayers?: number;
  maxPlayers?: number;
  slots?: number;
};

export default function PlayGame() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>(); // id = mode

  const [game, setGame] = useState<GameState | null>(null);
  const [current, setCurrent] = useState<any | null>(null);
  const [showStats, setShowStats] = useState(false);

  const balancedRandom = (n: number) => {
    if (!game) return [];
    const shuffled = [...game.players].sort(
      (a, b) => (game.stats[a] - game.stats[b]) || Math.random() - 0.5
    );
    return shuffled.slice(0, n);
  };

  const nextChallenge = (opts: NextOpts = {}) => {
  if (!game) return;

  // Mise à jour des stats du round précédent
  if (current?.targets) {
    const newStats = { ...game.stats };
    current.targets.forEach((p: string) => {
      newStats[p] = (newStats[p] || 0) + 1;
    });
    game.stats = newStats;
    game.rounds += 1;
    game.heat = Math.min(10, 1 + Math.floor(game.rounds / 3));
  }

  // Étape 1 — Récupération des défis valides (mode + nombre de joueurs)
  let validChallenges = challenges.filter(
    (c) =>
      c.modes?.includes(game.mode) &&
      (c.minPlayers ?? 1) <= game.players.length
  );

  // Étape 2 — Si un niveau spécifique est demandé (roulette), on filtre directement
  if (opts.level !== undefined) {
    validChallenges = validChallenges.filter(
      (c) => c.level === opts.level && c.type === 'challenge'
    );
  }

  // Étape 3 — Créer un pool pondéré basé sur la chaleur
  const weightedPool: Challenge[] = [];
  validChallenges.forEach((challenge) => {
    const level = challenge.level ?? 1;
    const heat = game.heat;
    const weight = Math.max(1, 10 - Math.abs(level - heat)); // + proche du heat = + poids
    for (let i = 0; i < weight; i++) {
      weightedPool.push(challenge);
    }
  });

  if (weightedPool.length === 0) {
    setCurrent({ type: 'info', text: 'Plus de défis adaptés 😢', targets: [] });
    return;
  }

  // Étape 4 — Sélection aléatoire pondérée
  const picked = weightedPool[Math.floor(Math.random() * weightedPool.length)];

  // Étape 5 — Identifier les placeholders de joueurs dans le texte
  const textPlaceholders = [...new Set(picked.text.match(/%PLAYER\d*%/g) ?? [])];
  const totalNeeded = textPlaceholders.length;
  const allPlayers = [...game.players];

  // Étape 6 — Constitution de la liste `targets`
  let targets: string[] = [];
  if (opts.target) {
    targets.push(opts.target);
    allPlayers.splice(allPlayers.indexOf(opts.target), 1); // on retire le joueur imposé
  }

  while (targets.length < totalNeeded && allPlayers.length > 0) {
    const index = Math.floor(Math.random() * allPlayers.length);
    const player = allPlayers.splice(index, 1)[0];
    targets.push(player);
  }

  if (targets.length < totalNeeded) {
    setCurrent({
      type: 'info',
      text: `Pas assez de joueurs différents pour ce défi (${totalNeeded} requis) 😢`,
      targets: [],
    });
    return;
  }

  // Étape 7 — Remplacement des placeholders dans le texte
  let finalText = picked.text;
  textPlaceholders.forEach((ph, i) => {
    finalText = finalText.replaceAll(ph, targets[i] ?? targets[0]);
  });

  // Étape 8 — Sauvegarde et affichage du défi
  const newCurrent = { ...picked, targets, text: finalText };
  setCurrent(newCurrent);
  setGame(game);
  saveGameState(game);
};



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
        mode: id || 'friends', // 👈 on injecte le mode
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
      default:
        return <ChallengeCard data={current} onNext={nextChallenge} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Stop Button */}
      <TouchableOpacity style={styles.stopButton} onPress={() => router.replace('/')}>
        <Text style={styles.stopIcon}>⏹️</Text>
      </TouchableOpacity>

      {/* Info Button */}
      <TouchableOpacity style={styles.infoButton} onPress={() => setShowStats(true)}>
        <Text style={styles.infoIcon}>ℹ️</Text>
      </TouchableOpacity>

      {renderCard()}

      <Modal visible={showStats} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>📊 Statistiques</Text>
            <Text style={styles.modalText}>🔥 Niveau de chaleur : {game.heat}</Text>
            <Text style={styles.modalText}>🔄 Tours joués : {game.rounds}</Text>
            <Text style={styles.modalSubtitle}>👤 Défis par joueur :</Text>
            <ScrollView style={{ maxHeight: 200 }}>
              {Object.entries(game.stats).map(([name, count]) => (
                <Text key={name} style={styles.modalText}>
                  {name} : {count}
                </Text>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setShowStats(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#300000',
  },
  infoButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  infoIcon: {
    fontSize: 26,
    color: '#fff',
  },
  stopButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  stopIcon: {
    fontSize: 26,
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 6,
  },
  closeButton: {
    marginTop: 16,
    alignSelf: 'center',
    backgroundColor: '#300000',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
