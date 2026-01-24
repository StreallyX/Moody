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
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import BackButton from '../components/BackButton';
import { supabase } from '../lib/supabase';
import { colors, spacing, borderRadius, textStyles } from '../theme';

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
      const { error } = await supabase
        .from('contacts')
        .insert({
          name,
          email,
          message,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;

      Alert.alert(t('contact.successTitle'), t('contact.successMessage'));
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      console.error('Erreur Supabase:', error);
      Alert.alert(t('contact.errorTitle'), t('contact.errorSend'));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <BackButton />

        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>{t('contact.title')}</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder={t('contact.placeholderName')}
            placeholderTextColor={colors.text.tertiary}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder={t('contact.placeholderEmail')}
            placeholderTextColor={colors.text.tertiary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder={t('contact.placeholderMessage')}
            placeholderTextColor={colors.text.tertiary}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity style={styles.button} onPress={handleSend} activeOpacity={0.8}>
            <Text style={styles.buttonText}>{t('contact.send')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing[5],
    alignItems: 'center',
    paddingTop: 60,
  },
  logo: {
    width: 200,
    height: 100,
    marginBottom: spacing[4],
  },
  title: {
    ...textStyles.h2,
    color: colors.text.primary,
    marginBottom: spacing[6],
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  input: {
    width: '100%',
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    marginBottom: spacing[4],
    color: colors.text.primary,
    fontSize: 16,
    borderWidth: 2,
    borderColor: colors.ui.border,
  },
  textarea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: spacing[4],
  },
  button: {
    backgroundColor: colors.primary.main,
    paddingVertical: spacing[4],
    borderRadius: borderRadius.xl,
    marginTop: spacing[2],
    borderBottomWidth: 5,
    borderBottomColor: colors.primary.dark,
    // Red glow
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonText: {
    color: colors.text.primary,
    fontWeight: '700',
    fontSize: 18,
    textAlign: 'center',
  },
});
