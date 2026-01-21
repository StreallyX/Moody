/**
 * Modal - Themed modal component
 * Features:
 * - Dark overlay with blur effect
 * - Spring slide-up animation
 * - Close button
 */

import React, { useEffect } from 'react';
import { StyleSheet, Text, Pressable, Modal as RNModal, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors, borderRadius, spacing, textStyles, springs, layout, shadows } from '../../theme';
import { haptics } from '../../utils/haptics';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  style?: ViewStyle;
}

export default function Modal({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  closeOnBackdrop = true,
  style,
}: ModalProps) {
  const scale = useSharedValue(0.9);
  const translateY = useSharedValue(50);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1, springs.bouncy);
      translateY.value = withSpring(0, springs.bouncy);
    } else {
      opacity.value = withTiming(0, { duration: 150 });
      scale.value = withTiming(0.9, { duration: 150 });
      translateY.value = withTiming(50, { duration: 150 });
    }
  }, [visible]);

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  const handleBackdropPress = () => {
    if (closeOnBackdrop) {
      haptics.lightTap();
      onClose();
    }
  };

  const handleClosePress = () => {
    haptics.lightTap();
    onClose();
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View style={[styles.backdrop, backdropAnimatedStyle]}>
        <Pressable style={styles.backdropPress} onPress={handleBackdropPress}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <Animated.View style={[styles.content, contentAnimatedStyle, style]}>
              {showCloseButton && (
                <Pressable style={styles.closeButton} onPress={handleClosePress}>
                  <View style={styles.closeButtonInner}>
                    <Text style={styles.closeButtonText}>✕</Text>
                  </View>
                </Pressable>
              )}

              {title && <Text style={styles.title}>{title}</Text>}

              <View style={styles.body}>
                {children}
              </View>
            </Animated.View>
          </Pressable>
        </Pressable>
      </Animated.View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.background.overlay,
  },
  backdropPress: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[5],
  },
  content: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius['2xl'],
    padding: layout.modal.padding,
    width: '100%',
    maxWidth: layout.modal.maxWidth,
    position: 'relative',
    ...shadows.xl,
  },
  closeButton: {
    position: 'absolute',
    top: spacing[2],
    right: spacing[2],
    zIndex: 10,
    padding: spacing[1],
  },
  closeButtonInner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  closeButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing[3],
    marginTop: spacing[1],
  },
  body: {
    marginTop: spacing[1],
  },
});
