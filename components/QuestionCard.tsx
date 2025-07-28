import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function QuestionCard({ data, onNext }: any) {
  return (
    <View style={styles.container}>
      <View style={styles.levelRow}>
        <Icon name="question-circle" size={20} color="#8ecae6" style={{ marginRight: 8 }} />
        <Text style={styles.level}>Question – Niveau {data.level}/10</Text>
      </View>

      <Text style={styles.text}>
        {data.text.replace('%PLAYER%', String(data.targets?.[0] ?? ''))}
      </Text>

      {data.targets?.length > 1 && (
        <Text style={styles.targets}>👥 {data.targets.join(' & ')}</Text>
      )}

      <TouchableOpacity style={styles.nextBtn} onPress={() => onNext()}>
        <Text style={styles.nextTxt}>Suivant ➡</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#001f2f', // fond froid pour différencier
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  level: {
    color: '#8ecae6',
    fontSize: 18,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  text: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 32,
  },
  targets: {
    color: '#ccc',
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 20,
  },
  nextBtn: {
    alignSelf: 'center',
    backgroundColor: '#8ecae6',
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  nextTxt: {
    color: '#001f2f',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
