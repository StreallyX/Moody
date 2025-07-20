import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function RouletteCard({ data, onNext }: any) {
  const totalSlots = data.slots ?? 8;
  const randomSlot = Math.floor(Math.random() * totalSlots) + 1;

  return (
    <View style={styles.container}>
      <Text style={styles.level}>🎰 Roulette - Niveau {data.level}/10</Text>

      <Text style={styles.text}>
        {data.text}
      </Text>

      <Text style={styles.result}>
        Résultat du tirage : 🎯 Case {randomSlot} / {totalSlots}
      </Text>

      <TouchableOpacity style={styles.nextBtn} onPress={onNext}>
        <Text style={styles.nextTxt}>Tour suivant ➡</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  level: { color: '#f72585', fontSize: 16, textAlign: 'center', marginBottom: 10 },
  text: { color: '#fff', fontSize: 24, textAlign: 'center', marginBottom: 20 },
  result: { color: '#f72585', fontSize: 22, textAlign: 'center', marginBottom: 30 },
  nextBtn: { alignSelf: 'center', backgroundColor: '#f72585', borderRadius: 20, padding: 12, paddingHorizontal: 32 },
  nextTxt: { color: '#000', fontWeight: 'bold', fontSize: 18 },
});
