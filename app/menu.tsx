import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { loadPlayers } from '../lib/storage'; // adapte le chemin si nécessaire

export default function MenuScreen() {
  const router = useRouter();
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

  const menuButtons = [
    { id: '1', title: 'Friends', image: require('../assets/images/game1.png'), locked: false },
    { id: '2', title: 'Caliente', image: require('../assets/images/game2.png'), locked: false },
    { id: '3', title: 'Mystery', image: require('../assets/images/game3.png'), locked: true },
    { id: '4', title: 'Couple', image: require('../assets/images/game4.png'), locked: false },
  ];

  return (
    <View style={styles.container}>
      {/* TOP BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>⬅ Retour</Text>
        </TouchableOpacity>
        <Text style={styles.playersText}>👥 {playerList.length} joueurs</Text>
      </View>

      {/* BUTTONS VERTICALLY */}
      <ScrollView contentContainerStyle={styles.buttonList}>
        {menuButtons.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.menuButton, item.locked && styles.locked]}
            activeOpacity={item.locked ? 1 : 0.7}
            onPress={() => {
              if (!item.locked) {
                router.push(`/game/${item.id}/`);
              }
            }}
            disabled={item.locked}
          >
            <Image source={item.image} style={styles.image} />
            <Text style={styles.buttonTitle}>
              {item.locked ? '🔒 ' : ''}{item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#300000',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  backText: {
    color: '#f2b662',
    fontSize: 16,
  },
  playersText: {
    color: '#fff',
    fontSize: 16,
  },
  buttonList: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  menuButton: {
    width: '100%',
    height: 100,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 3,
  },
  locked: {
    opacity: 0.4,
  },
  image: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  buttonTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 10,
  },
});
