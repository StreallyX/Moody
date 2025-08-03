import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function GuessWordCard({
  data,
  onNext,
  players,
  selectedPlayers,
}: {
  data: any;
  onNext: () => void;
  players: string[];
  selectedPlayers: string[];
}) {
  const [revealed, setRevealed] = useState(false);

  const from = selectedPlayers?.[0] ?? 'Joueur 1';
  const to = selectedPlayers?.[1] ?? 'Joueur 2';

  const displayWord = (word: string) => (revealed ? word : 'X'.repeat(word.length));

  const replacedText = data.text
    ?.replace('%PLAYER%', from)
    .replace('%PLAYER1%', to);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧩 Devine le mot</Text>

      <Text style={styles.instruction}>{replacedText}</Text>

      <View style={styles.wordBox}>
        <Text style={styles.label}>Mot :</Text>
        <Text style={styles.word}>{displayWord(data.word)}</Text>
      </View>

      <View style={styles.wordBox}>
        <Text style={styles.label}>Mots interdits :</Text>
        {data.forbidden?.map((w: string, i: number) => (
          <Text key={i} style={styles.forbiddenWord}>
            {displayWord(w)}
          </Text>
        ))}
      </View>

      <TouchableOpacity onPress={() => setRevealed(true)} style={styles.revealButton}>
        <Text style={styles.revealText}>
          {revealed ? '👁️ Affiché' : '👁️ Voir les mots'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.nextButton} onPress={() => onNext()}>
        <Text style={styles.nextText}>Continuer</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, color: '#fff', textAlign: 'center' },
  instruction: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 10,
    lineHeight: 26,
  },
  wordBox: {
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    color: '#ffb347',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  word: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  forbiddenWord: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 4,
  },
  revealButton: {
    marginTop: 10,
    backgroundColor: '#444',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginBottom: 20,
  },
  revealText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  nextButton: {
    backgroundColor: '#ffb347',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  nextText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
