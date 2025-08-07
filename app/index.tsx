import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import LanguageModal from '../components/LanguageModal'; // adapte le chemin si nécessaire
import { getCurrentUserEmail, isAccountStillValidOnline, isUserLoggedIn } from '../lib/auth';
import { loadPlayers, savePlayers } from '../lib/storage';

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [players, setPlayers] = useState<string[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const storedPlayers = await loadPlayers();
      setPlayers(storedPlayers);

      const loggedIn = await isUserLoggedIn();
      if (!loggedIn) return;

      const stillValid = await isAccountStillValidOnline();
      if (!stillValid) {
        await AsyncStorage.clear();
        router.replace('/auth/login');
        return;
      }

      const email = await getCurrentUserEmail();
      const shouldShow = await AsyncStorage.getItem('showLoginModal');

      if (shouldShow === 'true') {
        setLoginEmail(email);
        setShowLoginModal(true);
        await AsyncStorage.removeItem('showLoginModal');
      }
    };

    init();
  }, []);

  const removePlayer = (name: string) => {
    const updated = players.filter((p) => p !== name);
    setPlayers(updated);
    savePlayers(updated);
  };

  const addPlayer = () => {
    const trimmed = newPlayerName.trim().toUpperCase();
    if (trimmed && !players.includes(trimmed)) {
      const updated = [...players, trimmed];
      setPlayers(updated);
      savePlayers(updated);
      setNewPlayerName('');
    }
  };

  const startGame = () =>
    router.push({
      pathname: '/menu',
      params: { players: JSON.stringify(players) },
    });

  return (
    <View style={styles.container}>
      <Modal
        visible={showLoginModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLoginModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowLoginModal(false)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalText}>
              {t('home.connectedWith')}{'\n'}
              <Text style={styles.modalEmail}>{loginEmail}</Text>
            </Text>
          </View>
        </View>
      </Modal>

      <View style={styles.block1}>
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.slogan}>{t('home.slogan')}</Text>
      </View>

      <View style={{ position: 'relative', width: '100%' }}>
        <FlatList
          data={players}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.playerList}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.playerChip} onPress={() => removePlayer(item)}>
              <Text style={styles.playerText}>✕ {item}</Text>
            </TouchableOpacity>
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
        {players.length > 3 && (
          <View style={styles.scrollHintContainer} pointerEvents="none">
            <Text style={styles.scrollHintText}>{t('home.scrollHint')}</Text>
          </View>
        )}
      </View>

      <View style={styles.block3}>
        <View style={styles.addPlayerContainer}>
          <TextInput
            style={styles.input}
            placeholder={t('home.playerPlaceholder')}
            placeholderTextColor="#aaa"
            value={newPlayerName}
            onChangeText={setNewPlayerName}
            onSubmitEditing={addPlayer}
            returnKeyType="done"
          />
          <TouchableOpacity style={styles.plusButton} onPress={addPlayer}>
            <Text style={styles.plusText}>＋</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.block4}>
        <TouchableOpacity
          style={styles.startButton}
          disabled={players.length === 0}
          onPress={startGame}
        >
          <Text style={styles.startText}>{t('home.start')}</Text>
        </TouchableOpacity>

        <View style={styles.optionsRow}>
          <TouchableOpacity style={styles.sideButton} onPress={() => setLanguageModalVisible(true)}>
            <Text style={styles.sideText}>🌐{'\n'}{t('home.language')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sideButton}
            onPress={() => router.push('/auth/profile')}
          >
            <Text style={styles.sideText}>👤{'\n'}{t('home.account')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sideButton}
            onPress={() => router.push('/contact')}
          >
            <Text style={styles.sideText}>✉️{'\n'}{t('home.contact')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sideButton}>
            <Text style={styles.sideText}>⭐{'\n'}{t('home.rate')}</Text>
          </TouchableOpacity>
        </View>
        
      </View>
      <LanguageModal
        visible={languageModalVisible}
        onClose={() => setLanguageModalVisible(false)}
      />
    </View>
  );
}


/* -------------------- Styles -------------------- */
const styles = StyleSheet.create({
  /* --- container et blocs existants --- */
  container: {
    flex: 1,
    backgroundColor: '#1a0000',
    paddingTop: 40,
  },
  block1: { flex: 2, justifyContent: 'center', alignItems: 'center' },
  block2: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  block3: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  block4: {
    flex: 4,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 20,
  },
  /* --- éléments existants --- */
  logo: { width: 300, height: 140 },
  slogan: {
    marginTop: 10,
    color: '#ffb347',
    fontSize: 14,
    fontWeight: '600',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  playerList: { paddingVertical: 10, alignItems: 'center' },
  playerChip: {
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  playerText: { fontWeight: '600', color: '#000', fontSize: 14 },
  addPlayerContainer: { flexDirection: 'row', alignItems: 'center' },
  input: {
    height: 42,
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingHorizontal: 16,
    color: '#000',
    marginRight: 10,
    fontSize: 14,
  },
  plusButton: {
    backgroundColor: '#ffb347',
    width: 42,
    height: 42,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  plusText: { fontSize: 26, color: '#000', fontWeight: '600' },
  startButton: {
    backgroundColor: '#ffb347',
    borderRadius: 999,
    width: 220,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  startText: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '90%',
    gap: 12,
  },
  sideButton: {
    width: 64,
    height: 64,
    borderRadius: 999,
    backgroundColor: '#2c0000',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#ffb347',
    borderWidth: 1,
  },
  sideText: { color: '#ffb347', textAlign: 'center', fontSize: 11, fontWeight: '600' },

  /* --- styles du Modal --- */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  modalClose: { position: 'absolute', top: 10, right: 10 },
  modalCloseText: { fontSize: 20, color: '#000' },
  modalText: { fontSize: 16, fontWeight: '600', textAlign: 'center', color: '#000' },
  modalEmail: { color: '#ff5722' },
  scrollHintContainer: {
  position: 'absolute',
  right: 10,
  top: '42%',
  backgroundColor: 'rgba(26,0,0,0.6)',
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 12,
  zIndex: 10,
  },
  scrollHintText: {
    color: '#ffb347',
    fontSize: 12,
    fontStyle: 'italic',
    fontWeight: '600',
  },

});
