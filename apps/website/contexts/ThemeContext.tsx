'use client';

/**
 * Theme Context (Website Integration)
 *
 * Purpose: Browser localStorage-based theme management for website integration.
 * Provides spinner theming and branding options with localStorage persistence.
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  logoImage?: string;
  bannerImage?: string;
  companyName?: string;
  logoPosition: 'left' | 'center' | 'right';
  showCompanyName: boolean;
}

interface Theme {
  spinnerStyle: SpinnerStyle;
  branding: Branding;
}

interface ThemeContextType {
  theme: Theme;
  loading: boolean;
  error: string | null;
  updateTheme: (newTheme: Partial<Theme>) => Promise<void>;
  updateSpinnerStyle: (style: Partial<SpinnerStyle>) => Promise<void>;
  updateBranding: (branding: Partial<Branding>) => Promise<void>;
  loadTheme: () => Promise<void>;
}

const defaultTheme: Theme = {
  spinnerStyle: {
    nameColor: '#ffffff',
    ticketColor: '#cccccc',
    backgroundColor: '#1a1a2e',
    borderColor: '#16213e',
    highlightColor: '#e94560',
    nameSize: 16,
    ticketSize: 12,
    fontFamily: 'Arial, sans-serif',
    topShadowOpacity: 0.8,
    bottomShadowOpacity: 0.4,
    shadowSize: 10,
    shadowColor: '#000000',
  },
  branding: {
    logoPosition: 'center',
    showCompanyName: true,
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTheme = async () => {
    setLoading(true);
    setError(null);
    try {
      const stored = localStorage.getItem('raffleSpinnerTheme');
      if (stored) {
        const parsedTheme = JSON.parse(stored);
        setTheme({
          spinnerStyle: { ...defaultTheme.spinnerStyle, ...parsedTheme.spinnerStyle },
          branding: { ...defaultTheme.branding, ...parsedTheme.branding },
        });
      }
    } catch (err) {
      setError('Failed to load theme');
      console.error('Theme loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveTheme = async (newTheme: Theme) => {
    try {
      localStorage.setItem('raffleSpinnerTheme', JSON.stringify(newTheme));

      // Dispatch event for cross-tab sync
      window.dispatchEvent(new CustomEvent('raffleThemeUpdate', { detail: newTheme }));
    } catch (err) {
      setError('Failed to save theme');
      console.error('Theme save error:', err);
    }
  };

  const updateTheme = async (newTheme: Partial<Theme>) => {
    setError(null);
    const updated = {
      ...theme,
      ...newTheme,
      spinnerStyle: { ...theme.spinnerStyle, ...newTheme.spinnerStyle },
      branding: { ...theme.branding, ...newTheme.branding },
    };
    setTheme(updated);
    await saveTheme(updated);
  };

  const updateSpinnerStyle = async (style: Partial<SpinnerStyle>) => {
    const updated = {
      ...theme,
      spinnerStyle: { ...theme.spinnerStyle, ...style },
    };
    setTheme(updated);
    await saveTheme(updated);
  };

  const updateBranding = async (branding: Partial<Branding>) => {
    const updated = {
      ...theme,
      branding: { ...theme.branding, ...branding },
    };
    setTheme(updated);
    await saveTheme(updated);
  };

  useEffect(() => {
    loadTheme();

    // Listen for theme updates from other tabs
    const handleThemeUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<Theme>;
      if (customEvent.detail) {
        setTheme(customEvent.detail);
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'raffleSpinnerTheme' && e.newValue) {
        try {
          const parsedTheme = JSON.parse(e.newValue);
          setTheme({
            spinnerStyle: { ...defaultTheme.spinnerStyle, ...parsedTheme.spinnerStyle },
            branding: { ...defaultTheme.branding, ...parsedTheme.branding },
          });
        } catch (err) {
          console.error('Error parsing theme update:', err);
        }
      }
    };

    window.addEventListener('raffleThemeUpdate', handleThemeUpdate);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('raffleThemeUpdate', handleThemeUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        loading,
        error,
        updateTheme,
        updateSpinnerStyle,
        updateBranding,
        loadTheme,
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
