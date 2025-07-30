// components/SlotRouletteCard.tsx
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

type Props = {
  players: string[];
  onNext: (payload: { level: number; target: string }) => void;
};

export default function SlotRouletteCard({ players, onNext }: Props) {
  /* ───────── états ───────── */
  const [helpVisible, setHelpVisible] = useState(false);

  /** joueur à qui c’est le tour (intro) */
  const [turnPlayer] = useState(
    players[Math.floor(Math.random() * players.length)]
  );

  /** résultat final */
  const [number, setNumber] = useState<number | null>(null);
  const [target, setTarget] = useState<string | null>(null);

  /** spinning flags -> désactivation des boutons */
  const [spinNum, setSpinNum] = useState(false);
  const [spinPlayer, setSpinPlayer] = useState(false);

  /* ───────── animation intro nom qui monte ───────── */
  const introY = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(introY, {
      toValue: -80,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  /* ───────── helpers de spin ───────── */
  const runNumberSpin = () => {
    if (spinNum) return;
    setSpinNum(true);
    let tick = 0;
    const id = setInterval(() => {
      tick++;
      setNumber(Math.floor(Math.random() * 10) + 1);
    }, 70);
    setTimeout(() => {
      clearInterval(id);
      const final = Math.floor(Math.random() * 10) + 1;
      setNumber(final);
      setSpinNum(false);
    }, 1500);
  };

  const runPlayerSpin = () => {
    if (spinPlayer) return;
    setSpinPlayer(true);
    let tick = 0;
    const id = setInterval(() => {
      tick++;
      setTarget(players[Math.floor(Math.random() * players.length)]);
    }, 90);
    setTimeout(() => {
      clearInterval(id);
      const final = players[Math.floor(Math.random() * players.length)];
      setTarget(final);
      setSpinPlayer(false);
    }, 1700);
  };

  /* ───────── ready to go ? ───────── */
  const ready = number !== null && target !== null && !spinNum && !spinPlayer;

  /* ───────── rendu ───────── */
  return (
    <View style={styles.container}>
      {/* bouton aide */}
      <TouchableOpacity
        style={styles.helpBtn}
        onPress={() => setHelpVisible(true)}
      >
        <Text style={styles.helpTxt}>?</Text>
      </TouchableOpacity>

      {/* intro / nom qui monte */}
      <Animated.Text
        style={[
          styles.turnText,
          { transform: [{ translateY: introY }] },
        ]}
      >
        À {turnPlayer} de jouer !
      </Animated.Text>

      {/* rouleaux */}
      <View style={styles.slotRow}>
        {/* rouleau gauche : nombre */}
        <View style={styles.reel}>
          <Text style={styles.reelLabel}>DEFI</Text>
          <Text style={styles.reelValue}>{number ?? '-'}</Text>
        </View>

        {/* rouleau droit : prénom */}
        <View style={styles.reel}>
          <Text style={styles.reelLabel}>JOUEUR</Text>
          <Text style={styles.reelValue}>{target ?? '- - -'}</Text>
        </View>
      </View>

      {/* boutons spin */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.actionBtn,
            spinNum && styles.disabled,
          ]}
          onPress={runNumberSpin}
          disabled={spinNum}
        >
          <Text style={styles.actionTxt}>Défi (1 shot)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionBtn,
            spinPlayer && styles.disabled,
          ]}
          onPress={runPlayerSpin}
          disabled={spinPlayer}
        >
          <Text style={styles.actionTxt}>Personne (2 shots)</Text>
        </TouchableOpacity>
      </View>

      {/* flèche “go” */}
      {ready && (
        <TouchableOpacity
          style={styles.goBtn}
          onPress={() => onNext({ level: number!, target: target! })}
        >
          <Text style={styles.goTxt}>➡ GO</Text>
        </TouchableOpacity>
      )}


      {/* modal aide */}
      <Modal visible={helpVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Règles</Text>
            <Text style={styles.modalText}>
              1. Clique « Défi » pour faire tourner le chiffre (1 ‑ 10).{'\n'}
              2. Clique « Personne » pour désigner qui boira.{'\n'}
              3. Quand les deux rouleaux sont fixés, appuie sur ➡️ GO pour
              révéler le défi correspondant !
            </Text>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setHelpVisible(false)}
            >
              <Text style={styles.modalCloseTxt}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ───────── styles ───────── */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0022', // FOND violet très foncé
    paddingTop: 60,
  },
  helpBtn: {
    position: 'absolute',
    top: 100,
    right: 24,
    backgroundColor: '#ffd166',
    width: 70,
    height: 70,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  helpTxt: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },

  turnText: {
    color: '#fefae0',
    fontSize: 34,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 40,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 2,
  },

  slotRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: 30,
  },
  reel: {
    width: 140,
    height: 180,
    backgroundColor: '#061a40',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#ffd166',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  reelLabel: {
    position: 'absolute',
    top: 10,
    color: '#ffd166',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  reelValue: {
    color: '#ffffff',
    fontSize: 48,
    fontWeight: 'bold',
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 30,
  },
  actionBtn: {
    backgroundColor: '#06d6a0',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    shadowColor: '#06d6a0',
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  disabled: { opacity: 0.5 },
  actionTxt: {
    color: '#001219',
    fontSize: 16,
    fontWeight: 'bold',
  },

  goBtn: {
    alignSelf: 'center',
    backgroundColor: '#061a40',
    borderRadius: 28,
    paddingVertical: 10,
    paddingHorizontal: 40,
    marginTop: 20,
    shadowColor: '#ef476f',
    shadowOpacity: 0.8,
    shadowRadius: 6,
    borderWidth: 4,
    borderColor: '#ffd166'
  },
  goTxt: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },

  // modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: '#000a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBox: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
  },
  modalClose: {
    alignSelf: 'center',
    backgroundColor: '#ffd166',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  modalCloseTxt: {
    fontWeight: 'bold',
  },
});
