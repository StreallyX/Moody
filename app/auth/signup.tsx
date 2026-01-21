import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import BackButton from '../../components/BackButton';
import { Modal, AnimatedButton } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, borderRadius, textStyles } from '../../theme';

export default function SignupScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal states
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const showError = (message: string) => {
    setModalMessage(message);
    setShowErrorModal(true);
  };

  const handleSignup = async () => {
    if (!email || !password) {
      showError(t('signup.fillAllFields'));
      return;
    }

    if (password !== confirmPassword) {
      showError(t('signup.passwordMismatch'));
      return;
    }

    if (password.length < 6) {
      showError(t('signup.passwordTooShort'));
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUp(email, password);
      if (error) {
        showError(error.message);
      } else {
        setShowSuccessModal(true);
      }
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    router.replace('/auth/login');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <BackButton />

        <View style={styles.header}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.slogan}>{t('signup.slogan')}</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={t('signup.emailPlaceholder')}
              placeholderTextColor={colors.text.tertiary}
              onChangeText={setEmail}
              value={email}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={t('signup.passwordPlaceholder')}
              placeholderTextColor={colors.text.tertiary}
              onChangeText={setPassword}
              value={password}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={t('signup.confirmPasswordPlaceholder')}
              placeholderTextColor={colors.text.tertiary}
              onChangeText={setConfirmPassword}
              value={confirmPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.text.primary} />
            ) : (
              <Text style={styles.buttonText}>{t('signup.signup')}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/auth/login')}
            disabled={loading}
          >
            <Text style={styles.link}>{t('signup.alreadyHaveAccount')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Error Modal */}
      <Modal
        visible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title={t('signup.errorTitle')}
      >
        <Text style={styles.modalText}>{modalMessage}</Text>
        <AnimatedButton
          label={t('common.ok')}
          onPress={() => setShowErrorModal(false)}
          size="md"
          style={{ marginTop: spacing[4] }}
        />
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        onClose={handleSuccessClose}
        title={t('signup.successTitle')}
      >
        <View style={styles.successIconContainer}>
          <Icon name="envelope" size={48} color={colors.primary.main} />
        </View>
        <Text style={styles.modalText}>{t('signup.checkEmailMessage')}</Text>
        <AnimatedButton
          label={t('common.ok')}
          onPress={handleSuccessClose}
          size="md"
          style={{ marginTop: spacing[4] }}
        />
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 60,
    alignItems: 'center',
    paddingBottom: spacing[10],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  logo: {
    width: 280,
    height: 130,
  },
  slogan: {
    marginTop: spacing[3],
    color: colors.text.secondary,
    ...textStyles.bodyMedium,
    fontWeight: '500',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  form: {
    width: '85%',
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
    color: colors.primary.light,
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '600',
  },
  modalText: {
    color: colors.text.secondary,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: spacing[3],
  },
});
