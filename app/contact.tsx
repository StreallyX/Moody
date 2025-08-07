import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BackButton from '../components/BackButton';
import { db } from '../lib/firebase';

export default function ContactScreen() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = async () => {
    if (!name || !email || !message) {
      Alert.alert(t('contact.errorTitle'), t('contact.errorFields'));
      return;
    }

    try {
      await addDoc(collection(db, 'contacts'), {
        name,
        email,
        message,
        createdAt: serverTimestamp(),
      });

      Alert.alert(t('contact.successTitle'), t('contact.successMessage'));
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      console.error('Erreur Firestore:', error);
      Alert.alert(t('contact.errorTitle'), t('contact.errorSend'));
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <BackButton />
      <Text style={styles.title}>{t('contact.title')}</Text>

      <TextInput
        style={styles.input}
        placeholder={t('contact.placeholderName')}
        placeholderTextColor="#aaa"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder={t('contact.placeholderEmail')}
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={[styles.input, styles.textarea]}
        placeholder={t('contact.placeholderMessage')}
        placeholderTextColor="#aaa"
        value={message}
        onChangeText={setMessage}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity style={styles.button} onPress={handleSend}>
        <Text style={styles.buttonText}>{t('contact.send')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0000',
    padding: 20,
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 10,
    marginTop: 10,
  },
  title: {
    fontSize: 22,
    color: '#ffb347',
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    color: '#000',
  },
  textarea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#ffb347',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 999,
    marginTop: 10,
  },
  buttonText: {
    color: '#1a0000',
    fontWeight: '600',
    fontSize: 16,
  },
});
