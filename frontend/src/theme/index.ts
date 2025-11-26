/**
 * Theme System Export
 * Central export for all theme values
 */

export { Colors } from './colors';
export { Typography } from './typography';
export { Spacing, BorderRadius, Shadows } from './spacing';

// Re-export as a single Theme object for convenience
import { Colors } from './colors';
import { Typography } from './typography';
import { Spacing, BorderRadius, Shadows } from './spacing';

export const Theme = {
  colors: Colors,
  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadows: Shadows,
};

export default Theme;
