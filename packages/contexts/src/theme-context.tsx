/**
 * Theme Context
 *
 * Provides theme management for Raffle Spinner applications.
 * Supports light/dark mode and custom theme colors.
 *
 * @example
 * ```tsx
 * // Wrap app with provider
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 *
 * // Use in components
 * const { theme, setTheme } = useTheme();
 * ```
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocalStorage } from '@drawday/hooks';

/**
 * Available theme modes
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Custom theme colors configuration
 */
export interface ThemeColors {
  primary?: string;
  secondary?: string;
  accent?: string;
  background?: string;
  foreground?: string;
  card?: string;
  cardForeground?: string;
}

/**
 * Theme configuration object
 */
export interface Theme {
  mode: ThemeMode;
  colors?: ThemeColors;
}

/**
 * Theme context value interface
 */
interface ThemeContextValue {
  /** Current theme configuration */
  theme: Theme;
  /** Set the theme mode */
  setThemeMode: (mode: ThemeMode) => void;
  /** Set custom theme colors */
  setThemeColors: (colors: ThemeColors) => void;
  /** Reset theme to defaults */
  resetTheme: () => void;
  /** Current resolved theme (accounting for system preference) */
  resolvedTheme: 'light' | 'dark';
}

/**
 * Default theme configuration
 */
const DEFAULT_THEME: Theme = {
  mode: 'system',
  colors: undefined,
};

/**
 * Theme Context
 */
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Theme Provider Props
 */
interface ThemeProviderProps {
  children: ReactNode;
  /** Initial theme configuration */
  defaultTheme?: Theme;
  /** Storage key for persisting theme */
  storageKey?: string;
}

/**
 * Theme Provider Component
 *
 * Manages theme state and provides it to child components.
 * Automatically persists theme preferences to localStorage.
 */
export function ThemeProvider({
  children,
  defaultTheme = DEFAULT_THEME,
  storageKey = 'raffle-spinner-theme',
}: ThemeProviderProps) {
  // Use localStorage hook for persistence
  const [theme, setTheme] = useLocalStorage<Theme>(storageKey, defaultTheme);

  // Track system theme preference
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

  // Determine resolved theme based on mode
  const resolvedTheme = theme.mode === 'system' ? systemTheme : theme.mode;

  // Listen for system theme changes
  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window === 'undefined') return;

    // Get initial system theme
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply theme to document root
  useEffect(() => {
    // Check if document is available
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    // Apply theme mode class
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);

    // Apply custom colors as CSS variables
    if (theme.colors) {
      Object.entries(theme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--theme-${key}`, value);
      });
    }
  }, [resolvedTheme, theme.colors]);

  // Context methods
  const setThemeMode = (mode: ThemeMode) => {
    setTheme((prev) => ({ ...prev, mode }));
  };

  const setThemeColors = (colors: ThemeColors) => {
    setTheme((prev) => ({ ...prev, colors }));
  };

  const resetTheme = () => {
    setTheme(DEFAULT_THEME);

    // Remove custom CSS variables
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      [
        'primary',
        'secondary',
        'accent',
        'background',
        'foreground',
        'card',
        'cardForeground',
      ].forEach((key) => {
        root.style.removeProperty(`--theme-${key}`);
      });
    }
  };

  const value: ThemeContextValue = {
    theme,
    setThemeMode,
    setThemeColors,
    resetTheme,
    resolvedTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Hook to access theme context
 *
 * @throws Error if used outside of ThemeProvider
 * @returns Theme context value
 */
export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}
