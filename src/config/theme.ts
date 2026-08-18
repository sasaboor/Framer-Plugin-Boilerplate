/**
 * Centralized Theme Configuration
 *
 * All colors, spacing, and design tokens used in the application.
 * Update these values to customize the entire plugin's appearance.
 */

export const THEME = {
  // ==========================================
  // COLORS
  // ==========================================
  colors: {
    // Primary/Accent Color
    // Used for: primary buttons, links, active states, highlights
    primary: {
      DEFAULT: '#0099FF',      // Main accent color
      hover: '#0088EE',         // Hover state
      light: 'rgba(0, 153, 255, 0.1)',  // Light background
      lighter: 'rgba(0, 153, 255, 0.05)', // Very light background
    },

    // Success States
    success: {
      DEFAULT: '#10B981',       // Green - success messages
      dark: '#059669',          // Dark green
      light: 'rgba(16, 185, 129, 0.1)', // Light green background
    },

    // Warning States
    warning: {
      DEFAULT: '#F59E0B',       // Amber - warnings
      dark: '#D97706',          // Dark amber
      light: 'rgba(245, 158, 11, 0.1)', // Light amber background
    },

    // Error/Danger States
    error: {
      DEFAULT: '#EF4444',       // Red - errors, destructive actions
      dark: '#DC2626',          // Dark red
      light: 'rgba(239, 68, 68, 0.1)', // Light red background
    },

    // Info States
    info: {
      DEFAULT: '#3B82F6',       // Blue - info messages
      dark: '#2563EB',          // Dark blue
      light: 'rgba(59, 130, 246, 0.1)', // Light blue background
    },

    // Neutral/Gray Scale
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
  },

  // ==========================================
  // SPACING
  // ==========================================
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
  },

  // ==========================================
  // TYPOGRAPHY
  // ==========================================
  typography: {
    fontFamily: {
      sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
    },
    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },

  // ==========================================
  // BORDER RADIUS
  // ==========================================
  borderRadius: {
    none: '0',
    sm: '0.25rem',      // 4px
    DEFAULT: '0.5rem',  // 8px - default for most components
    md: '0.5rem',       // 8px
    lg: '0.75rem',      // 12px
    xl: '1rem',         // 16px
    '2xl': '1.5rem',    // 24px
    full: '9999px',     // Pills/circular
  },

  // ==========================================
  // SHADOWS
  // ==========================================
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    none: 'none',
  },

  // ==========================================
  // ANIMATION
  // ==========================================
  animation: {
    duration: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
    },
    easing: {
      DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  // ==========================================
  // Z-INDEX LAYERS
  // ==========================================
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
} as const;

/**
 * Type helpers for theme values
 */
export type ThemeColors = typeof THEME.colors;
export type ThemeSpacing = typeof THEME.spacing;
export type ThemeTypography = typeof THEME.typography;

/**
 * Helper to get CSS variable syntax for colors
 * @param color - Color path like "primary.DEFAULT" or "gray.500"
 */
export function getCSSVariable(color: string): string {
  return `var(--${color.replace('.', '-')})`;
}

/**
 * Helper to generate CSS custom properties from theme
 * This can be used to inject theme variables into your CSS
 */
export function generateCSSVariables(): string {
  const vars: string[] = [];

  // Generate color variables
  Object.entries(THEME.colors).forEach(([key, value]) => {
    if (typeof value === 'string') {
      vars.push(`--${key}: ${value};`);
    } else {
      Object.entries(value).forEach(([subKey, subValue]) => {
        vars.push(`--${key}-${subKey}: ${subValue};`);
      });
    }
  });

  return `:root {\n  ${vars.join('\n  ')}\n}`;
}

/**
 * Commonly used color combinations
 */
export const COLOR_PRESETS = {
  // Primary button
  primaryButton: {
    background: THEME.colors.primary.DEFAULT,
    backgroundHover: THEME.colors.primary.hover,
    text: '#FFFFFF',
  },

  // Success state
  success: {
    background: THEME.colors.success.light,
    border: THEME.colors.success.DEFAULT,
    text: THEME.colors.success.dark,
  },

  // Error state
  error: {
    background: THEME.colors.error.light,
    border: THEME.colors.error.DEFAULT,
    text: THEME.colors.error.dark,
  },

  // Warning state
  warning: {
    background: THEME.colors.warning.light,
    border: THEME.colors.warning.DEFAULT,
    text: THEME.colors.warning.dark,
  },

  // Info state
  info: {
    background: THEME.colors.info.light,
    border: THEME.colors.info.DEFAULT,
    text: THEME.colors.info.dark,
  },
} as const;

/**
 * Export default theme
 */
export default THEME;
