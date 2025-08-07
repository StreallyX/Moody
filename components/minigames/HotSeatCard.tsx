import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function HotSeatCard({ data, onNext }: { data: any; onNext: () => void }) {
  const { t } = useTranslation();
  const [player, setPlayer] = useState('');

  useEffect(() => {
    const players: string[] = data.players || [];
    if (players.length === 0) {
      setPlayer(t('hotseat.defaultPlayer'));
    } else {
      const random = players[Math.floor(Math.random() * players.length)];
      setPlayer(random);
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('hotseat.title')}</Text>

      <View style={styles.playerTag}>
        <Text style={styles.playerText}>{t('hotseat.onGrill', { player })}</Text>
      </View>

      <View style={styles.questionBox}>
        <Text style={styles.question}>{data.text}</Text>
      </View>

      <Text style={styles.instruction}>{t('hotseat.instruction')}</Text>

      <Pressable style={styles.button} onPress={() => onNext()}>
        <Text style={styles.buttonText}>{t('hotseat.continue')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#ff6f3c',
    marginBottom: 20,
  },
  playerTag: {
    backgroundColor: '#400000',
    borderWidth: 5,
    borderColor: '#ff6f3c',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 30,
  },
  playerText: {
    color: '#fff',
    fontSize: 20,
    textAlign: 'center',
  },
  questionBox: {
    borderWidth: 5,
    borderColor: '#ff6f3c',
    borderRadius: 14,
    padding: 20,
    marginBottom: 30,
    backgroundColor: '#400000',
  },
  question: {
    fontSize: 22,
    color: '#fff0e6',
    textAlign: 'center',
    lineHeight: 30,
  },
  instruction: {
    fontSize: 18,
    color: '#ffd1b3',
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#ff6f3c',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 10,
  },
  buttonText: {
    color: '#2b0d0d',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
