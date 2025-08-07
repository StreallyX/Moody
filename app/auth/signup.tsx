import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import BackButton from '../../components/BackButton';
import { registerUser } from '../../lib/auth';

export default function SignupScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async () => {
    try {
      await registerUser(email, password);
      Alert.alert(t('signup.successTitle'), t('signup.successMessage'));
      router.replace('/');
    } catch (error: any) {
      Alert.alert(t('signup.errorTitle'), error.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo + slogan */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.slogan}>{t('signup.slogan')}</Text>
      </View>

      <BackButton />

      {/* Formulaire */}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder={t('signup.emailPlaceholder')}
          placeholderTextColor="#aaa"
          onChangeText={setEmail}
          value={email}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder={t('signup.passwordPlaceholder')}
          placeholderTextColor="#aaa"
          onChangeText={setPassword}
          value={password}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleSignup}>
          <Text style={styles.buttonText}>{t('signup.signup')}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/auth/login')}>
          <Text style={styles.link}>{t('signup.alreadyHaveAccount')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0000',
    paddingTop: 60,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 300,
    height: 140,
  },
  slogan: {
    marginTop: 10,
    color: '#ffb347',
    fontSize: 14,
    fontWeight: '600',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  form: {
    width: '80%',
  },
  input: {
    height: 42,
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingHorizontal: 16,
    color: '#000',
    marginBottom: 16,
    fontSize: 14,
  },
  button: {
    backgroundColor: '#ffb347',
    borderRadius: 999,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 3,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    color: '#ffb347',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
});
