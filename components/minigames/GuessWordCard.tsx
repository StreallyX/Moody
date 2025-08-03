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
  const [step, setStep] = useState(1);
  const [revealed, setRevealed] = useState(false);

  const from = selectedPlayers?.[0] ?? 'Joueur 1';
  const to = selectedPlayers?.[1] ?? 'Joueur 2';

  const displayWord = (word: string) => (revealed ? word : '*'.repeat(word.length));

  const replacedText = data.text
    ?.replace('%PLAYER%', from)
    .replace('%PLAYER1%', to);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Devine le mot</Text>

      {step === 1 ? (
        <>
          <Text style={styles.instructions}>{replacedText}</Text>
          <TouchableOpacity style={styles.buttonOutlined} onPress={() => setStep(2)}>
            <Text style={styles.buttonText}>Afficher le mot</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={styles.wordBox}>
            <Text style={styles.label}>Mot :</Text>
            <Text style={styles.wordBoxText}>{displayWord(data.word)}</Text>
          </View>

          <View style={styles.wordBox}>
            <Text style={styles.label}>Mots interdits :</Text>
            <Text style={styles.wordBoxText}>
              {data.forbidden?.map((w: string) => displayWord(w)).join(' / ')}
            </Text>
          </View>

          {!revealed ? (
            <TouchableOpacity onPress={() => setRevealed(true)} style={styles.buttonOutlined}>
              <Text style={styles.buttonText}>👁️ Voir les mots</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.buttonFilled} onPress={() => onNext()}>
              <Text style={styles.buttonTextDark}>Continuer</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#7fcfff',
    textAlign: 'center',
  },
  instructions: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 30,
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  wordBox: {
    alignItems: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 20,
    color: '#7fcfff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  wordBoxText: {
    fontSize: 24,
    color: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: '#7fcfff',
    borderRadius: 10,
    textAlign: 'center',
  },
  buttonOutlined: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 26,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#7fcfff',
    marginBottom: 24,
  },
  buttonFilled: {
    backgroundColor: '#7fcfff',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: '#7fcfff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonTextDark: {
    color: '#001f2f',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
