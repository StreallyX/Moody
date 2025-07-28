import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function GameHeader({
  round,
  onStatsPress,
}: {
  round: number;
  onStatsPress: () => void;
}) {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={[styles.headerButton, styles.exitButton]}
        onPress={() => router.replace('/')}
      >
        <Icon name="sign-out" size={18} color="#fff" />
      </TouchableOpacity>

      <View style={styles.roundContainer}>
        <Text style={styles.roundText}>Tour #{round + 1}</Text>
      </View>

      <TouchableOpacity
        style={[styles.headerButton, styles.infoButton]}
        onPress={onStatsPress}
      >
        <Icon name="info-circle" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 50,
    paddingHorizontal: 20,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  exitButton: {
    backgroundColor: '#b71c1c',
  },
  infoButton: {
    backgroundColor: '#2c2c2c',
  },
  roundContainer: {
    backgroundColor: '#ffb347',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  roundText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a0000',
    textAlign: 'center',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
