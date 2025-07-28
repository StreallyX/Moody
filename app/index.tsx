import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { loadPlayers, savePlayers } from '../lib/storage'; // adapte le chemin si nécessaire

export default function HomeScreen() {
  const router = useRouter();

  const [players, setPlayers] = useState<string[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');

  useEffect(() => {
    loadPlayers().then(setPlayers);
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
      {/* Bloc logo */}
      <View style={styles.block1}>
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.slogan}>Le jeu qui chauffe l’ambiance 🔥</Text>
      </View>

      {/* Bloc liste des joueurs */}
      <View style={styles.block2}>
        <FlatList
          data={players}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.playerList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.playerChip}
              onPress={() => removePlayer(item)}
            >
              <Text style={styles.playerText}>✕ {item}</Text>
            </TouchableOpacity>
          )}
          horizontal
        />
      </View>

      {/* Bloc ajout de joueur */}
      <View style={styles.block3}>
        <View style={styles.addPlayerContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nom du joueur"
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

      {/* Bloc bouton Commencer + boutons horizontaux */}
      <View style={styles.block4}>
        <TouchableOpacity
          style={styles.startButton}
          disabled={players.length === 0}
          onPress={startGame}
        >
          <Text style={styles.startText}>Commencer</Text>
        </TouchableOpacity>

        <View style={styles.optionsRow}>
          <TouchableOpacity style={styles.sideButton}>
            <Text style={styles.sideText}>🌐{'\n'}Langue</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sideButton}>
            <Text style={styles.sideText}>🔗{'\n'}Partager</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sideButton}>
            <Text style={styles.sideText}>✉️{'\n'}Contact</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sideButton}>
            <Text style={styles.sideText}>⭐{'\n'}Noter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0000',
    paddingTop: 40,
  },
  block1: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  block2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  block3: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  block4: {
    flex: 4,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 20,
  },
  logo: {
    width: 300,
    height: 140,
  },
  slogan: {
    marginTop: 10,
    color: '#ffb347',
    fontSize: 14,
    fontWeight: '600',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  playerList: {
    paddingVertical: 10,
    alignItems: 'center',
  },
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
  playerText: {
    fontWeight: '600',
    color: '#000',
    fontSize: 14,
  },
  addPlayerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
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
  plusText: {
    fontSize: 26,
    color: '#000',
    fontWeight: '600',
  },
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
  startText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
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
  sideText: {
    color: '#ffb347',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
  },
});
