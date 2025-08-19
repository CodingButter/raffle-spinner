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

// Chrome storage operations
const chromeStorageHelpers = {
  isAvailable: () => typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local,
  
  loadFromStorage: async (): Promise<Record<string, any>> => {
    if (!chromeStorageHelpers.isAvailable()) return {};
    try {
      const result = await chrome.storage.local.get('data');
      return result.data || {};
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load from Chrome storage:', error);
      return {};
    }
  },

  saveToStorage: async (theme: ThemeSettings) => {
    if (!chromeStorageHelpers.isAvailable()) {
      // eslint-disable-next-line no-console
      console.log('Chrome storage not available, theme changes will not persist');
      return;
    }
    
    try {
      const result = await chrome.storage.local.get('data');
      const data = result.data || {};
      await chrome.storage.local.set({ data: { ...data, theme } });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Failed to save theme to storage:', error);
    }
  }
};

// Theme utilities
const themeUtilities = {
  determineIsDark: (scheme?: ColorScheme): boolean => {
    if (!scheme || scheme === 'system') {
      return getSystemColorScheme() === 'dark';
    }
    return scheme === 'dark';
  },

  createLoadedTheme: (themeData: Partial<ThemeSettings>): ThemeSettings => {
    const isDark = themeUtilities.determineIsDark(themeData.colorScheme);
    return {
      colorScheme: themeData.colorScheme || 'system',
      colors: { ...getDefaultColors(isDark), ...themeData.colors },
      spinnerStyle: { ...getDefaultSpinnerStyle(isDark), ...themeData.spinnerStyle },
      branding: { ...DEFAULT_BRANDING, ...themeData.branding },
      customCSS: themeData.customCSS,
    };
  }
};

// Theme update operations
const createThemeUpdaters = (theme: ThemeSettings, setTheme: React.Dispatch<React.SetStateAction<ThemeSettings>>, updateEffectiveColorScheme: (scheme?: ColorScheme) => void) => ({
  updateColors: async (colors: Partial<ThemeColors>) => {
    const newTheme = { ...theme, colors: { ...theme.colors, ...colors } };
    setTheme(newTheme);
    await chromeStorageHelpers.saveToStorage(newTheme);
  },

  updateSpinnerStyle: async (style: Partial<SpinnerStyle>) => {
    const newTheme = { ...theme, spinnerStyle: { ...theme.spinnerStyle, ...style } };
    setTheme(newTheme);
    await chromeStorageHelpers.saveToStorage(newTheme);
  },

  updateBranding: async (branding: Partial<BrandingSettings>) => {
    const newTheme = { ...theme, branding: { ...theme.branding, ...branding } };
    setTheme(newTheme);
    await chromeStorageHelpers.saveToStorage(newTheme);
  },

  updateColorScheme: async (scheme: ColorScheme) => {
    const isDark = themeUtilities.determineIsDark(scheme);
    const newTheme = {
      ...theme,
      colorScheme: scheme,
      colors: getDefaultColors(isDark),
      spinnerStyle: getDefaultSpinnerStyle(isDark),
    };
    setTheme(newTheme);
    updateEffectiveColorScheme(scheme);
    await chromeStorageHelpers.saveToStorage(newTheme);
  },

  resetTheme: async () => {
    const defaultTheme = getDefaultTheme();
    setTheme(defaultTheme);
    updateEffectiveColorScheme('system');
    await chromeStorageHelpers.saveToStorage(defaultTheme);
  },

  applyCustomCSS: async (css: string) => {
    const newTheme = { ...theme, customCSS: css };
    setTheme(newTheme);
    await chromeStorageHelpers.saveToStorage(newTheme);
  },
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeSettings>(getDefaultTheme());
  const [effectiveColorScheme, setEffectiveColorScheme] = useState<'light' | 'dark'>(
    getSystemColorScheme() as 'light' | 'dark'
  );

  const updateEffectiveColorScheme = (scheme?: ColorScheme) => {
    const resolvedScheme = scheme || 'system';
    if (resolvedScheme === 'system') {
      setEffectiveColorScheme(getSystemColorScheme() as 'light' | 'dark');
    } else {
      setEffectiveColorScheme(resolvedScheme as 'light' | 'dark');
    }
  };

  const loadTheme = async () => {
    const data = await chromeStorageHelpers.loadFromStorage();
    
    if (data.theme) {
      const loadedTheme = themeUtilities.createLoadedTheme(data.theme);
      setTheme(loadedTheme);
      updateEffectiveColorScheme(loadedTheme.colorScheme);
    } else {
      const defaultTheme = getDefaultTheme();
      setTheme(defaultTheme);
      updateEffectiveColorScheme(defaultTheme.colorScheme);
    }
  };

  useEffect(() => {
    loadTheme();

    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.data?.newValue?.theme) {
        setTheme(changes.data.newValue.theme);
        updateEffectiveColorScheme(changes.data.newValue.theme.colorScheme);
      }
    };

    const handleColorSchemeChange = () => {
      if (theme.colorScheme === 'system' || !theme.colorScheme) {
        const newScheme = getSystemColorScheme() as 'light' | 'dark';
        setEffectiveColorScheme(newScheme);
        const isDark = newScheme === 'dark';
        setTheme(prev => ({
          ...prev,
          colors: getDefaultColors(isDark),
          spinnerStyle: getDefaultSpinnerStyle(isDark),
        }));
      }
    };

    if (chromeStorageHelpers.isAvailable() && chrome.storage.onChanged) {
      chrome.storage.onChanged.addListener(handleStorageChange);
    }

    const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    colorSchemeQuery.addEventListener('change', handleColorSchemeChange);

    return () => {
      if (chromeStorageHelpers.isAvailable() && chrome.storage.onChanged) {
        chrome.storage.onChanged.removeListener(handleStorageChange);
      }
      colorSchemeQuery.removeEventListener('change', handleColorSchemeChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme.colorScheme]);

  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  const themeUpdaters = createThemeUpdaters(theme, setTheme, updateEffectiveColorScheme);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        updateColors: themeUpdaters.updateColors,
        updateSpinnerStyle: themeUpdaters.updateSpinnerStyle,
        updateBranding: themeUpdaters.updateBranding,
        updateColorScheme: themeUpdaters.updateColorScheme,
        resetTheme: themeUpdaters.resetTheme,
        applyCustomCSS: themeUpdaters.applyCustomCSS,
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