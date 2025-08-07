import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  const [helpVisible, setHelpVisible] = useState(false);
  const [turnPlayer] = useState(players[Math.floor(Math.random() * players.length)]);
  const [number, setNumber] = useState<number | null>(null);
  const [target, setTarget] = useState<string | null>(null);
  const [spinNum, setSpinNum] = useState(false);
  const [spinPlayer, setSpinPlayer] = useState(false);

  const introY = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(introY, {
      toValue: -80,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  const runNumberSpin = () => {
    if (spinNum) return;
    setSpinNum(true);
    const id = setInterval(() => {
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
    const id = setInterval(() => {
      setTarget(players[Math.floor(Math.random() * players.length)]);
    }, 90);
    setTimeout(() => {
      clearInterval(id);
      const final = players[Math.floor(Math.random() * players.length)];
      setTarget(final);
      setSpinPlayer(false);
    }, 1700);
  };

  const ready = number !== null && target !== null && !spinNum && !spinPlayer;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.helpBtn} onPress={() => setHelpVisible(true)}>
        <Text style={styles.helpTxt}>?</Text>
      </TouchableOpacity>

      <Animated.Text
        style={[styles.turnText, { transform: [{ translateY: introY }] }]}
      >
        {t('slot.intro', { player: turnPlayer })}
      </Animated.Text>

      <View style={styles.slotRow}>
        <View style={styles.reel}>
          <Text style={styles.reelLabel}>{t('slot.challenge')}</Text>
          <Text style={styles.reelValue}>{number ?? '-'}</Text>
        </View>

        <View style={styles.reel}>
          <Text style={styles.reelLabel}>{t('slot.player')}</Text>
          <Text style={styles.reelValue}>{target ?? '- - -'}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, spinNum && styles.disabled]}
          onPress={runNumberSpin}
          disabled={spinNum}
        >
          <Text style={styles.actionTxt}>{t('slot.spinChallenge')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, spinPlayer && styles.disabled]}
          onPress={runPlayerSpin}
          disabled={spinPlayer}
        >
          <Text style={styles.actionTxt}>{t('slot.spinPlayer')}</Text>
        </TouchableOpacity>
      </View>

      {ready && (
        <TouchableOpacity
          style={styles.goBtn}
          onPress={() => onNext({ level: number!, target: target! })}
        >
          <Text style={styles.goTxt}>➡ GO</Text>
        </TouchableOpacity>
      )}

      <Modal visible={helpVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{t('slot.rulesTitle')}</Text>
            <Text style={styles.modalText}>{t('slot.rulesText')}</Text>
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
    width: 50,
    height: 50,
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
    marginBottom: 0,
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
