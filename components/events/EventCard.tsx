import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeInUp,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius, textStyles, shadows, springs } from '../../theme';
import { haptics } from '../../utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function EventCard({ text, onNext }: { text: string; onNext: () => void }) {
  const { t } = useTranslation();
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, springs.snappy);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springs.bouncy);
  };

  const handleNext = () => {
    haptics.success();
    onNext();
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <LinearGradient
      colors={['#1A0A29', '#0A1929']}
      style={styles.container}
    >
      <Animated.View
        entering={FadeInUp.duration(400).springify()}
        style={styles.card}
      >
        <Text style={styles.title}>{t('event.title')}</Text>
        <Text style={styles.text}>{text}</Text>
        <AnimatedPressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handleNext}
          style={[styles.button, buttonAnimatedStyle]}
        >
          <Text style={styles.buttonText}>{t('event.continue')}</Text>
        </AnimatedPressable>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: borderRadius['2xl'],
    padding: spacing[7],
    borderWidth: 2,
    borderColor: colors.secondary.main,
    alignItems: 'center',
    marginHorizontal: spacing[5],
    ...shadows.lg,
  },
  title: {
    ...textStyles.displaySmall,
    color: colors.secondary.main,
    marginBottom: spacing[5],
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
  text: {
    ...textStyles.h2,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing[6],
    paddingHorizontal: spacing[3],
  },
  button: {
    backgroundColor: colors.secondary.main,
    paddingHorizontal: spacing[7],
    paddingVertical: spacing[4],
    borderRadius: borderRadius.full,
    borderBottomWidth: 4,
    borderBottomColor: colors.secondary.dark,
    ...shadows.md,
  },
  buttonText: {
    color: colors.text.inverse,
    fontWeight: 'bold',
    fontSize: 18,
  },
});
