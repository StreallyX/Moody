import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function EventCard({ text, onNext }: { text: string; onNext: () => void }) {
  const { t } = useTranslation();

  return (
    <LinearGradient
      colors={['#1e0038', '#07076e']}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}>{t('event.title')}</Text>
        <Text style={styles.text}>{text}</Text>
        <TouchableOpacity style={styles.button} onPress={() => onNext()}>
          <Text style={styles.buttonText}>{t('event.continue')}</Text>
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
    backgroundColor: '#ffffff09',
    borderRadius: 20,
    padding: 30,
    borderWidth: 2,
    borderColor: '#ffd166',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#ffd166',
    marginBottom: 20,
    textShadowColor: '#0009',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
  text: {
    fontSize: 22,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 28,
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
