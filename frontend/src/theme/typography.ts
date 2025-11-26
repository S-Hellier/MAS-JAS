/**
 * Typography System
 * Font sizes, weights, and text styles for PantryPartner
 */

export const Typography = {
  // Font Sizes
  fontSize: {
    display: 32,      // Large headings, splash screens
    h1: 28,          // Screen titles
    h2: 24,          // Section headers
    h3: 20,          // Card titles
    h4: 18,          // Subsection headers
    body: 16,        // Regular body text
    bodySmall: 14,   // Smaller body text
    label: 14,       // Input labels
    caption: 13,     // Captions, helper text
    small: 12,       // Very small text, metadata
    button: 16,      // Button text
  },

  // Font Weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export default Typography;
