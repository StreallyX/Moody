// app/game/[id]/play.tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import ChallengeCard from '../../../components/ChallengeCard';
import QuestionCard from '../../../components/QuestionCard';
import RouletteCard from '../../../components/RouletteCard';
import challenges from '../../data/friends.json';

export default function PlayFriends() {
  const router = useRouter();
  const { players } = useLocalSearchParams<{ players: string }>();
  const playerList = useMemo(() => JSON.parse(players ?? '[]'), [players]);

  const [current, setCurrent] = useState<any | null>(null);

  const randomPlayers = (n: number) =>
    playerList.sort(() => Math.random() - 0.5).slice(0, n);

  const nextChallenge = () => {
    // ➕ filtrer les défis compatibles avec le nombre de joueurs
    const pool = challenges.filter(
      c => (c.minPlayers ?? 1) <= playerList.length
    );

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
    const targets = randomPlayers(picked.maxPlayers ?? 1);
    setCurrent({ ...picked, targets });
  };

  useEffect(() => {
    nextChallenge();
  }, []);

  if (!current) return null;

  const renderCard = () => {
    switch (current.type) {
      case 'challenge':
        return <ChallengeCard data={current} onNext={nextChallenge} />;
      case 'question':
        return <QuestionCard data={current} onNext={nextChallenge} />;
      case 'roulette':
        return <RouletteCard data={current} onNext={nextChallenge} />;
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
