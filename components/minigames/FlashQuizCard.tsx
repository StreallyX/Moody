import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  data: {
    text: string;
    answer: boolean;
  };
  onNext: () => void;
};

export default function FlashQuizCard({ data, onNext }: Props) {
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleAnswer = (choice: boolean) => {
    const correct = choice === data.answer;
    setIsCorrect(correct);
    setAnswered(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎯 Vrai ou Faux</Text>

      <View style={styles.questionBox}>
        <Text style={styles.statement}>{data.text}</Text>
      </View>

      {!answered ? (
        <View style={styles.buttonsContainer}>
          <Pressable
            style={[styles.button, { backgroundColor: '#00cc66' }]}
            onPress={() => handleAnswer(true)}
          >
            <Text style={styles.buttonText}>✅ Vrai</Text>
          </Pressable>
          <Pressable
            style={[styles.button, { backgroundColor: '#cc0033' }]}
            onPress={() => handleAnswer(false)}
          >
            <Text style={styles.buttonText}>❌ Faux</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <Text style={[styles.feedback, { color: isCorrect ? '#0f0' : '#f00' }]}>
            {isCorrect ? 'Bonne réponse ! 🎉' : 'Faux ! Bois une gorgée ! 🍻'}
          </Text>
          <Pressable style={styles.nextButton} onPress={() => onNext()}>
            <Text style={styles.nextButtonText}>Suivant</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  questionBox: {
    backgroundColor: '#111',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  statement: {
    fontSize: 22,
    color: '#0ff',
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  feedback: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  nextButton: {
    marginTop: 20,
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
});
