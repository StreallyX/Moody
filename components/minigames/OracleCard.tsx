import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

export default function OracleCard({
  data,
  players,
  onNext,
}: {
  data: any;
  players: string[];
  onNext: () => void;
}) {
  const [votes, setVotes] = useState<{ [key: string]: number }>({});
  const [voted, setVoted] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const { height } = useWindowDimensions();

  const handleVote = (player: string) => {
    const newVotes = { ...votes, [player]: (votes[player] || 0) + 1 };
    setVotes(newVotes);
    setVoted(true);

    const entries = Object.entries(newVotes);
    const top = entries.reduce((a, b) => (b[1] > a[1] ? b : a));
    setWinner(top[0]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔮 Oracle du groupe</Text>
        <Text style={styles.text}>{data.text}</Text>
      </View>

      {!voted ? (
        <ScrollView
          contentContainerStyle={styles.playerList}
          showsVerticalScrollIndicator={false}
          style={{ maxHeight: height * 0.5, width: '100%' }}
        >
          {players.map((player) => (
            <TouchableOpacity
              key={player}
              style={styles.voteButton}
              onPress={() => handleVote(player)}
            >
              <Text style={styles.voteButtonText}>Vote pour</Text>
              <Text style={styles.voteButtonName}>{player}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>🎉 Verdict de l’oracle</Text>
          <Text style={styles.resultText}>
            <Text style={{ fontWeight: 'bold', color: '#fff' }}>{winner}</Text> a été désigné par le groupe ! Il/elle boit 🍻
          </Text>
        </View>
      )}

      {voted && (
        <TouchableOpacity style={styles.button} onPress={() => onNext()}>
          <Text style={styles.buttonText}>Continuer</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
    backgroundColor: 'transparent',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  header: {
    marginBottom: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
    lineHeight: 28,
  },
  playerList: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
    width: '100%',
  },
  voteButton: {
    borderColor: '#b266ff',
    borderWidth: 5,
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 12,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  voteButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  voteButtonName: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  resultBox: {
    backgroundColor: '#1a001a',
    borderColor: '#b266ff',
    borderWidth: 2,
    borderRadius: 14,
    paddingVertical: 20,
    paddingHorizontal: 24,
    marginTop: 30,
    marginBottom: 20,
    width: '90%',
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 22,
    color: '#b266ff',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  resultText: {
    fontSize: 18,
    color: '#ddd',
    textAlign: 'center',
    lineHeight: 28,
  },
  button: {
    backgroundColor: '#ffb347',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
