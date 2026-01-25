import { useTranslation } from 'react-i18next';
import { Modal as RNModal, StyleSheet, Text, View, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/FontAwesome';
import i18n from '../lib/i18n';
import { colors, spacing, borderRadius, textStyles, shadows, springs } from '../theme';
import { haptics } from '../utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function LanguageModal({ visible, onClose }: Props) {
  const { t } = useTranslation();

  const changeLang = async (lang: string) => {
    haptics.success();
    await i18n.changeLanguage(lang);
    onClose();
  };

  const handleClose = () => {
    haptics.lightTap();
    onClose();
  };

  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Animated.View entering={FadeIn.duration(200)} style={styles.backdrop}>
        <View style={styles.modal}>
          <Pressable style={styles.close} onPress={handleClose}>
            <View style={styles.closeCircle}>
              <Icon name="times" size={18} color={colors.text.primary} />
            </View>
          </Pressable>

          <Text style={styles.title}>{t('home.selectLanguage')}</Text>

          <View style={styles.optionsContainer}>
            <LanguageOption
              code="FR"
              color="#0055A4"
              label="Français"
              onPress={() => changeLang('fr')}
            />
            <LanguageOption
              code="EN"
              color="#C8102E"
              label="English"
              onPress={() => changeLang('en')}
            />
          </View>
        </View>
      </Animated.View>
    </RNModal>
  );
}

function LanguageOption({
  code,
  color,
  label,
  onPress,
}: {
  code: string;
  color: string;
  label: string;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, springs.snappy);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springs.bouncy);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={[styles.langOption, animatedStyle]}
    >
      <View style={[styles.langBadge, { backgroundColor: color }]}>
        <Text style={styles.langCode}>{code}</Text>
      </View>
      <Text style={styles.langText}>{label}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.background.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[5],
  },
  modal: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius['2xl'],
    padding: spacing[6],
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.ui.border,
    ...shadows.xl,
  },
  close: {
    position: 'absolute',
    top: spacing[2],
    right: spacing[2],
    padding: spacing[1],
    zIndex: 10,
  },
  closeCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    // Red glow
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    ...textStyles.h2,
    color: colors.text.primary,
    marginBottom: spacing[6],
    marginTop: spacing[2],
    // Red glow
    textShadowColor: 'rgba(224, 32, 32, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  optionsContainer: {
    width: '100%',
    gap: spacing[3],
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    gap: spacing[3],
    borderWidth: 2,
    borderColor: colors.ui.border,
    borderBottomWidth: 4,
    borderBottomColor: colors.ui.divider,
  },
  langBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  langCode: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  langText: {
    ...textStyles.h3,
    color: colors.text.primary,
  },
});
