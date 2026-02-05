// components/BackButton.tsx
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { colors, spacing, borderRadius } from '../theme';

export default function BackButton() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <TouchableOpacity onPress={() => router.back()} style={styles.button} activeOpacity={0.8}>
      <Icon name="arrow-left" size={14} color={colors.text.primary} />
      <Text style={styles.text}>{t('back')}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    marginLeft: spacing[5],
    marginTop: spacing[3],
    marginBottom: spacing[4],
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  text: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: '600',
  },
});
