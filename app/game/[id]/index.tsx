import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { loadPlayers } from '../../../lib/storage';

export default function GameStartScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [playerList, setPlayerList] = useState<string[]>([]);

  useEffect(() => {
    loadPlayers().then((loadedPlayers) => {
      if (!loadedPlayers || loadedPlayers.length === 0) {
        router.replace('/');
      } else {
        setPlayerList(loadedPlayers);
      }
    });
  }, []);

  const handleStart = () => {
    router.push(`/game/${id}/play`);
  };

  const backgrounds: Record<string, any> = {
    friends: require('../../../assets/images/game1.png'),
    caliente: require('../../../assets/images/game2.png'),
  };

  const bgImage = backgrounds[id] ?? require('../../../assets/images/game1.png');

  return (
    <TouchableOpacity style={styles.container} onPress={handleStart}>
      <ImageBackground
        source={bgImage}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.bubble}>
          <Text style={styles.title}>{t('gamestart.ready')}</Text>
          {playerList.map((name, index) => (
            <Text key={index} style={styles.player}>👤 {name}</Text>
          ))}
          <Text style={styles.tap}>{t('gamestart.tapToStart')}</Text>
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
    backgroundColor: '#1a0000',
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
