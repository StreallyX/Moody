import { StyleSheet, Text, View } from 'react-native';

export default function TapBattleCard({ players, onNext }: {
  players: string[];
  onNext: () => void;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🕹️ Tap Battle</Text>
      {/* TODO: 2 boutons de tap, afficher le duel */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
});
