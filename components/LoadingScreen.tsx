import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, textStyles } from '../theme';

export default function LoadingScreen() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <ActivityIndicator size="large" color={colors.primary.main} style={styles.spinner} />

      <Text style={styles.text}>{t('loading.message')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: spacing[10],
  },
  logo: {
    width: 220,
    height: 110,
    marginBottom: spacing[10],
  },
  spinner: {
    marginBottom: spacing[5],
  },
  text: {
    color: colors.text.secondary,
    ...textStyles.bodyMedium,
    fontWeight: '500',
  },
});
