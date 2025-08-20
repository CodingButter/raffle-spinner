/**
 * Theme Context for Website Extension Pages
 *
 * Manages theme and branding settings using localStorage
 */

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '@/lib/storage/localStorage';

interface SpinnerStyle {
  nameColor: string;
  ticketColor: string;
  backgroundColor: string;
  borderColor: string;
  highlightColor: string;
  nameSize: number;
  ticketSize: number;
  fontFamily: string;
  topShadowOpacity: number;
  bottomShadowOpacity: number;
  shadowSize: number;
  shadowColor: string;
}

interface Branding {
  companyName?: string;
  showCompanyName?: boolean;
  logoImage?: string;
  bannerImage?: string;
  logoPosition?: 'left' | 'center' | 'right';
}

interface Theme {
  spinnerStyle: SpinnerStyle;
  branding?: Branding;
}

const defaultTheme: Theme = {
  spinnerStyle: {
    nameColor: '#000000',
    ticketColor: '#666666',
    backgroundColor: '#ffffff',
    borderColor: '#e0e0e0',
    highlightColor: '#4CAF50',
    nameSize: 16,
    ticketSize: 14,
    fontFamily: 'Arial, sans-serif',
    topShadowOpacity: 0.3,
    bottomShadowOpacity: 0.3,
    shadowSize: 0.2,
    shadowColor: '#000000',
  },
};

interface ThemeContextType {
  theme: Theme;
  updateTheme: (updates: Partial<Theme>) => Promise<void>;
  updateSpinnerStyle: (updates: Partial<SpinnerStyle>) => Promise<void>;
  updateBranding: (updates: Partial<Branding>) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  useEffect(() => {
    const loadTheme = async () => {
      const storedTheme = await storage.get<Theme>('theme');
      if (storedTheme) {
        setTheme(storedTheme);
      }
    };

    loadTheme();
  }, []);

  const updateTheme = async (updates: Partial<Theme>) => {
    const newTheme = { ...theme, ...updates };
    setTheme(newTheme);
    await storage.set('theme', newTheme);
  };

  const updateSpinnerStyle = async (updates: Partial<SpinnerStyle>) => {
    const newTheme = {
      ...theme,
      spinnerStyle: { ...theme.spinnerStyle, ...updates },
    };
    setTheme(newTheme);
    await storage.set('theme', newTheme);
  };

  const updateBranding = async (updates: Partial<Branding>) => {
    const newTheme = {
      ...theme,
      branding: { ...theme.branding, ...updates },
    };
    setTheme(newTheme);
    await storage.set('theme', newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        updateTheme,
        updateSpinnerStyle,
        updateBranding,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
