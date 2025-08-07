import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, TouchableOpacity } from 'react-native';

export default function ReflexGame({ players, onNext }: { players: string[]; onNext: () => void }) {
  const { t } = useTranslation();
  const [player, setPlayer] = useState('');
  const [step, setStep] = useState<'intro' | 'waiting' | 'ready' | 'clicked' | 'result'>('intro');
  const [bgColor, setBgColor] = useState('');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const startRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const chosen = players[Math.floor(Math.random() * players.length)];
    setPlayer(chosen);
  }, []);

  const startGame = () => {
    setStep('waiting');
    setBgColor('red');
    const randomDelay = 1000 + Math.random() * 2000;

    timeoutRef.current = setTimeout(() => {
      setStep('ready');
      setBgColor('green');
      startRef.current = Date.now();
    }, randomDelay);
  };

  const handlePress = () => {
    if (step === 'waiting') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setMessage(t('reflex.tooEarly'));
      setBgColor('#333');
      setStep('result');
    } else if (step === 'ready') {
      const end = Date.now();
      const time = end - startRef.current;
      setReactionTime(time);
      setBgColor('orange');
      setStep('clicked');

      setTimeout(() => {
        if (time < 200) setMessage(t('reflex.feedback1'));
        else if (time < 400) setMessage(t('reflex.feedback2'));
        else if (time < 600) setMessage(t('reflex.feedback3'));
        else setMessage(t('reflex.feedback4'));
        setStep('result');
      }, 800);
    }
  };

  return (
    <Pressable style={[styles.container, { backgroundColor: bgColor }]} onPress={handlePress}>
      {step === 'intro' && (
        <>
          <Text style={styles.title}>{t('reflex.playerTurn', { player })}</Text>
          <Text style={styles.instructions}>{t('reflex.instructions')}</Text>
          <Pressable style={styles.button} onPress={startGame}>
            <Text style={styles.buttonText}>{t('reflex.ready')}</Text>
          </Pressable>
        </>
      )}

      {step === 'waiting' && <Text style={styles.waitingText}>{t('reflex.prepare')}</Text>}

      {step === 'ready' && <Text style={styles.goText}>GO !</Text>}

      {step === 'clicked' && <Text style={styles.timerText}>{reactionTime} ms</Text>}

      {step === 'result' && (
        <>
          <Text style={styles.resultText}>{message}</Text>
          <TouchableOpacity style={styles.button} onPress={() => onNext()}>
            <Text style={styles.buttonText}>{t('reflex.next')}</Text>
          </TouchableOpacity>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  instructions: {
    fontSize: 18,
    color: '#ccc',
    textAlign: 'center',
    marginHorizontal: 30,
    marginBottom: 20,
  },
  waitingText: { fontSize: 24, color: '#fff' },
  goText: { fontSize: 48, fontWeight: 'bold', color: '#fff' },
  timerText: { fontSize: 40, fontWeight: 'bold', color: '#fff' },
  resultText: {
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
  },
  buttonText: { fontSize: 18, fontWeight: 'bold', color: '#000' },
});
