import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function EventSpecial1({ onNext }: { onNext: () => void }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎊 SPÉCIAL 🎊</Text>
      <Text style={styles.text}>Tous les joueurs doivent danser pendant 10 secondes !</Text>
      <TouchableOpacity style={styles.button} onPress={() => onNext()}>
        <Text style={styles.buttonText}>OK !</Text>
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
    fontWeight: '900',
    color: '#ffd166',
    marginBottom: 20,
    textShadowColor: '#0008',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
  text: {
    fontSize: 22,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#ffd166',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  buttonText: {
    color: '#1e0033',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
