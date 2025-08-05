// components/BackButton.tsx
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

export default function BackButton() {
  const router = useRouter();

  return (
    <TouchableOpacity onPress={() => router.replace('/')} style={styles.button}>
      <Text style={styles.text}>⬅ Retour</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: '#2c0000',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  text: {
    color: '#ffb347',
    fontSize: 16,
    fontWeight: '600',
  },
});
