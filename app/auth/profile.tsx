import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import BackButton from '../../components/BackButton';
import { useAuth } from '../../context/AuthContext';
import { revokeAllAccess } from '../../lib/auth';
import { colors, spacing, borderRadius, textStyles } from '../../theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user) {
      router.replace('/auth/login');
    }
  }, [user, loading]);

  const handleLogout = async () => {
    await signOut();
    await revokeAllAccess();
    router.replace('/auth/login');
  };

  // Show loading while checking auth
  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  // Don't render if not logged in (will redirect)
  if (!user) {
    return null;
  }

  const userEmail = user.email || '';

  return (
    <View style={styles.container}>
      <BackButton />

      <View style={styles.header}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.slogan}>{t('profile.slogan')}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {userEmail ? userEmail.charAt(0).toUpperCase() : '?'}
          </Text>
        </View>

        <Text style={styles.title}>{t('profile.welcome')}</Text>
        {userEmail && (
          <Text style={styles.email}>{userEmail}</Text>
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>{t('profile.logout')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    paddingTop: 60,
    alignItems: 'center',
  },
  centered: {
    justifyContent: 'center',
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
  content: {
    width: '85%',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[5],
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.text.primary,
  },
  title: {
    ...textStyles.h2,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  email: {
    ...textStyles.bodyMedium,
    color: colors.text.secondary,
    marginBottom: spacing[8],
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.xl,
    height: 56,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 4,
    borderBottomColor: colors.primary.dark,
  },
  buttonText: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '700',
  },
});
