/**
 * Moody Theme - Shadows
 * 3D effects, Duolingo-style button shadows
 */

import { ViewStyle } from 'react-native';
import { colors } from './colors';

// Standard elevation shadows
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  } as ViewStyle,

  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  } as ViewStyle,

  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  } as ViewStyle,

  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  } as ViewStyle,

  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  } as ViewStyle,
} as const;

// Duolingo-style 3D button effect
// Uses a thick bottom border to create depth + red glow
// GLOSSY on MAT background
export const button3D = {
  // Primary red button (main CTA) - GLOSSY & HOT
  primary: {
    default: {
      backgroundColor: colors.primary.main,
      borderBottomWidth: 5,
      borderBottomColor: colors.primary.dark,
      // Strong red glow - glossy effect
      shadowColor: colors.primary.main,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.55,
      shadowRadius: 16,
      elevation: 10,
    } as ViewStyle,
    pressed: {
      backgroundColor: colors.primary.light,
      borderBottomWidth: 2,
      borderBottomColor: colors.primary.dark,
      transform: [{ translateY: 3 }],
      shadowColor: colors.primary.light,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 12,
      elevation: 6,
    } as ViewStyle,
  },

  // Secondary lighter red button
  secondary: {
    default: {
      backgroundColor: colors.secondary.main,
      borderBottomWidth: 4,
      borderBottomColor: colors.secondary.dark,
      ...shadows.md,
    } as ViewStyle,
    pressed: {
      backgroundColor: colors.secondary.main,
      borderBottomWidth: 2,
      borderBottomColor: colors.secondary.dark,
      transform: [{ translateY: 2 }],
      ...shadows.sm,
    } as ViewStyle,
  },

  // Ghost/outline button
  ghost: {
    default: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: colors.primary.main,
      borderBottomWidth: 4,
    } as ViewStyle,
    pressed: {
      backgroundColor: 'rgba(229, 57, 53, 0.15)',
      borderWidth: 2,
      borderColor: colors.primary.main,
      borderBottomWidth: 2,
      transform: [{ translateY: 2 }],
    } as ViewStyle,
  },

  // Danger button
  danger: {
    default: {
      backgroundColor: colors.semantic.error,
      borderBottomWidth: 4,
      borderBottomColor: '#CC2F27',
      ...shadows.md,
    } as ViewStyle,
    pressed: {
      backgroundColor: colors.semantic.error,
      borderBottomWidth: 2,
      borderBottomColor: '#CC2F27',
      transform: [{ translateY: 2 }],
      ...shadows.sm,
    } as ViewStyle,
  },

  // Success button
  success: {
    default: {
      backgroundColor: colors.semantic.success,
      borderBottomWidth: 4,
      borderBottomColor: '#2A9F47',
      ...shadows.md,
    } as ViewStyle,
    pressed: {
      backgroundColor: colors.semantic.success,
      borderBottomWidth: 2,
      borderBottomColor: '#2A9F47',
      transform: [{ translateY: 2 }],
      ...shadows.sm,
    } as ViewStyle,
  },

  // Disabled state
  disabled: {
    backgroundColor: colors.ui.disabled,
    borderBottomWidth: 3,
    borderBottomColor: '#2A2225',
    opacity: 0.5,
  } as ViewStyle,
} as const;

// Card shadows - Premium & dramatic
export const cardShadows = {
  // Standard card
  default: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  } as ViewStyle,

  // Elevated/floating card
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  } as ViewStyle,

  // Devil glow - soft red aura
  glow: {
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 10,
  } as ViewStyle,

  // Hot pink glow - playful & teasing
  pinkGlow: {
    shadowColor: colors.secondary.main,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  } as ViewStyle,

  // Subtle inner depth
  inset: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  } as ViewStyle,
} as const;

// Inner shadows (simulated with borders)
export const innerShadows = {
  pressed: {
    borderTopWidth: 2,
    borderTopColor: 'rgba(0, 0, 0, 0.2)',
  } as ViewStyle,
} as const;

export type ShadowLevel = keyof typeof shadows;
export type Button3DVariant = keyof typeof button3D;
