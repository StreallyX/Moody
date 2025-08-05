import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  clearGameState,
  loadGameState,
  loadPlayers,
} from '../lib/storage';

function MenuImage({ source }: { source: any }) {
  const [loading, setLoading] = useState(true);
  return (
    <View style={styles.imageWrapper}>
      <Image
        source={source}
        style={styles.image}
        onLoadEnd={() => setLoading(false)}
      />
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ffb347" />
        </View>
      )}
    </View>
  );
}

export default function MenuScreen() {
  const router = useRouter();
  const [playerList, setPlayerList] = useState<string[]>([]);
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const [lastMode, setLastMode] = useState<string>('friends');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const init = async () => {
      const logged = await AsyncStorage.getItem('isLoggedIn');
      setIsLoggedIn(logged === 'true');

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
        setLastMode(game.mode ?? 'friends');
      } else {
        await clearGameState();
        setHasSavedGame(false);
      }
    };

    init();
  }, []);

  const menuButtons = [
    { id: 'friends', title: 'Friends', image: require('../assets/images/game1.png'), locked: false },
    { id: 'caliente', title: 'Caliente', image: require('../assets/images/game2.png'), locked: !isLoggedIn },
    { id: 'mystery', title: 'Mystery', image: require('../assets/images/game3.png'), locked: true },
    { id: 'couple', title: 'Couple', image: require('../assets/images/game4.png'), locked: false },
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
              style={[styles.resumeButton, { backgroundColor: '#2e7d32' }]}
              onPress={() => router.push(`/game/${lastMode}`)}
            >
              <Icon name="check" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.resumeButton, { backgroundColor: '#c62828' }]}
              onPress={async () => {
                await clearGameState();
                setHasSavedGame(false);
              }}
            >
              <Icon name="times" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* GAME MODE BUTTONS */}
      <ScrollView contentContainerStyle={styles.buttonList}>
        {menuButtons.map((item) => {
          const locked = item.locked;

          return (
            <View key={item.id} style={{ position: 'relative', width: '100%' }}>
              <TouchableOpacity
                style={[styles.menuButton, locked && styles.locked]}
                activeOpacity={locked ? 0.9 : 0.7}
                onPress={async () => {
                  if (locked) {
                    setShowModal(true);
                    return;
                  }
                  await clearGameState();
                  setHasSavedGame(false);
                  router.push(`/game/${item.id}`);
                }}
                disabled={false}
              >
                <MenuImage source={item.image} />
                <Text style={styles.buttonTitle}>
                  {locked ? '🔒 ' : ''}{item.title}
                </Text>
              </TouchableOpacity>

              {/* BULLE D’INFO POUR CALIENTE */}
              {locked && (
                <View style={styles.bubble}>
                  <Text style={styles.bubbleText}>Clique ici pour débloquer 🔓</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* MODAL POUR CALIENTE BLOQUÉ */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowModal(false)}>
              <Text style={{ fontSize: 20 }}>❌</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Créer un compte pour avoir accès</Text>
            <Text style={styles.modalText}>Le mode Caliente est réservé aux joueurs connectés 🔥</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowModal(false);
                router.push('/auth/login');
              }}
            >
              <Icon name="arrow-right" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  container: {
    flex: 1,
    backgroundColor: '#1a0000',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  backText: {
    color: '#ffb347',
    fontSize: 16,
    fontWeight: '600',
    padding: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#2c0000',
    overflow: 'hidden',
  },
  playersText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    backgroundColor: '#2c0000',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  resumeContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  resumeText: {
    color: '#ffb347',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 14,
  },
  resumeButtons: {
    flexDirection: 'row',
    gap: 24,
  },
  resumeButton: {
    width: 60,
    height: 60,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  buttonList: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  menuButton: {
    width: '100%',
    height: 110,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginBottom: 22,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 4,
  },
  locked: {
    opacity: 0.4,
  },
  imageWrapper: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#1a0000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a0000',
  },
  buttonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 10,
  },
  bubble: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    backgroundColor: '#fff4c4',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 3,
  },
  bubbleText: {
    color: '#222',
    fontSize: 13,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    alignItems: 'center',
    elevation: 5,
    position: 'relative',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    color: '#444',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#ffb347',
    padding: 12,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
  },
  modalClose: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 6,
    zIndex: 10,
  },
});
