import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity } from 'react-native';


export default function ReflexGame({ players, onNext }: { players: string[]; onNext: () => void }) {
  const [player, setPlayer] = useState('');
  const [step, setStep] = useState<'intro' | 'waiting' | 'ready' | 'clicked' | 'result'>('intro');
  const [bgColor, setBgColor] = useState('#000');
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
      // Trop tôt
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setMessage('Trop tôt ! Tu triches 😤');
      setBgColor('#333');
      setStep('result');
    } else if (step === 'ready') {
      const end = Date.now();
      const time = end - startRef.current;
      setReactionTime(time);
      setBgColor('orange');
      setStep('clicked');

      setTimeout(() => {
        if (time < 200) setMessage("T’as pas assez bu, bois ! 🍺");
        else if (time < 400) setMessage("Pas mal, mais tu peux faire mieux.");
        else if (time < 600) setMessage("Oula t'es lent... Encore un shot ?");
        else setMessage("T’as bien bu toi... 🥴");
        setStep('result');
      }, 800);
    }
  };

  return (
    <Pressable style={[styles.container, { backgroundColor: bgColor }]} onPress={handlePress}>
      {step === 'intro' && (
        <>
          <Text style={styles.title}>{player} joue !</Text>
          <Text style={styles.instructions}>
            Quand l’écran devient vert, clique le plus vite possible !
          </Text>
          <Pressable style={styles.button} onPress={startGame}>
            <Text style={styles.buttonText}>READY</Text>
          </Pressable>
        </>
      )}

      {step === 'waiting' && (
        <Text style={styles.waitingText}>Prépare-toi...</Text>
      )}

      {step === 'ready' && (
        <Text style={styles.goText}>GO !</Text>
      )}

      {step === 'clicked' && (
        <Text style={styles.timerText}>{reactionTime} ms</Text>
      )}

      {step === 'result' && (
        <>
          <Text style={styles.resultText}>{message}</Text>
          <TouchableOpacity style={styles.button} onPress={() => onNext()}>
            <Text style={styles.buttonText}>Suivant</Text>
          </TouchableOpacity>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  instructions: { fontSize: 18, color: '#ccc', textAlign: 'center', marginHorizontal: 30, marginBottom: 20 },
  waitingText: { fontSize: 24, color: '#fff' },
  goText: { fontSize: 48, fontWeight: 'bold', color: '#fff' },
  timerText: { fontSize: 40, fontWeight: 'bold', color: '#fff' },
  resultText: { fontSize: 24, color: '#fff', textAlign: 'center', marginHorizontal: 20, marginBottom: 20 },
  button: { marginTop: 20, backgroundColor: '#fff', padding: 12, borderRadius: 10 },
  buttonText: { fontSize: 18, fontWeight: 'bold', color: '#000' },
});
