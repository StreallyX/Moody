/**
 * Moody Theme - Color Palette
 * Clean devil theme matching the logo
 */

export const colors = {
  // Primary palette - Devil red
  primary: {
    main: '#E53935',      // Devil red - matches logo
    light: '#FF6659',     // Lighter red for hover
    dark: '#AB000D',      // Darker red for pressed
  },

  // Secondary palette - Subtle highlights
  secondary: {
    main: '#FF6659',      // Lighter red for accents
    light: '#FF8A80',     // Even lighter
    dark: '#C62828',      // Deep red
  },

  // Background colors - Dark burgundy like logo
  background: {
    primary: '#1A0A0A',   // Dark burgundy - main background
    secondary: '#2D1414', // Slightly lighter burgundy
    tertiary: '#3D1E1E',  // Elevated surfaces
    overlay: 'rgba(10, 5, 5, 0.85)', // Modal overlays
  },

  // Text colors
  text: {
    primary: '#FFFFFF',   // Main text
    secondary: '#CCAAAA', // Muted text with warm tint
    tertiary: '#886666',  // Very muted
    inverse: '#1A0A0A',   // Text on light backgrounds
    accent: '#FF6659',    // Red accent text
  },

  // Semantic colors
  semantic: {
    success: '#34C759',   // Green for success states
    warning: '#FF9500',   // Orange for warnings
    error: '#FF3B30',     // Red for errors
    info: '#5AC8FA',      // Blue for info
  },

  // Game mode colors
  modes: {
    soft: {
      primary: '#7C4DFF',   // Purple for soft mode
      background: '#1A1428',
    },
    hard: {
      primary: '#FF2D55',   // Hot red for hard mode
      background: '#1A0D10',
    },
    caliente: {
      primary: '#FF6B35',   // Orange-red for caliente
      background: '#1A1008',
    },
  },

  // Card colors
  card: {
    challenge: '#FF2D55',
    question: '#7C4DFF',
    dare: '#FF6B35',
    drink: '#00D4AA',
    action: '#FFD700',
    event: '#FF9500',
  },

  // UI element colors
  ui: {
    border: '#4D2828',
    borderAccent: '#E53935',
    divider: '#3D1E1E',
    disabled: '#5D3333',
    chip: {
      background: '#2D1414',
      border: '#E53935',
      text: '#FFFFFF',
    },
  },

  // Gradients (as arrays for LinearGradient)
  gradients: {
    primaryButton: ['#E53935', '#C62828'],
    redShimmer: ['#FF6659', '#E53935', '#AB000D'],
    darkFade: ['#2D1414', '#1A0A0A'],
    cardOverlay: ['rgba(26,10,10,0)', 'rgba(26,10,10,0.9)'],
    hotRed: ['#E53935', '#AB000D'],
    caliente: ['#FF6B35', '#E53935'],
  },
} as const;

// Legacy color mappings for gradual migration
export const legacyColors = {
  '#ffb347': colors.primary.main,  // Old orange -> new red
  '#1a0000': colors.background.primary,  // Old dark maroon -> new deep black
  '#2c0000': colors.background.secondary,  // Old card bg -> new card bg
} as const;

export type ColorPalette = typeof colors;
