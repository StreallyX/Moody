/**
 * Moody Theme - Color Palette
 * ROUGE SUR ROUGE PREMIUM
 * Fond rouge très sombre (mat) + éléments rouge vif (glossy)
 * Nightclub atmosphere - sensual but fun, premium & modern
 * Provocative, confident, teasing - never aggressive
 */

export const colors = {
  // Primary palette - Devil glossy red (for elements)
  primary: {
    main: '#E02020',      // Vif glossy red - CTA & actions
    light: '#FF3A3A',     // Glossy highlight
    dark: '#A01515',      // Deep shadow for 3D effect
  },

  // Secondary palette - Hot pink/rose accents
  secondary: {
    main: '#FF4D6A',      // Hot rose - playful glow
    light: '#FF7A8A',     // Soft pink highlight
    dark: '#CC3D55',      // Deep rose
  },

  // Background colors - ROUGE TRÈS SOMBRE (mat, absorbe)
  background: {
    primary: '#110505',   // Rouge presque noir - fond principal
    secondary: '#1A0808', // Rouge sombre - cartes/surfaces
    tertiary: '#2A0E0E',  // Rouge foncé - éléments élevés
    overlay: 'rgba(17, 5, 5, 0.94)', // Overlay profond
  },

  // Text colors - BLANC/GRIS CHAUD (pour respirer)
  text: {
    primary: '#FAFAFA',   // Blanc pur - titres
    secondary: '#C4B5B5', // Gris chaud rosé - body
    tertiary: '#8A7575',  // Gris chaud muted - hints
    inverse: '#110505',   // Dark on light
    accent: '#FF4D6A',    // Rose vif accent
  },

  // Semantic colors
  semantic: {
    success: '#10B981',   // Emerald - confirmations
    warning: '#F59E0B',   // Amber
    error: '#FF3A3A',     // Bright red
    info: '#06B6D4',      // Cyan
    gold: '#FBBF24',      // Gold/Jaune - pour Friends mode
  },

  // Game mode colors
  modes: {
    soft: {
      primary: '#8B5CF6',   // Purple
      background: '#120812',
    },
    hard: {
      primary: '#E02020',   // Devil red
      background: '#120606',
    },
    caliente: {
      primary: '#FF6B35',   // Orange flame
      background: '#120A06',
    },
  },

  // Card colors
  card: {
    challenge: '#E02020',
    question: '#8B5CF6',
    dare: '#FF6B35',
    drink: '#10B981',
    action: '#FBBF24',
    event: '#F59E0B',
  },

  // UI element colors
  ui: {
    border: '#3D1818',      // Rouge sombre border
    borderLight: '#4D2020', // Border plus visible
    borderAccent: '#E02020', // Rouge vif accent
    divider: '#2A1010',     // Divider subtil
    disabled: '#4A2525',    // Disabled muted
    chip: {
      background: '#1A0808',
      border: '#E02020',
      text: '#FAFAFA',
    },
  },

  // Glow colors - Pour effets lumineux
  glow: {
    red: 'rgba(224, 32, 32, 0.5)',
    redSoft: 'rgba(224, 32, 32, 0.25)',
    pink: 'rgba(255, 77, 106, 0.4)',
    purple: 'rgba(139, 92, 246, 0.35)',
    gold: 'rgba(251, 191, 36, 0.35)',
  },

  // Gradients - Glossy metallic effects
  gradients: {
    primaryButton: ['#FF3A3A', '#E02020', '#A01515'],  // Glossy 3D red
    redShimmer: ['#FF4D6A', '#E02020', '#A01515'],     // Hot shimmer
    darkFade: ['#1A0808', '#110505'],                   // Fond fade
    cardOverlay: ['rgba(17,5,5,0)', 'rgba(17,5,5,0.95)'],
    hotRed: ['#FF3A3A', '#A01515'],
    caliente: ['#FF6B35', '#E02020'],
    devilGlow: ['#E02020', '#FF4D6A', '#E02020'],
    metallic: ['#A01515', '#E02020', '#FF3A3A', '#E02020', '#A01515'],
    // Fond subtil avec rouge
    backgroundGlow: ['#1A0808', '#110505', '#1A0808'],
  },
} as const;

// Legacy color mappings for gradual migration
export const legacyColors = {
  '#ffb347': colors.primary.main,  // Old orange -> new red
  '#1a0000': colors.background.primary,  // Old dark maroon -> new deep black
  '#2c0000': colors.background.secondary,  // Old card bg -> new card bg
} as const;

export type ColorPalette = typeof colors;
