import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function EventSpecial2({ onNext }: { onNext: () => void }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎭 Spécial 2 🎭</Text>
      <Text style={styles.text}>
        Chaque joueur doit faire une imitation de célébrité. Les autres votent pour la meilleure !
      </Text>
      <TouchableOpacity onPress={onNext} style={styles.button}>
        <Text style={styles.buttonText}>C’est parti !</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#002b36',
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
    color: '#002b36',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
