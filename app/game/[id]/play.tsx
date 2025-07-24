import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
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
import challenges from '../../data/friends.json';

type NextOpts = { level?: number; target?: string };

export default function PlayFriends() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [game, setGame] = useState<GameState | null>(null);
  const [current, setCurrent] = useState<any | null>(null);

  const balancedRandom = (n: number) => {
    if (!game) return [];
    const shuffled = [...game.players].sort(
      (a, b) => (game.stats[a] - game.stats[b]) || Math.random() - 0.5
    );
    return shuffled.slice(0, n);
  };

  const nextChallenge = (opts: NextOpts = {}) => {
    if (!game) return;

    if (current?.targets) {
      const newStats = { ...game.stats };
      current.targets.forEach((p: string) => {
        newStats[p] = (newStats[p] || 0) + 1;
      });
      game.stats = newStats;
      game.rounds += 1;
      game.heat = Math.min(10, 1 + Math.floor(game.rounds / 3));
    }

    let pool = challenges.filter(
      (c) =>
        (c.minPlayers ?? 1) <= game.players.length &&
        (c.level ?? 1) <= game.heat
    );

    if (opts.level !== undefined) {
      pool = pool.filter(
        (c) => c.level === opts.level && c.type === 'challenge'
      );
    }

    if (pool.length === 0) {
      setCurrent({ type: 'info', text: 'Plus de défis adaptés 😢', targets: [] });
      return;
    }

    const picked = pool[Math.floor(Math.random() * pool.length)];
    const nb = picked.maxPlayers ?? 1;

    let targets: string[] = [];

    if (opts.target) {
      targets.push(opts.target);
      const others = game.players.filter((p) => p !== opts.target);
      targets.push(...others.sort(() => Math.random() - 0.5).slice(0, nb - 1));
    } else {
      targets = balancedRandom(nb);
    }

    let finalText = picked.text;
    targets.forEach((p, i) => {
      const tag = i === 0 ? '%PLAYER%' : `%PLAYER${i}%`;
      finalText = finalText.replaceAll(tag, p);
    });
    if (targets.length) finalText = finalText.replaceAll('%PLAYER%', targets[0]);

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
            onNext={({ level, target }) =>
              nextChallenge({ level, target })
            }
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

  return <View style={styles.container}>{renderCard()}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#300000',
  },
});
