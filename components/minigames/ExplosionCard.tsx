import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function ExplosionCard({
  data,
  onNext,
}: {
  data: any;
  onNext: () => void;
}) {
  const [correctIndex, setCorrectIndex] = useState<number>(-1);
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);
  const [status, setStatus] = useState<'playing' | 'success' | 'fail' | 'timeout'>('playing');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation rebond de la bombe
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -10,
          duration: 300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Choisit un bouton au hasard
    const index = Math.floor(Math.random() * 3);
    setCorrectIndex(index);

    // Timer de 5 secondes pour agir
    timerRef.current = setTimeout(() => {
      if (clickedIndex === null) {
        setStatus('timeout');
      }
    }, 5000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handlePress = (index: number) => {
    if (status !== 'playing') return;
    setClickedIndex(index);
    if (index === correctIndex) {
      setStatus('success');
    } else {
      setStatus('fail');
    }
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const renderButtons = () => {
    return [0, 1, 2].map((index) => (
      <Pressable
        key={index}
        onPress={() => handlePress(index)}
        style={[
          styles.button,
          clickedIndex === index && (status === 'fail' ? styles.buttonFail : styles.buttonSafe),
        ]}
      >
        <Text style={styles.buttonText}>Fil {index + 1}</Text>
      </Pressable>
    ));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Désamorce la bombe !</Text>

      {status === 'playing' && (
        <>
          <Animated.View style={[styles.bombContainer, { transform: [{ translateY: bounceAnim }] }]}>
            <Image
              source={require('../../assets/images/bomb.png')} // ajoute une image bomb.png dans /assets
              style={styles.bomb}
              resizeMode="contain"
            />
          </Animated.View>
          <Text style={styles.instructions}>Un seul fil désamorce la bombe. Tu as 5 secondes !</Text>
          <View style={styles.buttonRow}>{renderButtons()}</View>
        </>
      )}

      {status === 'success' && (
        <>
          <Text style={styles.success}>Bien joué, tu as désamorcé la bombe !</Text>
          <Pressable style={styles.nextButton} onPress={() => onNext()}>
            <Text style={styles.nextText}>Suivant</Text>
          </Pressable>
        </>
      )}

      {status === 'fail' && (
        <>
          <Text style={styles.fail}>Mauvais fil... BOUM !</Text>
          <Pressable style={styles.nextButton} onPress={() => onNext()}>
            <Text style={styles.nextText}>Suivant</Text>
          </Pressable>
        </>
      )}

      {status === 'timeout' && (
        <>
          <Text style={styles.fail}>Trop tard... La bombe a explosé !</Text>
          <Pressable style={styles.nextButton} onPress={() => onNext()}>
            <Text style={styles.nextText}>Suivant</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  instructions: { fontSize: 18, color: '#ccc', marginBottom: 20, textAlign: 'center' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  button: {
    backgroundColor: '#444',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  buttonText: { fontSize: 18, color: '#fff', fontWeight: 'bold' },
  buttonSafe: { backgroundColor: '#2ecc71' },
  buttonFail: { backgroundColor: '#e74c3c' },
  success: { fontSize: 22, color: '#0f0', textAlign: 'center', marginBottom: 20 },
  fail: { fontSize: 22, color: '#f00', textAlign: 'center', marginBottom: 20 },
  nextButton: { backgroundColor: '#fff', padding: 12, borderRadius: 8 },
  nextText: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  bombContainer: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  bomb: {
    width: '100%',
    height: '100%',
  },
});
