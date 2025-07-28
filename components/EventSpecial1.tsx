// components/EventSpecial1.tsx
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function EventSpecial1({ onNext }: { onNext: () => void }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>💥 Spécial 1 💥</Text>
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
    backgroundColor: '#1e0033',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  title: {
    fontSize: 28,
    color: '#fff',
    marginBottom: 16,
  },
  text: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#1e0033',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
