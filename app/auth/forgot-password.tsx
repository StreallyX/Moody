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
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import BackButton from '../../components/BackButton';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, borderRadius, textStyles } from '../../theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert(t('forgotPassword.errorTitle'), t('forgotPassword.enterEmail'));
      return;
    }

    setLoading(true);
    try {
      const { error } = await resetPassword(email);
      if (error) {
        Alert.alert(t('forgotPassword.errorTitle'), error.message);
      } else {
        setEmailSent(true);
      }
    } catch (error: any) {
      Alert.alert(t('forgotPassword.errorTitle'), error.message);
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <View style={styles.container}>
        <BackButton />

        <View style={styles.header}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Icon name="check" size={36} color={colors.text.primary} />
          </View>
          <Text style={styles.successTitle}>{t('forgotPassword.emailSentTitle')}</Text>
          <Text style={styles.successMessage}>{t('forgotPassword.emailSentMessage')}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace('/auth/login')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{t('forgotPassword.backToLogin')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <BackButton />

      <View style={styles.header}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>{t('forgotPassword.title')}</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.description}>{t('forgotPassword.description')}</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={t('forgotPassword.emailPlaceholder')}
            placeholderTextColor={colors.text.tertiary}
            onChangeText={setEmail}
            value={email}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleResetPassword}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={colors.text.primary} />
          ) : (
            <Text style={styles.buttonText}>{t('forgotPassword.submit')}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={styles.link}>{t('forgotPassword.backToLogin')}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    paddingTop: 60,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  logo: {
    width: 280,
    height: 130,
  },
  title: {
    marginTop: spacing[4],
    color: colors.text.primary,
    ...textStyles.h2,
    textAlign: 'center',
  },
  form: {
    width: '85%',
  },
  description: {
    color: colors.text.secondary,
    ...textStyles.bodyMedium,
    textAlign: 'center',
    marginBottom: spacing[6],
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: spacing[4],
  },
  input: {
    height: 52,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing[5],
    color: colors.text.primary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  button: {
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.xl,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing[2],
    marginBottom: spacing[6],
    borderBottomWidth: 4,
    borderBottomColor: colors.primary.dark,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  link: {
    color: colors.text.secondary,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  successContainer: {
    width: '85%',
    alignItems: 'center',
  },
  successIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.semantic.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[5],
  },
  successTitle: {
    color: colors.text.primary,
    ...textStyles.h2,
    marginBottom: spacing[4],
    textAlign: 'center',
  },
  successMessage: {
    color: colors.text.secondary,
    ...textStyles.bodyMedium,
    textAlign: 'center',
    marginBottom: spacing[8],
    lineHeight: 22,
  },
});
