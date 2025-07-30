import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function EventCard({ text, onNext }: { text: string; onNext: () => void }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎉 ÉVÉNEMENT 🎉</Text>
      <Text style={styles.text}>{text}</Text>
      <TouchableOpacity style={styles.button} onPress={() => onNext()}>
        <Text style={styles.buttonText}>Continuer</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07076e',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#ffd166',
    marginBottom: 20,
    textShadowColor: '#0006',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  text: {
    fontSize: 22,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#ffd166',
    paddingHorizontal: 26,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  buttonText: {
    color: '#1a0022',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
