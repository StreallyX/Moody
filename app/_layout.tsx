import { useEffect } from 'react';
import { StatusBar, View } from 'react-native';
import { Slot, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { AuthProvider } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/LoadingScreen';
import { supabase } from '../lib/supabase';
import { grantModeAccess } from '../lib/auth';
import { colors } from '../theme';

function RootLayoutContent() {
  const { loading } = useAuth();
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
      <Slot />
    </View>
  );
}

export default function Layout() {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}
