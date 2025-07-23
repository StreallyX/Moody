import { useRef, useState } from 'react';
import {
    Animated,
    Easing,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const SECTORS = ['1', '2', '3', '4', 'SHOT', 'SAFE'];
const SECTOR_ANGLE = 360 / SECTORS.length; // 60°

type Props = {
  players: string[];
  onNext: () => void;
};

export default function WheelShotCard({ players, onNext }: Props) {
  /* ───── états ───── */
  const [turnPlayer] = useState(
    players[Math.floor(Math.random() * players.length)]
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const spinValue = useRef(new Animated.Value(0)).current;

  /* ───── spin wheel ───── */
  const spin = () => {
    if (spinning || selected) return; // déjà fini
    setSpinning(true);
    const extraTurns = Math.floor(Math.random() * 4) + 4; // 4‑7 tours
    const randomSector = Math.floor(Math.random() * SECTORS.length);
    const finalDeg = extraTurns * 360 + randomSector * SECTOR_ANGLE;

    Animated.timing(spinValue, {
      toValue: finalDeg,
      duration: 2200,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start(() => {
      setSelected(SECTORS[randomSector]);
      setSpinning(false);
    });
  };

  const rotate = spinValue.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  /* ───── rendu ───── */
  return (
    <View style={styles.container}>
      <Text style={styles.turnTxt}>À {turnPlayer} de jouer !</Text>

      {/* flèche */}
      <View style={styles.pointer} />

      {/* roue */}
      <Animated.View style={[styles.wheel, { transform: [{ rotate }] }]}>
        {SECTORS.map((label, i) => {
          const angle = i * SECTOR_ANGLE;
          return (
            <View
              key={i}
              style={[
                styles.sector,
                {
                  transform: [
                    { rotate: `${angle}deg` },
                    { translateY: -105 },
                    { rotate: `${-angle}deg` },
                  ],
                },
              ]}
            >
              <Text style={styles.sectorTxt}>{label}</Text>
            </View>
          );
        })}
      </Animated.View>

      {/* bouton spin */}
      {!selected && (
        <TouchableOpacity
          style={[styles.spinBtn, (spinning || selected) && styles.disabled]}
          onPress={spin}
          disabled={spinning || !!selected}
        >
          <Text style={styles.spinTxt}>
            {spinning ? '...' : 'TOURNE !'}
          </Text>
        </TouchableOpacity>
      )}

      {/* résultat & next */}
      {selected && (
        <>
          <Text style={styles.result}>
            {selected === 'SAFE'
              ? 'SAFE 😇 choisi quelqu’un pour boire !'
              : selected === 'SHOT'
              ? 'Cul sec ! 🥃'
              : `Bois ${selected} gorgée(s) 🍻`}
          </Text>
          <TouchableOpacity style={styles.nextBtn} onPress={onNext}>
            <Text style={styles.nextTxt}>Suivant ➡</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

/* ───── styles ───── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#300000', alignItems: 'center', justifyContent: 'center' },
  turnTxt: { color: '#fff', fontSize: 24, marginBottom: 20 },
  pointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#f2b662',
    marginBottom: -10,
    zIndex: 10,
  },
  wheel: {
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: '#400010',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 6,
    borderColor: '#f72585',
  },
  sector: { position: 'absolute', alignItems: 'center' },
  sectorTxt: { color: '#f2b662', fontSize: 18, fontWeight: 'bold' },
  spinBtn: { backgroundColor: '#8ecae6', borderRadius: 20, paddingVertical: 10, paddingHorizontal: 40 },
  spinTxt: { color: '#000', fontWeight: 'bold', fontSize: 18 },
  disabled: { opacity: 0.5 },
  result: { color: '#fff', fontSize: 22, textAlign: 'center', marginVertical: 20 },
  nextBtn: { backgroundColor: '#f72585', borderRadius: 20, paddingVertical: 10, paddingHorizontal: 40 },
  nextTxt: { color: '#000', fontWeight: 'bold', fontSize: 18 },
});
