import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function ChallengeCard({ data, onNext }: any) {
  return (
    <View style={styles.container}>
      <View style={styles.levelRow}>
        <Icon name="fire" size={20} color="#ffb347" style={{ marginRight: 8 }} />
        <Text style={styles.level}>Défi – Niveau {data.level}/10</Text>
      </View>

      <Text style={styles.text}>
        {data.text.replace('%PLAYER%', data.targets?.[0])}
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
    backgroundColor: '#1a0000',
  },
  card: {
    backgroundColor: '#2c0000',
    padding: 28,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
    alignItems: 'center',
    marginBottom: 32,
  },
  level: {
    color: '#ffb347',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
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
  },
  nextBtn: {
    alignSelf: 'center',
    backgroundColor: '#ffb347',
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
    color: '#1a0000',
    fontWeight: 'bold',
    fontSize: 18,
  },
  levelRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 12,
  },
});
