import { StyleSheet, Text, View } from 'react-native';

export default function ExplosionCard({ data, onNext }: { data: any; onNext: () => void }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>💥 Explosion</Text>
      {/* TODO: logique bombe / désamorçage */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
});
