import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function OracleCard({ data, players, onNext }: {
  data: any;
  players: string[];
  onNext: () => void;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔮 Oracle du groupe</Text>
      <Text style={styles.text}>{data.text}</Text>
      {/* TODO: Afficher les joueurs pour voter */}
      <TouchableOpacity onPress={onNext} style={styles.button}>
        <Text style={styles.buttonText}>Continuer</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#fff' },
  text: { fontSize: 18, textAlign: 'center', marginBottom: 30, color: '#fff' },
  button: { backgroundColor: '#ffb347', padding: 12, borderRadius: 10 },
  buttonText: { color: '#000', fontWeight: 'bold' },
});
