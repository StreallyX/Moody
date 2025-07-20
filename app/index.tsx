import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

  const [players, setPlayers] = useState<string[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');

  const removePlayer = (name: string) =>
    setPlayers(players.filter((p) => p !== name));

  const addPlayer = () => {
    const trimmed = newPlayerName.trim().toUpperCase();
    if (trimmed && !players.includes(trimmed)) {
      setPlayers([...players, trimmed]);
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
        {/* Bouton Commencer */}
        <TouchableOpacity
          style={styles.startButton}
          disabled={players.length === 0}
          onPress={startGame}
        >
          <Text style={styles.startText}>🎮 Commencer</Text>
        </TouchableOpacity>

        {/* 4 boutons alignés */}
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
    backgroundColor: '#300000',
  },

  // bloc par section
  block1: { flex: 2, justifyContent: 'center', alignItems: 'center' }, // logo 20%
  block2: { flex: 2, justifyContent: 'center', alignItems: 'center' }, // liste 20%
  block3: { flex: 1, justifyContent: 'center', alignItems: 'center' }, // input 10%
  block4: { flex: 5, alignItems: 'center', justifyContent: 'space-evenly' }, // cercle 50%

  logo: {
    width: 220,
    height: 100,
  },

  playerList: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  playerChip: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginHorizontal: 5,
  },
  playerText: {
    fontWeight: 'bold',
    color: '#000',
  },

  addPlayerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    height: 40,
    width: 180,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 15,
    color: '#000',
    marginRight: 10,
  },
  plusButton: {
    backgroundColor: '#f2b662',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusText: {
    fontSize: 24,
    color: '#000',
  },

  startButton: {
    backgroundColor: '#f2b662',
    borderRadius: 50,
    width: 200,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
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
  },

  sideButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  sideText: {
    color: '#f2b662',
    textAlign: 'center',
    fontSize: 12,
  },
});
