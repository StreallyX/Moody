import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/FontAwesome';
import { colors, spacing, borderRadius, textStyles, shadows, springs } from '../theme';
import { haptics } from '../utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface GameHeaderProps {
  round: number;
  type: string;
  onStatsPress: () => void;
}

export default function GameHeader({ round, type, onStatsPress }: GameHeaderProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const exitScale = useSharedValue(1);
  const infoScale = useSharedValue(1);

  const handleExitPressIn = () => {
    exitScale.value = withSpring(0.9, springs.snappy);
  };
  const handleExitPressOut = () => {
    exitScale.value = withSpring(1, springs.bouncy);
  };
  const handleInfoPressIn = () => {
    infoScale.value = withSpring(0.9, springs.snappy);
  };
  const handleInfoPressOut = () => {
    infoScale.value = withSpring(1, springs.bouncy);
  };

  const exitAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: exitScale.value }],
  }));
  const infoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: infoScale.value }],
  }));

  const handleExit = () => {
    haptics.warning();
    router.replace('/');
  };

  const handleStats = () => {
    haptics.lightTap();
    onStatsPress();
  };

  return (
    <View style={styles.header}>
      <AnimatedPressable
        onPressIn={handleExitPressIn}
        onPressOut={handleExitPressOut}
        onPress={handleExit}
        style={[styles.headerButton, styles.exitButton, exitAnimatedStyle]}
      >
        <Icon name="sign-out" size={18} color={colors.text.primary} />
      </AnimatedPressable>

      <View style={styles.roundContainer}>
        <Text style={styles.roundText}>{t('gameHeader.round', { round })}</Text>
      </View>

      <AnimatedPressable
        onPressIn={handleInfoPressIn}
        onPressOut={handleInfoPressOut}
        onPress={handleStats}
        style={[styles.headerButton, styles.infoButton, infoAnimatedStyle]}
      >
        <Icon name="info-circle" size={20} color={colors.text.primary} />
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 50,
    paddingHorizontal: spacing[5],
    marginBottom: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  headerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
  },
  exitButton: {
    backgroundColor: colors.semantic.error,
    borderBottomColor: '#CC2F27',
    ...shadows.md,
  },
  infoButton: {
    backgroundColor: colors.background.tertiary,
    borderBottomColor: colors.ui.border,
    ...shadows.md,
  },
  roundContainer: {
    backgroundColor: colors.secondary.main,
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.full,
    borderBottomWidth: 3,
    borderBottomColor: colors.secondary.dark,
    ...shadows.md,
  },
  roundText: {
    ...textStyles.labelLarge,
    color: colors.text.inverse,
    letterSpacing: 1,
  },
});
