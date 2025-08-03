import { StyleSheet, Text, View } from 'react-native';

export default function GuessWordCard({ data, onNext }: { data: any; onNext: () => void }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧩 Devine le Mot</Text>
      {/* TODO: Afficher mot à faire deviner + mots interdits */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
});
