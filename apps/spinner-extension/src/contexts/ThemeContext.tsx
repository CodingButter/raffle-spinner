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
} from '@raffle-spinner/storage';

// Get system color scheme preference
const getSystemColorScheme = () => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

// Default theme configuration - Adapts to system preference
const DEFAULT_COLORS: ThemeColors = (() => {
  const isDark = getSystemColorScheme() === 'dark';

  return {
    primary: '#0b1e3a', // DrawDay Navy - Primary brand color
    secondary: '#e6b540', // DrawDay Gold - Brand accent
    accent: '#e6b540', // DrawDay Gold - Highlight
    background: isDark ? '#0c0e11' : '#fdfeff', // Night for dark, White for light
    foreground: isDark ? '#fdfeff' : '#161b21', // White text on dark, Rich Black on light
    card: isDark ? '#161b21' : '#fdfeff', // Rich Black for dark, White for light
    cardForeground: isDark ? '#fdfeff' : '#161b21', // White on dark, Rich Black on light
    winner: '#e6b540', // DrawDay Gold for winner highlight
    winnerGlow: '#e6b540', // DrawDay Gold glow
  };
})();

const DEFAULT_SPINNER_STYLE: SpinnerStyle = (() => {
  const isDark = getSystemColorScheme() === 'dark';

  return {
    type: 'slotMachine',
    nameSize: 'large',
    ticketSize: 'extra-large',
    nameColor: isDark ? '#fdfeff' : '#161b21', // White on dark, Rich Black on light
    ticketColor: '#e6b540', // DrawDay Gold - Ticket numbers
    backgroundColor: isDark ? '#161b21' : '#fdfeff', // Rich Black for dark, White for light
    canvasBackground: isDark ? '#0c0e11' : '#f4f4f5', // Night for dark, Light gray for light
    topShadowOpacity: 0.3, // Top shadow opacity
    bottomShadowOpacity: 0.3, // Bottom shadow opacity
    shadowSize: 30, // Shadow size as percentage
    shadowColor: undefined, // Use panel background by default
    borderColor: '#e6b540', // DrawDay Gold - Borders
    highlightColor: '#e6b540', // DrawDay Gold - Highlights
    fontFamily: 'system-ui',
  };
})();

const DEFAULT_BRANDING: BrandingSettings = {
  logoPosition: 'center',
  showCompanyName: true,
};

const DEFAULT_THEME: ThemeSettings = {
  colors: DEFAULT_COLORS,
  spinnerStyle: DEFAULT_SPINNER_STYLE,
  branding: DEFAULT_BRANDING,
};

interface ThemeContextType {
  theme: ThemeSettings;
  updateColors: (colors: Partial<ThemeColors>) => Promise<void>;
  updateSpinnerStyle: (style: Partial<SpinnerStyle>) => Promise<void>;
  updateBranding: (branding: Partial<BrandingSettings>) => Promise<void>;
  resetTheme: () => Promise<void>;
  applyCustomCSS: (css: string) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeSettings>(DEFAULT_THEME);

  useEffect(() => {
    loadTheme();

    // Listen for storage changes from other contexts (like options page)
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.data) {
        const newData = changes.data.newValue;
        if (newData?.theme) {
          setTheme(newData.theme);
        }
      }
    };

    // Listen for system color scheme changes
    const handleColorSchemeChange = () => {
      // If no custom theme is saved, update defaults based on system preference
      chrome.storage.local.get('data').then((result) => {
        if (!result.data?.theme) {
          // Reset to new defaults when system theme changes
          window.location.reload(); // Simple reload to apply new defaults
        }
      });
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

  const loadTheme = async () => {
    // Get the current theme from storage
    const result = await chrome.storage.local.get('data');
    const data = result.data || {};
    if (data.theme) {
      // Merge with defaults to ensure all properties exist
      const loadedTheme = {
        colors: { ...DEFAULT_COLORS, ...data.theme.colors },
        spinnerStyle: { ...DEFAULT_SPINNER_STYLE, ...data.theme.spinnerStyle },
        branding: { ...DEFAULT_BRANDING, ...data.theme.branding },
        customCSS: data.theme.customCSS,
      };
      setTheme(loadedTheme);
    }
  };

  const applyThemeToDOM = (theme: ThemeSettings) => {
    const root = document.documentElement;

    // Apply color variables
    root.style.setProperty('--theme-primary', theme.colors.primary);
    root.style.setProperty('--theme-secondary', theme.colors.secondary);
    root.style.setProperty('--theme-accent', theme.colors.accent);
    root.style.setProperty('--theme-background', theme.colors.background);
    root.style.setProperty('--theme-foreground', theme.colors.foreground);
    root.style.setProperty('--theme-card', theme.colors.card);
    root.style.setProperty('--theme-card-foreground', theme.colors.cardForeground);
    root.style.setProperty('--theme-winner', theme.colors.winner);
    root.style.setProperty('--theme-winner-glow', theme.colors.winnerGlow);

    // Apply spinner style variables
    root.style.setProperty('--spinner-name-color', theme.spinnerStyle.nameColor);
    root.style.setProperty('--spinner-ticket-color', theme.spinnerStyle.ticketColor);
    root.style.setProperty('--spinner-bg-color', theme.spinnerStyle.backgroundColor);
    root.style.setProperty('--spinner-border-color', theme.spinnerStyle.borderColor);
    root.style.setProperty('--spinner-highlight-color', theme.spinnerStyle.highlightColor);

    // Apply font sizes
    const nameSizes: Record<string, string> = {
      small: '14px',
      medium: '16px',
      large: '20px',
      'extra-large': '24px',
    };
    const ticketSizes: Record<string, string> = {
      small: '18px',
      medium: '24px',
      large: '32px',
      'extra-large': '40px',
    };

    root.style.setProperty('--spinner-name-size', nameSizes[theme.spinnerStyle.nameSize]);
    root.style.setProperty('--spinner-ticket-size', ticketSizes[theme.spinnerStyle.ticketSize]);

    if (theme.spinnerStyle.fontFamily) {
      root.style.setProperty('--spinner-font-family', theme.spinnerStyle.fontFamily);
    }

    // Apply custom CSS if provided
    if (theme.customCSS) {
      let styleElement = document.getElementById('custom-theme-styles');
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'custom-theme-styles';
        document.head.appendChild(styleElement);
      }
      styleElement.textContent = theme.customCSS;
    }
  };

  const updateColors = async (colors: Partial<ThemeColors>) => {
    const newTheme = {
      ...theme,
      colors: { ...theme.colors, ...colors },
    };
    setTheme(newTheme);

    const result = await chrome.storage.local.get('data');
    const data = result.data || {};
    await chrome.storage.local.set({
      data: { ...data, theme: newTheme },
    });
  };

  const updateSpinnerStyle = async (style: Partial<SpinnerStyle>) => {
    const newTheme = {
      ...theme,
      spinnerStyle: { ...theme.spinnerStyle, ...style },
    };
    setTheme(newTheme);

    const result = await chrome.storage.local.get('data');
    const data = result.data || {};
    await chrome.storage.local.set({
      data: { ...data, theme: newTheme },
    });
  };

  const updateBranding = async (branding: Partial<BrandingSettings>) => {
    const newTheme = {
      ...theme,
      branding: { ...theme.branding, ...branding },
    };
    setTheme(newTheme);

    const result = await chrome.storage.local.get('data');
    const data = result.data || {};
    await chrome.storage.local.set({
      data: { ...data, theme: newTheme },
    });
  };

  const resetTheme = async () => {
    setTheme(DEFAULT_THEME);

    const result = await chrome.storage.local.get('data');
    const data = result.data || {};
    await chrome.storage.local.set({
      data: { ...data, theme: DEFAULT_THEME },
    });
  };

  const applyCustomCSS = async (css: string) => {
    const newTheme = { ...theme, customCSS: css };
    setTheme(newTheme);

    const result = await chrome.storage.local.get('data');
    const data = result.data || {};
    await chrome.storage.local.set({
      data: { ...data, theme: newTheme },
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        updateColors,
        updateSpinnerStyle,
        updateBranding,
        resetTheme,
        applyCustomCSS,
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
