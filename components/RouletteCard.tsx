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
          onPress={() => onNext({ level: -1, target: target! })} // 👈 ici on force level: -1
        >
          <Text style={styles.goTxt}>➡️ GO</Text>
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
  container: { flex: 1, backgroundColor: '#300000', paddingTop: 60 },
  helpBtn: {
    position: 'absolute',
    top: 50,
    right: 24,
    backgroundColor: '#f2b662',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  helpTxt: { fontSize: 22, fontWeight: 'bold', color: '#000' },

  turnText: {
    color: '#fff',
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 20,
  },

  slotRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: 30,
  },
  reel: {
    width: 140,
    height: 180,
    backgroundColor: '#400010',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#f72585',
  },
  reelLabel: {
    position: 'absolute',
    top: 8,
    color: '#f2b662',
    fontSize: 14,
    fontWeight: 'bold',
  },
  reelValue: {
    color: '#fff',
    fontSize: 42,
    fontWeight: 'bold',
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 30,
  },
  actionBtn: {
    backgroundColor: '#f72585',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  disabled: { opacity: 0.5 },
  actionTxt: { color: '#000', fontSize: 16, fontWeight: 'bold' },

  goBtn: {
    alignSelf: 'center',
    backgroundColor: '#8ecae6',
    borderRadius: 28,
    paddingVertical: 10,
    paddingHorizontal: 40,
  },
  goTxt: { fontSize: 22, fontWeight: 'bold' },

  /* modal */
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
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  modalText: { fontSize: 16, marginBottom: 20 },
  modalClose: {
    alignSelf: 'center',
    backgroundColor: '#f2b662',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  modalCloseTxt: { fontWeight: 'bold' },
});
