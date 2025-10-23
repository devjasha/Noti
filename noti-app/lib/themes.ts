import fs from 'fs/promises';
import path from 'path';

// This module is for server-side use only (API routes)
// Do not import this in client components

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

const THEMES_DIR = path.join(process.cwd(), 'themes');

/**
 * Get all available themes
 */
export async function getAllThemes(): Promise<Theme[]> {
  try {
    const files = await fs.readdir(THEMES_DIR);
    const themeFiles = files.filter(file => file.endsWith('.json'));

    const themes = await Promise.all(
      themeFiles.map(async (file) => {
        const filePath = path.join(THEMES_DIR, file);
        const content = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(content) as Theme;
      })
    );

    return themes;
  } catch (error) {
    console.error('Error loading themes:', error);
    return [];
  }
}

/**
 * Get a specific theme by name
 */
export async function getTheme(name: string): Promise<Theme | null> {
  try {
    const fileName = `${name.toLowerCase().replace(/\s+/g, '-')}.json`;
    const filePath = path.join(THEMES_DIR, fileName);
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as Theme;
  } catch (error) {
    console.error(`Error loading theme ${name}:`, error);
    return null;
  }
}

/**
 * Save a theme to filesystem
 */
export async function saveTheme(theme: Theme): Promise<boolean> {
  try {
    const fileName = `${theme.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    const filePath = path.join(THEMES_DIR, fileName);
    await fs.writeFile(filePath, JSON.stringify(theme, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error saving theme:', error);
    return false;
  }
}

/**
 * Delete a theme from filesystem
 */
export async function deleteTheme(name: string): Promise<boolean> {
  try {
    const fileName = `${name.toLowerCase().replace(/\s+/g, '-')}.json`;
    const filePath = path.join(THEMES_DIR, fileName);
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    console.error('Error deleting theme:', error);
    return false;
  }
}

/**
 * Validate theme format
 */
export function validateTheme(theme: any): theme is Theme {
  if (!theme.name || !theme.author || !theme.version || !theme.colors) {
    return false;
  }

  const requiredColors = [
    'primary',
    'primaryHover',
    'secondary',
    'accent',
    'background',
    'surface',
    'foreground',
    'textPrimary',
    'textSecondary',
    'textMuted',
    'border',
    'borderLight'
  ];

  for (const color of requiredColors) {
    if (!theme.colors[color]) {
      return false;
    }
  }

  return true;
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
