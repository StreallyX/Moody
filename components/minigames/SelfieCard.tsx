import { StyleSheet, Text, View } from 'react-native';

export default function SelfieCard({ data, onNext }: { data: any; onNext: () => void }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📸 Selfie Challenge</Text>
      {/* TODO: Afficher le challenge + possibilité de lancer appareil photo */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
});
