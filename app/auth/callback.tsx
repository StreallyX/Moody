import { useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as Linking from 'expo-linking';
import { supabase } from '../../lib/supabase';
import { grantModeAccess } from '../../lib/auth';
import { colors, spacing, textStyles } from '../../theme';

export default function AuthCallback() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the URL that opened the app
        const url = await Linking.getInitialURL();

        if (url) {
          // Parse the URL to extract tokens
          const parsedUrl = Linking.parse(url);

          // Check for access_token and refresh_token in hash fragment
          // Supabase puts tokens in the hash fragment: #access_token=...&refresh_token=...
          if (parsedUrl.queryParams) {
            const accessToken = parsedUrl.queryParams.access_token as string;
            const refreshToken = parsedUrl.queryParams.refresh_token as string;

            if (accessToken && refreshToken) {
              // Set the session with the tokens
              const { data, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });

              if (error) {
                throw error;
              }

              if (data.session) {
                // Grant access to account-required modes
                await grantModeAccess('caliente');

                setStatus('success');
                setMessage(t('auth.emailConfirmed'));

                // Redirect to home after a short delay
                setTimeout(() => {
                  router.replace('/');
                }, 2000);
                return;
              }
            }
          }
        }

        // Check for error in params
        if (params.error) {
          throw new Error(params.error_description as string || 'Authentication failed');
        }

        // If no tokens found, check if already authenticated
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setStatus('success');
          setMessage(t('auth.alreadyConfirmed'));
          setTimeout(() => {
            router.replace('/');
          }, 2000);
        } else {
          throw new Error('No authentication data found');
        }

      } catch (error: any) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage(error.message || t('auth.confirmationError'));

        // Redirect to login after showing error
        setTimeout(() => {
          router.replace('/auth/login');
        }, 3000);
      }
    };

    handleCallback();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {status === 'loading' && (
          <>
            <ActivityIndicator size="large" color={colors.primary.main} />
            <Text style={styles.text}>{t('auth.verifying')}</Text>
          </>
        )}

        {status === 'success' && (
          <>
            <View style={styles.iconContainer}>
              <Icon name="check" size={48} color={colors.semantic.success} />
            </View>
            <Text style={styles.title}>{t('auth.success')}</Text>
            <Text style={styles.text}>{message}</Text>
          </>
        )}

        {status === 'error' && (
          <>
            <View style={styles.iconContainer}>
              <Icon name="times" size={48} color={colors.semantic.error} />
            </View>
            <Text style={styles.title}>{t('auth.error')}</Text>
            <Text style={styles.text}>{message}</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[5],
  },
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: 20,
    padding: spacing[8],
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  iconContainer: {
    marginBottom: spacing[4],
  },
  title: {
    ...textStyles.h2,
    color: colors.text.primary,
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  text: {
    color: colors.text.secondary,
    fontSize: 15,
    textAlign: 'center',
    marginTop: spacing[3],
  },
});
