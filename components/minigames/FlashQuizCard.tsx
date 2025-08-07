import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  data: {
    text: string;
    answer: boolean;
  };
  onNext: () => void;
};

export default function FlashQuizCard({ data, onNext }: Props) {
  const { t } = useTranslation();
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleAnswer = (choice: boolean) => {
    const correct = choice === data.answer;
    setIsCorrect(correct);
    setAnswered(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('flash.title')}</Text>

      <View style={styles.questionBox}>
        <Text style={styles.statement}>{data.text}</Text>
      </View>

      {!answered ? (
        <View style={styles.buttonsContainer}>
          <Pressable
            style={[styles.button, { backgroundColor: '#00cc66' }]}
            onPress={() => handleAnswer(true)}
          >
            <Text style={styles.buttonText}>{t('flash.true')}</Text>
          </Pressable>
          <Pressable
            style={[styles.button, { backgroundColor: '#cc0033' }]}
            onPress={() => handleAnswer(false)}
          >
            <Text style={styles.buttonText}>{t('flash.false')}</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <Text
            style={[
              styles.feedback,
              { color: isCorrect ? '#7CFC00' : '#ff4d4d' },
            ]}
          >
            {isCorrect ? t('flash.correct') : t('flash.wrong')}
          </Text>
          <Pressable style={styles.nextButton} onPress={() => onNext()}>
            <Text style={styles.nextButtonText}>{t('flash.next')}</Text>
          </Pressable>
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
    padding: 30,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
    textAlign: 'center',
  },
  questionBox: {
    padding: 24,
    borderRadius: 14,
    marginBottom: 30,
    width: '100%',
  },
  statement: {
    fontSize: 22,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 30,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 26,
    borderRadius: 10,
    minWidth: 110,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  feedback: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 30,
    textAlign: 'center',
  },
  nextButton: {
    marginTop: 20,
    backgroundColor: '#b6ffcc',
    paddingVertical: 12,
    paddingHorizontal: 34,
    borderRadius: 10,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0b2e22',
  },
});
