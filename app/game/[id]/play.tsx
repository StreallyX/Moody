import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import ChallengeCard from '../../../components/ChallengeCard';
import QuestionCard from '../../../components/QuestionCard';
import RouletteCard from '../../../components/RouletteCard';
import WheelShotCard from '../../../components/WheelShotCard';
import { loadPlayers } from '../../../lib/storage'; // adapte le chemin si nécessaire
import challenges from '../../data/friends.json';

type NextOpts = { level?: number; target?: string };

export default function PlayFriends() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [playerList, setPlayerList] = useState<string[]>([]);
  const [current, setCurrent] = useState<any | null>(null);

  const randomPlayers = (n: number) =>
    playerList.sort(() => Math.random() - 0.5).slice(0, n);

  /**
   * Prochaine étape du jeu
   */
  const nextChallenge = (opts: NextOpts = {}) => {
    console.log('▶️ Appel de nextChallenge');
    console.log('👥 Liste complète des joueurs :', playerList);
    console.log('🎯 Cible initiale (roulette) :', opts.target);

    let pool = challenges.filter(
      c => (c.minPlayers ?? 1) <= playerList.length
    );

    if (opts.level !== undefined) {
      pool = pool.filter(
        c => c.level === opts.level && c.type === 'challenge'
      );
    }

    if (pool.length === 0) {
      setCurrent({
        type: 'info',
        text: 'Pas assez de joueurs pour continuer 😢',
        level: 0,
        targets: [],
      });
      return;
    }

    const picked = pool[Math.floor(Math.random() * pool.length)];
    const numberOfPlayers = picked.maxPlayers ?? 1;

    let targets: string[] = [];

    if (opts.target) {
      targets.push(opts.target);
      const others = playerList.filter(p => p !== opts.target);
      const extra = others.sort(() => Math.random() - 0.5).slice(0, numberOfPlayers - 1);
      targets = targets.concat(extra);
    } else {
      targets = randomPlayers(numberOfPlayers);
    }

    let finalText = picked.text;

    targets.forEach((playerName, index) => {
      const tag = index === 0 ? '%PLAYER%' : `%PLAYER${index}%`;
      finalText = finalText.replaceAll(tag, String(playerName));
    });

    if (targets.length > 0) {
      finalText = finalText.replaceAll('%PLAYER%', String(targets[0]));
    }

    setCurrent({ ...picked, targets, text: finalText });
  };

  useEffect(() => {
    loadPlayers().then(players => {
      if (!players || players.length === 0) {
        router.replace('/');
      } else {
        setPlayerList(players);
      }
    });
  }, []);

  useEffect(() => {
    if (playerList.length > 0) {
      nextChallenge();
    }
  }, [playerList]);

  if (!current) return null;

  const renderCard = () => {
    switch (current.type) {
      case 'challenge':
        return <ChallengeCard data={current} onNext={nextChallenge} />;
      case 'question':
        return <QuestionCard data={current} onNext={nextChallenge} />;
      case 'roulette':
        return (
          <RouletteCard
            players={playerList}
            onNext={({ level, target }) => nextChallenge({ level, target })}
          />
        );
      case 'wheelshot':
        return (
          <WheelShotCard
            players={playerList}
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
