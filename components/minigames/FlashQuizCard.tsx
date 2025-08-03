import { StyleSheet, Text, View } from 'react-native';

export default function FlashQuizCard({ data, onNext }: { data: any; onNext: () => void }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎯 Vrai ou Faux</Text>
      {/* TODO: Afficher la phrase + boutons ou swipe */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
});
