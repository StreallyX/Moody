import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function HotSeatCard({ data, onNext }: { data: any; onNext: () => void }) {
  const [player, setPlayer] = useState('');

  useEffect(() => {
    const players: string[] = data.players || [];
    if (players.length === 0) {
      setPlayer('Un joueur');
    } else {
      const random = players[Math.floor(Math.random() * players.length)];
      setPlayer(random);
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔥 Hot Seat</Text>
      <Text style={styles.text}>{player}, tu es sur le gril !</Text>

      <View style={styles.questionBox}>
        <Text style={styles.question}>{data.text}</Text>
      </View>

      <Text style={styles.instruction}>Tu dois répondre honnêtement... ou boire ! 🍻</Text>

      <Pressable style={styles.button} onPress={onNext}>
        <Text style={styles.buttonText}>Suivant</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  text: { fontSize: 20, color: '#fff', marginBottom: 20, textAlign: 'center' },
  questionBox: { backgroundColor: '#111', padding: 20, borderRadius: 12, marginBottom: 20 },
  question: { fontSize: 22, color: '#0ff', textAlign: 'center' },
  instruction: { fontSize: 18, color: '#ccc', marginBottom: 30 },
  button: { backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 10 },
  buttonText: { fontSize: 18, fontWeight: 'bold', color: '#000' },
});
