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
import { grantModeAccess } from '../../lib/auth';
import { colors, spacing, borderRadius, textStyles } from '../../theme';

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal states
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const showError = (message: string) => {
    setModalMessage(message);
    setShowErrorModal(true);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showError(t('login.fillAllFields'));
      return;
    }

    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        showError(error.message);
      } else {
        // Grant access to account-required modes
        await grantModeAccess('caliente');
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
    router.replace('/');
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
        <Text style={styles.slogan}>{t('login.slogan')}</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={t('login.email')}
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
            placeholder={t('login.password')}
            placeholderTextColor={colors.text.tertiary}
            onChangeText={setPassword}
            value={password}
            secureTextEntry
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={colors.text.primary} />
          ) : (
            <Text style={styles.buttonText}>{t('login.submit')}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/auth/signup')}
          style={styles.linkContainer}
          disabled={loading}
        >
          <Text style={styles.link}>{t('login.noAccount')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/auth/forgot-password')}
          disabled={loading}
        >
          <Text style={styles.linkSecondary}>{t('login.forgotPassword')}</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>

      {/* Error Modal */}
      <Modal
        visible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title={t('login.errorTitle')}
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
        title={t('login.successTitle')}
      >
        <View style={styles.successIconContainer}>
          <Icon name="check-circle" size={48} color={colors.semantic.success} />
        </View>
        <Text style={styles.modalText}>{t('login.connected')}</Text>
        <AnimatedButton
          label={t('common.continue')}
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
    marginBottom: spacing[10],
  },
  logo: {
    width: 280,
    height: 130,
  },
  slogan: {
    marginTop: spacing[3],
    color: '#F5F5F5',
    ...textStyles.bodyMedium,
    fontWeight: '600',
    fontStyle: 'italic',
    textAlign: 'center',
    textShadowColor: 'rgba(224, 32, 32, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  form: {
    width: '85%',
  },
  inputContainer: {
    marginBottom: spacing[4],
  },
  input: {
    height: 54,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing[5],
    color: colors.text.primary,
    fontSize: 16,
    borderWidth: 2,
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
    borderBottomWidth: 5,
    borderBottomColor: colors.primary.dark,
    // Red glow
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  linkContainer: {
    marginBottom: spacing[6],
  },
  link: {
    color: colors.primary.light,
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '600',
  },
  linkSecondary: {
    color: colors.text.secondary,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
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
