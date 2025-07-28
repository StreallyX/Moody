// components/GameHeader.tsx
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function GameHeader({ round, onStatsPress }: { round: number; onStatsPress: () => void }) {
  const router = useRouter();
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.headerButton} onPress={() => router.replace('/')}>
        <Text style={styles.headerIcon}>⏹️</Text>
      </TouchableOpacity>
      <Text style={styles.headerText}>🎲 Tour #{round + 1}</Text>
      <TouchableOpacity style={styles.headerButton} onPress={onStatsPress}>
        <Text style={styles.headerIcon}>ℹ️</Text>
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
    padding: 8,
  },
  headerIcon: {
    fontSize: 26,
    color: '#fff',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
});
