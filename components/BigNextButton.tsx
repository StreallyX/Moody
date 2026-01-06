import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { haptics } from '../utils/haptics';

interface BigNextButtonProps {
  onPress: () => void;
  label?: string;
}

export default function BigNextButton({ onPress, label = 'NEXT' }: BigNextButtonProps) {
  const handlePress = () => {
    haptics.lightTap();
    onPress();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Text style={styles.text}>{label}</Text>
        <Text style={styles.arrow}>→</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 20,
  },
  button: {
    width: '60%',
    backgroundColor: '#e94560',
    borderRadius: 25,
    paddingVertical: 20,
    paddingHorizontal: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  text: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  arrow: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
});
