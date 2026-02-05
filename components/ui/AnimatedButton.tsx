/**
 * AnimatedButton - Duolingo-style chunky button with 3D effect
 * Features:
 * - Thick bottom border for 3D depth
 * - Press animation: scale down + translateY + shadow reduction
 * - Spring bounce on release
 * - Haptic feedback
 */

import React from 'react';
import { StyleSheet, Text, ViewStyle, TextStyle, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors, button3D, springs, componentSizes } from '../../theme';
import { haptics } from '../../utils/haptics';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface AnimatedButtonProps {
  onPress: () => void;
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function AnimatedButton({
  onPress,
  label,
  variant = 'primary',
  size = 'lg',
  disabled = false,
  icon,
  iconPosition = 'right',
  fullWidth = false,
  style,
  textStyle,
}: AnimatedButtonProps) {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  const handlePressIn = () => {
    scale.value = withSpring(0.97, springs.stiff);
    translateY.value = withSpring(2, springs.stiff);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springs.bouncy);
    translateY.value = withSpring(0, springs.bouncy);
  };

  const handlePress = () => {
    if (disabled) return;
    haptics.lightTap();
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  const buttonStyles = getButtonStyles(variant, size, disabled);
  const sizeStyles = componentSizes.button[size];

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
      style={[
        styles.button,
        buttonStyles.container,
        {
          height: sizeStyles.height,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          borderRadius: sizeStyles.borderRadius,
        },
        fullWidth && styles.fullWidth,
        animatedStyle,
        style,
      ]}
    >
      {icon && iconPosition === 'left' && icon}
      <Text
        style={[
          styles.text,
          buttonStyles.text,
          getSizeTextStyle(size),
          textStyle,
        ]}
      >
        {label}
      </Text>
      {icon && iconPosition === 'right' && icon}
    </AnimatedPressable>
  );
}

function getButtonStyles(variant: ButtonVariant, size: ButtonSize, disabled: boolean) {
  if (disabled) {
    return {
      container: button3D.disabled,
      text: { color: colors.text.secondary },
    };
  }

  const variantStyles = button3D[variant];

  return {
    container: variantStyles.default,
    text: {
      color: variant === 'ghost' ? colors.primary.main :
             variant === 'secondary' ? colors.text.inverse :
             colors.text.primary,
    },
  };
}

function getSizeTextStyle(size: ButtonSize): TextStyle {
  switch (size) {
    case 'sm':
      return { fontSize: 14, fontWeight: '600' };
    case 'md':
      return { fontSize: 16, fontWeight: '600' };
    case 'lg':
      return { fontSize: 18, fontWeight: '700' };
    case 'xl':
      return { fontSize: 20, fontWeight: '700', letterSpacing: 1 };
    default:
      return { fontSize: 18, fontWeight: '700' };
  }
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    textAlign: 'center',
  },
});
