import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function GameStartScreen() {
  const router = useRouter();
  const { players, id } = useLocalSearchParams<{ players: string; id: string }>();
  const [showStart, setShowStart] = useState(false);

  const playerList = useMemo(() => {
    try {
      return players ? JSON.parse(players) : [];
    } catch {
      return [];
    }
  }, [players]);

  useEffect(() => {
    if (!playerList || playerList.length === 0) {
      router.replace('/');
    }
  }, []);

  const handleStart = () => {
    router.push({
      pathname: `/game/${id}/play` as any,
      params: { players: JSON.stringify(playerList) },
    });
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handleStart}>
      <ImageBackground
        source={require('../../../assets/images/logo.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.bubble}>
          <Text style={styles.title}>Prêt à jouer ?</Text>
            {playerList.map((name: string, index: number) => (
            <Text key={index} style={styles.player}>👤 {name}</Text>
            ))}
          <Text style={styles.tap}>[Touchez pour commencer]</Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubble: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000',
  },
  player: {
    fontSize: 18,
    color: '#333',
  },
  tap: {
    marginTop: 20,
    fontStyle: 'italic',
    fontSize: 14,
    color: '#555',
  },
});
