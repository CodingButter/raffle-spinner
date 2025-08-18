/**
 * Theme Context
 *
 * Purpose: Provides theme settings and customization options throughout the application,
 * including colors, spinner styles, and branding configuration.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import type {
  ThemeSettings,
  ThemeColors,
  SpinnerStyle,
  BrandingSettings,
  ColorScheme,
} from '@raffle-spinner/storage';
import { getDefaultTheme, getDefaultColors, getDefaultSpinnerStyle, DEFAULT_BRANDING, getSystemColorScheme } from './theme-defaults';
import { applyThemeToDOM } from './theme-dom';

interface ThemeContextType {
  theme: ThemeSettings;
  updateColors: (colors: Partial<ThemeColors>) => Promise<void>;
  updateSpinnerStyle: (style: Partial<SpinnerStyle>) => Promise<void>;
  updateBranding: (branding: Partial<BrandingSettings>) => Promise<void>;
  updateColorScheme: (scheme: ColorScheme) => Promise<void>;
  resetTheme: () => Promise<void>;
  applyCustomCSS: (css: string) => Promise<void>;
  effectiveColorScheme: 'light' | 'dark'; // Resolved color scheme (never 'system')
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeSettings>(getDefaultTheme());
  const [effectiveColorScheme, setEffectiveColorScheme] = useState<'light' | 'dark'>(
    getSystemColorScheme() as 'light' | 'dark'
  );

  useEffect(() => {
    loadTheme();

    // Listen for storage changes from other contexts (like options page)
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.data) {
        const newData = changes.data.newValue;
        if (newData?.theme) {
          setTheme(newData.theme);
          updateEffectiveColorScheme(newData.theme.colorScheme);
        }
      }
    };

    // Listen for system color scheme changes
    const handleColorSchemeChange = () => {
      if (theme.colorScheme === 'system' || !theme.colorScheme) {
        const newScheme = getSystemColorScheme() as 'light' | 'dark';
        setEffectiveColorScheme(newScheme);
        // Update theme colors based on new system preference
        const isDark = newScheme === 'dark';
        setTheme(prev => ({
          ...prev,
          colors: getDefaultColors(isDark),
          spinnerStyle: getDefaultSpinnerStyle(isDark),
        }));
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    colorSchemeQuery.addEventListener('change', handleColorSchemeChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
      colorSchemeQuery.removeEventListener('change', handleColorSchemeChange);
    };
  }, []);

  // Apply theme colors to CSS variables whenever theme changes
  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  const updateEffectiveColorScheme = (scheme?: ColorScheme) => {
    const resolvedScheme = scheme || 'system';
    if (resolvedScheme === 'system') {
      setEffectiveColorScheme(getSystemColorScheme() as 'light' | 'dark');
    } else {
      setEffectiveColorScheme(resolvedScheme as 'light' | 'dark');
    }
  };

  const loadTheme = async () => {
    const result = await chrome.storage.local.get('data');
    const data = result.data || {};
    if (data.theme) {
      const isDark = determineIsDark(data.theme.colorScheme);
      // Merge with defaults to ensure all properties exist
      const loadedTheme = {
        colorScheme: data.theme.colorScheme || 'system',
        colors: { ...getDefaultColors(isDark), ...data.theme.colors },
        spinnerStyle: { ...getDefaultSpinnerStyle(isDark), ...data.theme.spinnerStyle },
        branding: { ...DEFAULT_BRANDING, ...data.theme.branding },
        customCSS: data.theme.customCSS,
      };
      setTheme(loadedTheme);
      updateEffectiveColorScheme(loadedTheme.colorScheme);
    }
  };

  const determineIsDark = (scheme?: ColorScheme): boolean => {
    if (!scheme || scheme === 'system') {
      return getSystemColorScheme() === 'dark';
    }
    return scheme === 'dark';
  };

  const saveTheme = async (newTheme: ThemeSettings) => {
    const result = await chrome.storage.local.get('data');
    const data = result.data || {};
    await chrome.storage.local.set({
      data: { ...data, theme: newTheme },
    });
  };

  const updateColors = async (colors: Partial<ThemeColors>) => {
    const newTheme = {
      ...theme,
      colors: { ...theme.colors, ...colors },
    };
    setTheme(newTheme);
    await saveTheme(newTheme);
  };

  const updateSpinnerStyle = async (style: Partial<SpinnerStyle>) => {
    const newTheme = {
      ...theme,
      spinnerStyle: { ...theme.spinnerStyle, ...style },
    };
    setTheme(newTheme);
    await saveTheme(newTheme);
  };

  const updateBranding = async (branding: Partial<BrandingSettings>) => {
    const newTheme = {
      ...theme,
      branding: { ...theme.branding, ...branding },
    };
    setTheme(newTheme);
    await saveTheme(newTheme);
  };

  const updateColorScheme = async (scheme: ColorScheme) => {
    const isDark = determineIsDark(scheme);
    const newTheme = {
      ...theme,
      colorScheme: scheme,
      colors: getDefaultColors(isDark),
      spinnerStyle: getDefaultSpinnerStyle(isDark),
    };
    setTheme(newTheme);
    updateEffectiveColorScheme(scheme);
    await saveTheme(newTheme);
  };

  const resetTheme = async () => {
    const defaultTheme = getDefaultTheme();
    setTheme(defaultTheme);
    updateEffectiveColorScheme('system');
    await saveTheme(defaultTheme);
  };

  const applyCustomCSS = async (css: string) => {
    const newTheme = { ...theme, customCSS: css };
    setTheme(newTheme);
    await saveTheme(newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        updateColors,
        updateSpinnerStyle,
        updateBranding,
        updateColorScheme,
        resetTheme,
        applyCustomCSS,
        effectiveColorScheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}