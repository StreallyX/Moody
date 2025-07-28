// components/EventCard.tsx
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function EventCard({ text, onNext }: { text: string; onNext: () => void }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎉 ÉVÉNEMENT 🎉</Text>
      <Text style={styles.text}>{text}</Text>
      <TouchableOpacity onPress={onNext} style={styles.button}>
        <Text style={styles.buttonText}>Continuer</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#220000',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  text: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  buttonText: {
    color: '#220000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
