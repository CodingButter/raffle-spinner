'use client';

/**
 * Settings Context (Website Integration)
 *
 * Purpose: Browser localStorage-based settings management for website integration.
 * Compatible with extension settings but uses localStorage instead of chrome.storage.
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SpinnerSettings {
  minSpinDuration: number;
  decelerationRate: 'slow' | 'medium' | 'fast';
  // Add other settings as needed
}

interface SettingsContextType {
  settings: SpinnerSettings;
  loading: boolean;
  error: string | null;
  updateSettings: (newSettings: Partial<SpinnerSettings>) => Promise<void>;
  loadSettings: () => Promise<void>;
}

const defaultSettings: SpinnerSettings = {
  minSpinDuration: 3,
  decelerationRate: 'medium',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SpinnerSettings>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const stored = localStorage.getItem('raffleSpinnerSettings');
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        setSettings({ ...defaultSettings, ...parsedSettings });
      }
    } catch (err) {
      setError('Failed to load settings');
      console.error('Settings loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<SpinnerSettings>) => {
    setError(null);
    try {
      const updated = { ...settings, ...newSettings };
      setSettings(updated);
      localStorage.setItem('raffleSpinnerSettings', JSON.stringify(updated));

      // Dispatch event for cross-tab sync
      window.dispatchEvent(new CustomEvent('raffleSettingsUpdate', { detail: updated }));
    } catch (err) {
      setError('Failed to save settings');
      console.error('Settings save error:', err);
    }
  };

  useEffect(() => {
    loadSettings();

    // Listen for settings updates from other tabs
    const handleSettingsUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<SpinnerSettings>;
      if (customEvent.detail) {
        setSettings(customEvent.detail);
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'raffleSpinnerSettings' && e.newValue) {
        try {
          const parsedSettings = JSON.parse(e.newValue);
          setSettings({ ...defaultSettings, ...parsedSettings });
        } catch (err) {
          console.error('Error parsing settings update:', err);
        }
      }
    };

    window.addEventListener('raffleSettingsUpdate', handleSettingsUpdate);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('raffleSettingsUpdate', handleSettingsUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        error,
        updateSettings,
        loadSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
