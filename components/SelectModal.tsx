import { useTranslation } from 'react-i18next';
import { FlatList, Modal as RNModal, StyleSheet, Text, View, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius, textStyles, shadows, springs } from '../theme';
import { haptics } from '../utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface SelectModalProps {
  visible: boolean;
  onClose: () => void;
  items: any[];
  onSelect: (item: any) => void;
}

export default function SelectModal({ visible, onClose, items, onSelect }: SelectModalProps) {
  const { t } = useTranslation();
  const closeScale = useSharedValue(1);

  const handleClosePressIn = () => {
    closeScale.value = withSpring(0.95, springs.snappy);
  };

  const handleClosePressOut = () => {
    closeScale.value = withSpring(1, springs.bouncy);
  };

  const handleClose = () => {
    haptics.lightTap();
    onClose();
  };

  const handleSelect = (item: any) => {
    haptics.lightTap();
    onSelect(item);
  };

  const closeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: closeScale.value }],
  }));

  const renderItem = ({ item }: { item: any }) => (
    <Pressable
      style={({ pressed }) => [
        styles.item,
        pressed && styles.itemPressed,
      ]}
      onPress={() => handleSelect(item)}
    >
      <View style={styles.itemContent}>
        <Text style={styles.itemType}>{item.type}</Text>
        <Text style={styles.itemId}>{item.id}</Text>
      </View>
    </Pressable>
  );

  return (
    <RNModal visible={visible} transparent animationType="slide">
      <Animated.View entering={FadeIn.duration(200)} style={styles.overlay}>
        <View style={styles.content}>
          {/* Close X button */}
          <Pressable style={styles.closeX} onPress={handleClose}>
            <View style={styles.closeXCircle}>
              <Text style={styles.closeXText}>✕</Text>
            </View>
          </Pressable>

          <Text style={styles.title}>{t('select.title')}</Text>

          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />

          <AnimatedPressable
            onPressIn={handleClosePressIn}
            onPressOut={handleClosePressOut}
            onPress={handleClose}
            style={[styles.closeButton, closeAnimatedStyle]}
          >
            <Text style={styles.closeButtonText}>{t('select.close')}</Text>
          </AnimatedPressable>
        </View>
      </Animated.View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.background.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[5],
  },
  content: {
    backgroundColor: colors.background.secondary,
    padding: spacing[5],
    borderRadius: borderRadius['2xl'],
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
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
  title: {
    ...textStyles.h2,
    color: colors.secondary.main,
    marginBottom: spacing[4],
    marginTop: spacing[2],
    textAlign: 'center',
  },
  list: {
    maxHeight: 400,
  },
  listContent: {
    paddingBottom: spacing[3],
  },
  item: {
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.lg,
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.ui.border,
    overflow: 'hidden',
  },
  itemPressed: {
    backgroundColor: colors.background.primary,
    borderColor: colors.primary.main,
  },
  itemContent: {
    padding: spacing[4],
  },
  itemType: {
    ...textStyles.labelSmall,
    color: colors.primary.main,
    textTransform: 'uppercase',
    marginBottom: spacing[1],
  },
  itemId: {
    ...textStyles.bodyMedium,
    color: colors.text.primary,
  },
  closeButton: {
    marginTop: spacing[4],
    backgroundColor: colors.primary.main,
    padding: spacing[4],
    borderRadius: borderRadius.xl,
    alignItems: 'center',
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
