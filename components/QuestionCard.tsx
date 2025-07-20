import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function QuestionCard({ data, onNext }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.level}>🧠 Question - Niveau {data.level}/10</Text>

      <Text style={styles.text}>
        {data.text.replace('%PLAYER%', data.targets?.[0])}
      </Text>

      {data.targets?.length > 1 && (
        <Text style={styles.targets}>👥 {data.targets.join(' & ')}</Text>
      )}

      <TouchableOpacity style={styles.nextBtn} onPress={onNext}>
        <Text style={styles.nextTxt}>Suivant ➡</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  level: { color: '#8ecae6', fontSize: 16, textAlign: 'center', marginBottom: 10 },
  text: { color: '#fff', fontSize: 24, textAlign: 'center', marginBottom: 20 },
  targets: { color: '#ccc', fontSize: 18, textAlign: 'center', marginBottom: 20 },
  nextBtn: { alignSelf: 'center', backgroundColor: '#8ecae6', borderRadius: 20, padding: 12, paddingHorizontal: 32 },
  nextTxt: { color: '#000', fontWeight: 'bold', fontSize: 18 },
});
