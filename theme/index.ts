/**
 * Moody Theme - Main Export
 * Central export for all theme values
 */

export { colors, legacyColors, type ColorPalette } from './colors';
export {
  fontSizes,
  fontWeights,
  lineHeights,
  letterSpacing,
  textStyles,
  type FontSize,
  type FontWeight,
  type TextStyleName,
} from './typography';
export {
  spacing,
  borderRadius,
  componentSizes,
  layout,
  gaps,
  type Spacing,
  type BorderRadius,
} from './spacing';
export {
  shadows,
  button3D,
  cardShadows,
  innerShadows,
  type ShadowLevel,
  type Button3DVariant,
} from './shadows';
export {
  springs,
  timings,
  animationPresets,
  stagger,
  durations,
  type SpringConfig,
  type TimingConfig,
  type AnimationPreset,
} from './animations';

// Convenience re-export of the complete theme object
import { colors } from './colors';
import { fontSizes, fontWeights, textStyles } from './typography';
import { spacing, borderRadius, componentSizes, layout } from './spacing';
import { shadows, button3D, cardShadows } from './shadows';
import { springs, timings, animationPresets, durations } from './animations';

export const theme = {
  colors,
  fontSizes,
  fontWeights,
  textStyles,
  spacing,
  borderRadius,
  componentSizes,
  layout,
  shadows,
  button3D,
  cardShadows,
  springs,
  timings,
  animationPresets,
  durations,
} as const;

export type Theme = typeof theme;
export default theme;
