import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius, shadows, springs } from '../theme';
import { haptics } from '../utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface FooterBarProps {
  onSelectPress: () => void;
  onReportPress: () => void;
}

export default function FooterBar({ onSelectPress, onReportPress }: FooterBarProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const selectScale = useSharedValue(1);
  const reportScale = useSharedValue(1);

  const handleSelectPressIn = () => {
    selectScale.value = withSpring(0.95, springs.snappy);
  };
  const handleSelectPressOut = () => {
    selectScale.value = withSpring(1, springs.bouncy);
  };
  const handleReportPressIn = () => {
    reportScale.value = withSpring(0.95, springs.snappy);
  };
  const handleReportPressOut = () => {
    reportScale.value = withSpring(1, springs.bouncy);
  };

  const selectAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: selectScale.value }],
  }));
  const reportAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: reportScale.value }],
  }));

  const handleSelect = () => {
    haptics.lightTap();
    onSelectPress();
  };

  const handleReport = () => {
    haptics.lightTap();
    onReportPress();
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + spacing[2] }]}>
      <AnimatedPressable
        onPressIn={handleSelectPressIn}
        onPressOut={handleSelectPressOut}
        onPress={handleSelect}
        style={[styles.button, styles.select, selectAnimatedStyle]}
      >
        <Text style={styles.selectText}>🧪 {t('footer.select')}</Text>
      </AnimatedPressable>

      <AnimatedPressable
        onPressIn={handleReportPressIn}
        onPressOut={handleReportPressOut}
        onPress={handleReport}
        style={[styles.button, styles.report, reportAnimatedStyle]}
      >
        <Text style={styles.reportText}>🚨 {t('footer.report')}</Text>
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing[3],
    paddingHorizontal: spacing[4],
    gap: spacing[3],
  },
  button: {
    flex: 1,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[5],
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    borderBottomWidth: 3,
    ...shadows.sm,
  },
  select: {
    backgroundColor: colors.modes.soft.primary,
    borderBottomColor: '#5A3DB8',
  },
  report: {
    backgroundColor: colors.semantic.error,
    borderBottomColor: '#CC2F27',
  },
  selectText: {
    color: colors.text.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  reportText: {
    color: colors.text.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
