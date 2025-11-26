/**
 * Spacing System
 * Consistent spacing, border radius, and shadows for PantryPartner
 */

/**
 * Spacing Scale
 * Use these values for margins, padding, and gaps
 */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

/**
 * Border Radius
 * Consistent rounded corners throughout the app
 */
export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 12,
  xl: 16,
  pill: 20,   // For badges and tags
  full: 9999, // Perfect circles
};

/**
 * Shadow Styles
 * Warm-toned elevation shadows for cards and elevated elements
 */
export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  small: {
    shadowColor: 'rgba(45, 58, 40, 0.1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },

  medium: {
    shadowColor: 'rgba(45, 58, 40, 0.15)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },

  large: {
    shadowColor: 'rgba(45, 58, 40, 0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },

  card: {
    shadowColor: 'rgba(45, 58, 40, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 3,
  },
};

export default { Spacing, BorderRadius, Shadows };
