/**
 * Moody Theme - Spacing & Layout
 * Margins, paddings, and border-radius values
 */

// Base spacing scale (in pixels)
// Uses 4px base unit for consistency
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
} as const;

// Border radius scale
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  '4xl': 32,
  full: 999,  // For pill shapes
} as const;

// Component-specific sizing
export const componentSizes = {
  // Buttons
  button: {
    sm: {
      height: 36,
      paddingHorizontal: spacing[4],
      borderRadius: borderRadius.lg,
    },
    md: {
      height: 48,
      paddingHorizontal: spacing[6],
      borderRadius: borderRadius.xl,
    },
    lg: {
      height: 56,
      paddingHorizontal: spacing[8],
      borderRadius: borderRadius['2xl'],
    },
    xl: {
      height: 64,
      paddingHorizontal: spacing[10],
      borderRadius: borderRadius['3xl'],
    },
  },

  // Chips
  chip: {
    height: 36,
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.full,
  },

  // Cards
  card: {
    padding: spacing[6],
    borderRadius: borderRadius['2xl'],
  },

  // Input fields
  input: {
    height: 48,
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.full,
  },

  // Icons
  icon: {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 40,
  },

  // Avatar/Profile pics
  avatar: {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96,
  },

  // Touch targets (minimum for accessibility)
  touchTarget: {
    min: 44,  // Apple HIG recommendation
  },
} as const;

// Screen layout
export const layout = {
  // Screen padding
  screenPadding: {
    horizontal: spacing[5],
    vertical: spacing[4],
  },

  // Content max width (for tablets)
  maxContentWidth: 600,

  // Header heights
  header: {
    default: 56,
    large: 96,
  },

  // Bottom bar
  bottomBar: {
    height: 80,
    padding: spacing[4],
  },

  // Modal
  modal: {
    padding: spacing[5],
    borderRadius: borderRadius['2xl'],
    maxWidth: 340,
  },
} as const;

// Gap sizes for flex containers
export const gaps = {
  xs: spacing[1],
  sm: spacing[2],
  md: spacing[3],
  lg: spacing[4],
  xl: spacing[6],
  '2xl': spacing[8],
} as const;

export type Spacing = keyof typeof spacing;
export type BorderRadius = keyof typeof borderRadius;
