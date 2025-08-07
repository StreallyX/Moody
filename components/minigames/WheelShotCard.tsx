import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const [turnPlayer] = useState(
    players[Math.floor(Math.random() * players.length)]
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const spinValue = useRef(new Animated.Value(0)).current;

  const spin = () => {
    if (spinning || selected) return;
    setSpinning(true);

    const extraTurns = Math.floor(Math.random() * 4) + 4;
    const randomSector = Math.floor(Math.random() * SECTORS.length);

    const finalDeg = -(extraTurns * 360 + randomSector * SECTOR_ANGLE);

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

  return (
    <View style={styles.container}>
      <Text style={styles.turnTxt}>
        {t('wheel.turn', { player: turnPlayer.toUpperCase() })}
      </Text>

      {!selected && (
        <View style={styles.pointerWrapper}>
          <View style={styles.pointer} />
        </View>
      )}

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

      {!selected ? (
        <TouchableOpacity
          style={[styles.spinBtn, spinning && styles.disabled]}
          onPress={spin}
          disabled={spinning}
        >
          <Text style={styles.spinTxt}>
            {spinning ? '...' : t('wheel.spin')}
          </Text>
        </TouchableOpacity>
      ) : (
        <>
          <Text style={styles.result}>
            {selected === 'SAFE'
              ? t('wheel.safe')
              : selected === 'SHOT'
              ? t('wheel.shot')
              : t('wheel.drink', { count: parseInt(selected) })}
          </Text>
          <TouchableOpacity style={styles.nextBtn} onPress={() => onNext()}>
            <Text style={styles.nextTxt}>➡ {t('wheel.next')}</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

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
    top: '25%',
    zIndex: 10,
    alignItems: 'center',
  },
  pointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 16,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#ffde59',
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
