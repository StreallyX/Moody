import { useEffect } from 'react';
import { StatusBar, View, Text, StyleSheet, LogBox } from 'react-native';
import { Slot, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import Icon from 'react-native-vector-icons/FontAwesome';
import { AuthProvider } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/LoadingScreen';
import { supabase } from '../lib/supabase';
import { grantModeAccess } from '../lib/auth';
import { colors, spacing, borderRadius } from '../theme';

// Suppress network errors in logs (they're handled gracefully)
LogBox.ignoreLogs([
  'Network request failed',
  'TypeError: Network request failed',
]);

function OfflineIndicator() {
  return (
    <View style={styles.offlineBanner}>
      <Icon name="wifi" size={12} color={colors.text.primary} style={{ opacity: 0.7 }} />
      <Text style={styles.offlineText}>Offline</Text>
    </View>
  );
}

function RootLayoutContent() {
  const { loading, isOffline } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Handle deep link URL on app open
    const handleDeepLink = async (event: { url: string }) => {
      const url = event.url;
      if (url && url.includes('access_token')) {
        // Extract tokens from URL fragment
        const hashParams = url.split('#')[1] || url.split('?')[1];
        if (hashParams) {
          const params = new URLSearchParams(hashParams);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            try {
              const { error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });

              if (!error) {
                // Grant access to account-required modes
                await grantModeAccess('caliente');
                // Navigate to callback page to show success
                router.replace('/auth/callback');
              }
            } catch (e) {
              console.error('Error setting session:', e);
            }
          }
        }
      }
    };

    // Listen for incoming links
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened with a URL
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [router]);

  if (loading) return <LoadingScreen />;
  return (
    <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.background.primary}
        translucent={false}
      />
      {isOffline && <OfflineIndicator />}
      <Slot />
    </View>
  );
}

const styles = StyleSheet.create({
  offlineBanner: {
    position: 'absolute',
    top: 50,
    right: spacing[3],
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    zIndex: 1000,
    opacity: 0.9,
  },
  offlineText: {
    color: colors.text.secondary,
    fontSize: 11,
    fontWeight: '500',
  },
});

export default function Layout() {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}
