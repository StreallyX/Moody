import { Text, View } from 'react-native';

export default function LockScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Abonnement expiré ou non actif</Text>
    </View>
  );
}
