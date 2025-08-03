import { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function OracleCard({ data, players, onNext }: {
  data: any;
  players: string[];
  onNext: () => void;
}) {
  const [votes, setVotes] = useState<{ [key: string]: number }>({});
  const [voted, setVoted] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  const handleVote = (player: string) => {
    const newVotes = { ...votes, [player]: (votes[player] || 0) + 1 };
    setVotes(newVotes);
    setVoted(true);

    // Calculer gagnant
    const entries = Object.entries(newVotes);
    const top = entries.reduce((a, b) => (b[1] > a[1] ? b : a));
    setWinner(top[0]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔮 Oracle du groupe</Text>
      <Text style={styles.text}>{data.text}</Text>

      {!voted ? (
        <FlatList
          data={players}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.playerList}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.voteButton} onPress={() => handleVote(item)}>
              <Text style={styles.voteButtonText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <>
          <Text style={styles.resultText}>
            🎉 {winner} a été désigné par le groupe ! Il/elle boit 🍻
          </Text>
          <TouchableOpacity onPress={onNext} style={styles.button}>
            <Text style={styles.buttonText}>Continuer</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#fff', textAlign: 'center' },
  text: { fontSize: 18, textAlign: 'center', marginBottom: 30, color: '#fff' },
  playerList: {
    alignItems: 'center',
    gap: 10,
  },
  voteButton: {
    backgroundColor: '#333',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  voteButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  resultText: {
    fontSize: 20,
    color: '#ffb347',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#ffb347',
    padding: 12,
    borderRadius: 10,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
  },
});
