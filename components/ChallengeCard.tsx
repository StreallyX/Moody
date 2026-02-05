import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeInUp,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/FontAwesome';
import { colors, spacing, borderRadius, textStyles, shadows, springs } from '../theme';
import { haptics } from '../utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function ChallengeCard({ data, onNext }: any) {
  const { t } = useTranslation();
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, springs.snappy);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springs.bouncy);
  };

  const handleNext = () => {
    haptics.lightTap();
    onNext();
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInUp.duration(400).springify()}>
        <View style={styles.levelRow}>
          <Icon name="fire" size={20} color={colors.primary.main} style={{ marginRight: spacing[2] }} />
          <Text style={styles.level}>
            {t('challenge.level', { level: data.level })}
          </Text>
        </View>

        <Text style={styles.text}>
          {data.text.replace('%PLAYER%', data.targets?.[0])}
        </Text>

        {data.targets?.length > 1 && (
          <View style={styles.targetsRow}>
            <Icon name="users" size={14} color={colors.text.secondary} />
            <Text style={styles.targets}>{data.targets.join(' & ')}</Text>
          </View>
        )}
      </Animated.View>

      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handleNext}
        style={[styles.nextBtn, buttonAnimatedStyle]}
      >
        <Text style={styles.nextTxt}>{t('next')}</Text>
        <Icon name="arrow-right" size={16} color={colors.text.primary} />
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing[6],
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  level: {
    color: colors.primary.main,
    ...textStyles.labelMedium,
    textTransform: 'uppercase',
  },
  text: {
    color: colors.text.primary,
    ...textStyles.challengeText,
    marginBottom: spacing[5],
    lineHeight: 36,
  },
  targetsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    marginBottom: spacing[5],
  },
  targets: {
    color: colors.text.secondary,
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  nextBtn: {
    alignSelf: 'center',
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.full,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[10],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    borderBottomWidth: 4,
    borderBottomColor: colors.primary.dark,
    ...shadows.md,
  },
  nextTxt: {
    color: colors.text.primary,
    fontWeight: 'bold',
    fontSize: 18,
  },
});
