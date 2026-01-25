import { useTranslation } from 'react-i18next';
import {
  Modal as RNModal,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius, textStyles, shadows, springs } from '../theme';
import { haptics } from '../utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type HistoryEntry = { id: string; type: string; targets?: string[] };

interface StatsModalProps {
  visible: boolean;
  onClose: () => void;
  heat: number;
  rounds: number;
  stats: Record<string, number>;
  history: HistoryEntry[];
}

export default function StatsModal({
  visible,
  onClose,
  heat,
  rounds,
  stats,
  history,
}: StatsModalProps) {
  const { t } = useTranslation();
  const scale = useSharedValue(1);

  const typeBreakdown: Record<string, number> = {};
  history.forEach((item) => {
    typeBreakdown[item.type] = (typeBreakdown[item.type] || 0) + 1;
  });

  const playerStats = { ...stats };
  delete playerStats.history;

  const last5 = history.slice(-5).reverse();

  const handlePressIn = () => {
    scale.value = withSpring(0.95, springs.snappy);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springs.bouncy);
  };

  const handleClose = () => {
    haptics.lightTap();
    onClose();
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <RNModal visible={visible} transparent animationType="fade">
      <Animated.View entering={FadeIn.duration(200)} style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          {/* Close X button */}
          <Pressable style={styles.closeX} onPress={handleClose}>
            <View style={styles.closeXCircle}>
              <Text style={styles.closeXText}>✕</Text>
            </View>
          </Pressable>

          <ScrollView style={{ maxHeight: 500 }} contentContainerStyle={{ paddingBottom: spacing[5] }}>
            <Text style={styles.modalTitle}>{t('stats.title')}</Text>

            {/* Heat & Rounds */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>{t('stats.heat')}</Text>
                <Text style={styles.statValue}>{heat}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>{t('stats.rounds')}</Text>
                <Text style={styles.statValue}>{rounds}</Text>
              </View>
            </View>

            {/* Type Breakdown */}
            <Text style={styles.sectionTitle}>{t('stats.typeBreakdown')}</Text>
            {Object.entries(typeBreakdown).map(([type, count]) => (
              <View key={type} style={styles.listRow}>
                <Text style={styles.listLabel}>{type}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{count}</Text>
                </View>
              </View>
            ))}

            {/* Per Player */}
            <Text style={styles.sectionTitle}>{t('stats.perPlayer')}</Text>
            {Object.entries(playerStats).map(([name, count]) => (
              <View key={name} style={styles.listRow}>
                <Text style={styles.listLabel}>{name}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{count}</Text>
                </View>
              </View>
            ))}

            {/* Last 5 Rounds */}
            <Text style={styles.sectionTitle}>{t('stats.lastRounds')}</Text>
            {last5.map((item, index) => (
              <View key={index} style={styles.listRow}>
                <Text style={styles.listLabel} numberOfLines={1}>
                  {item.type} – {item.id}
                </Text>
                <Text style={styles.listSubtext}>
                  {item.targets?.join(', ') || '—'}
                </Text>
              </View>
            ))}
          </ScrollView>

          <AnimatedPressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handleClose}
            style={[styles.closeButton, buttonAnimatedStyle]}
          >
            <Text style={styles.closeButtonText}>{t('stats.close')}</Text>
          </AnimatedPressable>
        </View>
      </Animated.View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.background.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[5],
  },
  modalBox: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius['2xl'],
    padding: spacing[6],
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    position: 'relative',
    ...shadows.xl,
  },
  closeX: {
    position: 'absolute',
    top: spacing[2],
    right: spacing[2],
    zIndex: 10,
    padding: spacing[1],
  },
  closeXCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  closeXText: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalTitle: {
    ...textStyles.h1,
    color: colors.secondary.main,
    marginBottom: spacing[5],
    marginTop: spacing[2],
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[5],
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  statLabel: {
    ...textStyles.caption,
    color: colors.text.secondary,
    marginBottom: spacing[1],
    textTransform: 'uppercase',
  },
  statValue: {
    ...textStyles.displayMedium,
    color: colors.secondary.main,
  },
  sectionTitle: {
    ...textStyles.labelMedium,
    color: colors.text.accent,
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: colors.ui.border,
    borderBottomWidth: 1,
    paddingVertical: spacing[3],
  },
  listLabel: {
    ...textStyles.bodyMedium,
    color: colors.text.primary,
    flex: 1,
  },
  listSubtext: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
  },
  badge: {
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    minWidth: 32,
    alignItems: 'center',
  },
  badgeText: {
    color: colors.text.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  closeButton: {
    marginTop: spacing[5],
    alignSelf: 'center',
    backgroundColor: colors.primary.main,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[8],
    borderRadius: borderRadius.full,
    borderBottomWidth: 4,
    borderBottomColor: colors.primary.dark,
    ...shadows.md,
  },
  closeButtonText: {
    color: colors.text.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
