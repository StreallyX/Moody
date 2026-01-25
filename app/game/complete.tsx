import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  FadeIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, borderRadius, spacing, shadows } from '../../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const GAME_STATE_KEY = '@moody_game_v2';

const MESSAGES = {
  fr: {
    title: 'Partie Terminee !',
    subtitle: 'Vous avez survecu aux 50 defis',
    playAgain: 'Rejouer',
    menu: 'Menu des modes',
    home: 'Accueil',
  },
  en: {
    title: 'Game Complete!',
    subtitle: 'You survived all 50 challenges',
    playAgain: 'Play Again',
    menu: 'Mode Menu',
    home: 'Home',
  },
};

export default function GameComplete() {
  const { i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { mode } = useLocalSearchParams<{ mode: string }>();

  const language = (i18n.language?.startsWith('fr') ? 'fr' : 'en') as 'fr' | 'en';
  const messages = MESSAGES[language];

  const titleScale = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const buttonsOpacity = useSharedValue(0);

  useEffect(() => {
    // Haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Animations
    titleScale.value = withSequence(
      withSpring(1.1, { damping: 8, stiffness: 200 }),
      withSpring(1, { damping: 10, stiffness: 150 })
    );
    subtitleOpacity.value = withDelay(300, withSpring(1, { damping: 15 }));
    buttonsOpacity.value = withDelay(600, withSpring(1, { damping: 15 }));

    // Clear game state
    const clearState = async () => {
      try {
        await AsyncStorage.removeItem(GAME_STATE_KEY);
      } catch (e) {
        console.error('Error clearing game state:', e);
      }
    };
    clearState();
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: titleScale.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const buttonsStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
  }));

  const handlePlayAgain = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace({
      pathname: '/game/[id]/play',
      params: { id: mode || 'friendly' },
    });
  };

  const handleMenu = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/menu');
  };

  const handleHome = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/');
  };

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
    >
      <View style={styles.content}>
        {/* Trophy/celebration visual */}
        <View style={styles.trophyContainer}>
          <View style={styles.trophy}>
            <Text style={styles.trophyNumber}>50</Text>
          </View>
          <View style={styles.trophyGlow} />
        </View>

        {/* Title */}
        <Animated.Text style={[styles.title, titleStyle]}>
          {messages.title}
        </Animated.Text>

        {/* Subtitle */}
        <Animated.Text style={[styles.subtitle, subtitleStyle]}>
          {messages.subtitle}
        </Animated.Text>

        {/* Progress visualization */}
        <Animated.View style={[styles.progressContainer, subtitleStyle]}>
          {[1, 2, 3, 4, 5].map((level) => (
            <View
              key={level}
              style={[
                styles.levelDot,
                { backgroundColor: getLevelColor(level) },
              ]}
            />
          ))}
        </Animated.View>
      </View>

      {/* Buttons */}
      <Animated.View style={[styles.buttonsContainer, buttonsStyle]}>
        <AnimatedPressable
          onPress={handlePlayAgain}
          style={[styles.button, styles.primaryButton]}
        >
          <Text style={styles.buttonText}>{messages.playAgain}</Text>
        </AnimatedPressable>

        <AnimatedPressable
          onPress={handleMenu}
          style={[styles.button, styles.secondaryButton]}
        >
          <Text style={styles.secondaryButtonText}>{messages.menu}</Text>
        </AnimatedPressable>

        <Pressable onPress={handleHome} style={styles.linkButton}>
          <Text style={styles.linkText}>{messages.home}</Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

function getLevelColor(level: number): string {
  const colors = ['#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#DC2626'];
  return colors[level - 1] || colors[0];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    padding: spacing[6],
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trophyContainer: {
    position: 'relative',
    marginBottom: spacing[8],
  },
  trophy: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.background.secondary,
    borderWidth: 4,
    borderColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trophyNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.primary.main,
  },
  trophyGlow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: 80,
    backgroundColor: colors.primary.main,
    opacity: 0.15,
    zIndex: -1,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing[3],
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[6],
  },
  progressContainer: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  levelDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  buttonsContainer: {
    gap: spacing[3],
  },
  button: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[8],
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    ...shadows.md,
  },
  primaryButton: {
    backgroundColor: colors.primary.main,
  },
  secondaryButton: {
    backgroundColor: colors.background.secondary,
    borderWidth: 2,
    borderColor: colors.ui.border,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: 0.5,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: spacing[3],
  },
  linkText: {
    fontSize: 16,
    color: colors.text.tertiary,
    textDecorationLine: 'underline',
  },
});
