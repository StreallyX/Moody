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
import {
  clearGameState,
  loadGameState,
  loadPlayers,
} from '../lib/storage';

export default function MenuScreen() {
  const router = useRouter();
  const [playerList, setPlayerList] = useState<string[]>([]);
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const [lastMode, setLastMode] = useState<string>('friends');

  useEffect(() => {
    const init = async () => {
      const loadedPlayers = await loadPlayers();

      if (!loadedPlayers || loadedPlayers.length === 0) {
        router.replace('/');
        return;
      }

      setPlayerList(loadedPlayers);

      const game = await loadGameState();

      if (
        game &&
        game.players.length > 0 &&
        arraysEqual(game.players, loadedPlayers)
      ) {
        setHasSavedGame(true);
        setLastMode(game.mode ?? 'friends'); // <- on charge le mode s'il existe
      } else {
        await clearGameState();
        setHasSavedGame(false);
      }
    };

    init();
  }, []);

  const menuButtons = [
    { id: 'friends', title: 'Friends', image: require('../assets/images/game1.png'), locked: false },
    { id: 'caliente', title: 'Caliente', image: require('../assets/images/game2.png'), locked: false },
    { id: 'mystery',  title: 'Mystery',  image: require('../assets/images/game3.png'), locked: true },
    { id: 'couple',   title: 'Couple',   image: require('../assets/images/game4.png'), locked: false },
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

      {/* RESUME BLOCK */}
      {hasSavedGame && (
        <View style={styles.resumeContainer}>
          <Text style={styles.resumeText}>Reprendre la partie ?</Text>
          <View style={styles.resumeButtons}>
            <TouchableOpacity
              style={styles.resumeButton}
              onPress={() => router.push(`/game/${lastMode}`)}
            >
              <Text style={styles.resumeIcon}>✔️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.resumeButton}
              onPress={async () => {
                await clearGameState();
                setHasSavedGame(false);
              }}
            >
              <Text style={styles.resumeIcon}>❌</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* GAME MODE BUTTONS */}
      <ScrollView contentContainerStyle={styles.buttonList}>
        {menuButtons.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.menuButton, item.locked && styles.locked]}
            activeOpacity={item.locked ? 1 : 0.7}
            onPress={async () => {
              if (!item.locked) {
                await clearGameState();
                setHasSavedGame(false);
                router.push(`/game/${item.id}`); // ← envoie vers /game/friends, etc.
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

function arraysEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const setA = new Set(a);
  const setB = new Set(b);
  for (const item of setA) {
    if (!setB.has(item)) return false;
  }
  return true;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#300000', paddingTop: 60, paddingHorizontal: 20 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  backText: { color: '#f2b662', fontSize: 16 },
  playersText: { color: '#fff', fontSize: 16 },
  resumeContainer: { marginBottom: 20, alignItems: 'center' },
  resumeText: { color: '#fff', fontSize: 16, marginBottom: 10 },
  resumeButtons: { flexDirection: 'row', gap: 20 },
  resumeButton: { backgroundColor: '#111', borderRadius: 30, width: 50, height: 50, alignItems: 'center', justifyContent: 'center' },
  resumeIcon: { fontSize: 24 },
  buttonList: { alignItems: 'center', paddingBottom: 40 },
  menuButton: { width: '100%', height: 100, borderRadius: 20, backgroundColor: '#fff', marginBottom: 20, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', elevation: 3 },
  locked: { opacity: 0.4 },
  image: { position: 'absolute', width: '100%', height: '100%', resizeMode: 'cover' },
  buttonTitle: { fontSize: 20, fontWeight: '600', color: '#000', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.7)', paddingHorizontal: 16, paddingVertical: 4, borderRadius: 10 },
});
