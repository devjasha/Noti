// Client-side theme utilities (safe for browser)

export interface Theme {
  name: string;
  author: string;
  version: string;
  description: string;
  type: 'light' | 'dark';
  colors: {
    primary: string;
    primaryHover: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    headerBg?: string;
    foreground: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    borderLight: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
  radius: {
    default: string;
    sm: string;
  };
}

/**
 * Convert theme to CSS custom properties
 */
export function themeToCSSVariables(theme: Theme): Record<string, string> {
  return {
    '--primary': theme.colors.primary,
    '--primary-hover': theme.colors.primaryHover,
    '--secondary': theme.colors.secondary,
    '--accent': theme.colors.accent,
    '--background': theme.colors.background,
    '--surface': theme.colors.surface,
    '--header-bg': theme.colors.headerBg || theme.colors.surface,
    '--foreground': theme.colors.foreground,
    '--text-primary': theme.colors.textPrimary,
    '--text-secondary': theme.colors.textSecondary,
    '--text-muted': theme.colors.textMuted,
    '--border': theme.colors.border,
    '--border-light': theme.colors.borderLight,
    '--shadow-sm': theme.shadows.sm,
    '--shadow-md': theme.shadows.md,
    '--shadow-lg': theme.shadows.lg,
    '--radius': theme.radius.default,
    '--radius-sm': theme.radius.sm,
  };
}
