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
const SECTOR_ANGLE = 360 / SECTORS.length;

type Props = { players: string[]; onNext: () => void };

export default function WheelShotCard({ players, onNext }: Props) {
  const [turnPlayer] = useState(
    players[Math.floor(Math.random() * players.length)]
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const spinValue = useRef(new Animated.Value(0)).current;

  /* ───────── spin ───────── */
  const spin = () => {
    if (spinning || selected) return;
    setSpinning(true);

    const extraTurns = Math.floor(Math.random() * 4) + 4;   // 4‑7 tours
    const randomSector = Math.floor(Math.random() * SECTORS.length);

    // angle (en °) pour que le sector voulu arrive sous la flèche
    const finalDeg = -(extraTurns * 360 + randomSector * SECTOR_ANGLE); // signe ‑

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

  /* ───────── rendu ───────── */
  return (
    <View style={styles.container}>
      <Text style={styles.turnTxt}>À {turnPlayer.toUpperCase()} DE JOUER !</Text>

      {/* flèche uniquement avant sélection */}
      {!selected && (
        <View style={styles.pointerWrapper}>
          <View style={styles.pointer} />
        </View>
      )}


      {/* roue animée */}
      <Animated.View
        style={[
          styles.wheel,
          {
            transform: [
              {
                rotate: spinValue.interpolate({
                  inputRange: [-360, 0],
                  outputRange: ['-360deg', '0deg'],
                  extrapolate: 'extend',
                }),
              },
            ],
          },
        ]}
      >
        {SECTORS.map((label, i) => {
          const a = i * SECTOR_ANGLE;
          return (
            <View
              key={label}
              style={[
                styles.sector,
                {
                  transform: [
                    { rotate: `${a}deg` },
                    { translateY: -105 },
                    { rotate: `${-a}deg` },
                  ],
                },
              ]}
            >
              <Text style={styles.sectorTxt}>{label}</Text>
            </View>
          );
        })}
      </Animated.View>

      {/* bouton spin / résultat */}
      {!selected ? (
        <TouchableOpacity
          style={[styles.spinBtn, spinning && styles.disabled]}
          onPress={spin}
          disabled={spinning}
        >
          <Text style={styles.spinTxt}>{spinning ? '...' : 'TOURNE !'}</Text>
        </TouchableOpacity>
      ) : (
        <>
          <Text style={styles.result}>
            {selected === 'SAFE'
              ? 'SAFE — choisis qui boit !'
              : selected === 'SHOT'
              ? 'Cul sec !'
              : `Bois ${selected} gorgée(s) !`}
          </Text>
          <TouchableOpacity style={styles.nextBtn} onPress={onNext}>
            <Text style={styles.nextTxt}>➡ Suivant</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

/* ───────── styles ───────── */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4a004f',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  turnTxt: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 65,
    marginTop: -50,
  },
  pointerWrapper: {
    position: 'absolute',
    top: '32%', // ← remonte la flèche
    zIndex: 10,
    alignItems: 'center',
  },
  pointer: {
  width: 0,
  height: 0,
  borderLeftWidth: 10,
  borderRightWidth: 10,
  borderTopWidth: 16, // 🔁 inversé
  borderLeftColor: 'transparent',
  borderRightColor: 'transparent',
  borderTopColor: '#ffde59', // 🔁 inversé
},

  wheel: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#4a004f',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 6,
    borderColor: '#f72585',
    shadowColor: '#f72585',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 15,
  },
  sector: { position: 'absolute', alignItems: 'center' },
  sectorTxt: {
    color: '#ffde59',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  spinBtn: {
    backgroundColor: '#ff4d6d',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 40,
    shadowColor: '#ff4d6d',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  spinTxt: { color: '#fff', fontWeight: 'bold', fontSize: 20 },
  disabled: { opacity: 0.5 },
  result: {
    color: '#fff',
    fontSize: 22,
    textAlign: 'center',
    marginVertical: 30,
    paddingHorizontal: 20,
  },
  nextBtn: {
    backgroundColor: '#7209b7',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 40,
    shadowColor: '#7209b7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  nextTxt: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});
