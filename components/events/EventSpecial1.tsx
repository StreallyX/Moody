import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function EventSpecial1({ onNext }: { onNext: () => void }) {
  return (
    <LinearGradient
      colors={['#1e0038', '#07076e']}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}>🎊 SPÉCIAL 🎊</Text>
        <Text style={styles.text}>
          Tous les joueurs doivent se fixer dans les yeux. Le premier qui rigole boit !
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => onNext()}>
          <Text style={styles.buttonText}>OK !</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#ffffff0c',
    borderRadius: 20,
    padding: 30,
    borderWidth: 2,
    borderColor: '#ffd166',
    alignItems: 'center',
    marginHorizontal: 20,
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
