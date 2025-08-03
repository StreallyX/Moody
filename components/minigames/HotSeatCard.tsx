import { StyleSheet, Text, View } from 'react-native';

export default function HotSeatCard({ data, onNext }: { data: any; onNext: () => void }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔥 Hot Seat</Text>
      {/* TODO: Afficher joueur désigné + question */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
});
