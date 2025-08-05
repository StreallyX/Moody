import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { isUserLoggedIn, logout } from '../../lib/auth';

export default function ProfileScreen() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      const loggedIn = await isUserLoggedIn();
      if (!loggedIn) {
        router.replace('/auth/login');
        return;
      }

      const email = await AsyncStorage.getItem('userEmail');
      setUserEmail(email);
    };

    checkAuthAndLoad();
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace('/auth/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenue 👋</Text>
      {userEmail && <Text style={styles.text}>Email : {userEmail}</Text>}
      <Button title="Se déconnecter" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  text: { fontSize: 16, marginBottom: 20 },
});
