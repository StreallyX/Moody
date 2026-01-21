/**
 * Moody Theme - Animation Configs
 * Spring configurations for react-native-reanimated
 */

import { Easing } from 'react-native-reanimated';

// Spring configurations for different animation feels
export const springs = {
  // Snappy spring (quick, minimal overshoot)
  // Good for: button presses, quick transitions
  snappy: {
    damping: 20,
    mass: 1,
    stiffness: 300,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },

  // Bouncy spring (playful, more overshoot)
  // Good for: success animations, playful elements
  bouncy: {
    damping: 10,
    mass: 1,
    stiffness: 200,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },

  // Gentle spring (slow, smooth)
  // Good for: modal entries, page transitions
  gentle: {
    damping: 25,
    mass: 1,
    stiffness: 150,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },

  // Stiff spring (very quick, almost no overshoot)
  // Good for: immediate feedback
  stiff: {
    damping: 30,
    mass: 0.8,
    stiffness: 400,
    overshootClamping: true,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },

  // Wobbly spring (lots of bounce)
  // Good for: attention-grabbing, celebration
  wobbly: {
    damping: 8,
    mass: 1,
    stiffness: 180,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
} as const;

// Timing configurations
export const timings = {
  // Very fast (quick feedback)
  instant: {
    duration: 100,
    easing: Easing.out(Easing.ease),
  },

  // Fast
  fast: {
    duration: 200,
    easing: Easing.out(Easing.ease),
  },

  // Normal
  normal: {
    duration: 300,
    easing: Easing.inOut(Easing.ease),
  },

  // Slow (for dramatic effect)
  slow: {
    duration: 500,
    easing: Easing.inOut(Easing.ease),
  },

  // Very slow (for emphasis)
  verySlow: {
    duration: 800,
    easing: Easing.inOut(Easing.ease),
  },
} as const;

// Pre-defined animation presets
export const animationPresets = {
  // Button press animation values
  buttonPress: {
    scale: 0.95,
    translateY: 2,
    spring: springs.snappy,
  },

  // Card entry animation
  cardEntry: {
    initialOpacity: 0,
    initialTranslateY: 30,
    finalOpacity: 1,
    finalTranslateY: 0,
    spring: springs.gentle,
  },

  // Modal entry
  modalEntry: {
    initialOpacity: 0,
    initialScale: 0.9,
    initialTranslateY: 50,
    spring: springs.bouncy,
  },

  // Chip removal (swipe out)
  chipRemoval: {
    exitScale: 0.8,
    exitOpacity: 0,
    exitTranslateX: -100,
    timing: timings.fast,
  },

  // Bounce attention
  bounce: {
    values: [1, 1.1, 0.95, 1.05, 1],
    spring: springs.wobbly,
  },

  // Shake (for errors)
  shake: {
    values: [0, -10, 10, -10, 10, 0],
    timing: timings.fast,
  },

  // Pulse (for highlighting)
  pulse: {
    minScale: 1,
    maxScale: 1.05,
    timing: {
      duration: 1000,
      easing: Easing.inOut(Easing.ease),
    },
  },

  // Float (idle mascot animation)
  float: {
    translateY: [-5, 5],
    duration: 2000,
    easing: Easing.inOut(Easing.sin),
  },

  // Wiggle (excited mascot)
  wiggle: {
    rotate: [-5, 5, -5, 5, 0],
    timing: timings.fast,
  },
} as const;

// Stagger delays for list animations
export const stagger = {
  fast: 50,    // 50ms between items
  normal: 100, // 100ms between items
  slow: 150,   // 150ms between items
} as const;

// Duration constants
export const durations = {
  instant: 100,
  fast: 200,
  normal: 300,
  slow: 500,
  verySlow: 800,
  // For looping animations
  loop: {
    pulse: 1500,
    float: 2000,
    shimmer: 1500,
  },
} as const;

export type SpringConfig = keyof typeof springs;
export type TimingConfig = keyof typeof timings;
export type AnimationPreset = keyof typeof animationPresets;
