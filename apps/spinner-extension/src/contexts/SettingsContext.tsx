/**
 * Settings Context
 *
 * Purpose: React context for managing global application settings including
 * spinner physics configuration and CSV column mapping preferences with persistence.
 *
 * SRS Reference:
 * - FR-1.7: Spinner Physics Configuration
 * - FR-1.4: Column Mapping Interface (persistent mapping)
 * - Data Layer: Settings persistence and management
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SpinnerSettings, ColumnMapping } from '@raffle-spinner/storage';
import { storage } from '@raffle-spinner/storage';

interface SettingsContextType {
  settings: SpinnerSettings;
  columnMapping: ColumnMapping | null;
  updateSettings: (settings: Partial<SpinnerSettings>) => Promise<void>;
  updateColumnMapping: (mapping: ColumnMapping) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SpinnerSettings>({
    minSpinDuration: 3,
    decelerationRate: 'medium',
  });
  const [columnMapping, setColumnMapping] = useState<ColumnMapping | null>(null);

  useEffect(() => {
    loadSettings();

    // Listen for storage changes from other contexts (like options page)
    // Only set up chrome.storage listener if in extension context
    const isExtensionContext =
      typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged;

    if (isExtensionContext) {
      const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
        if (changes.data) {
          const newData = changes.data.newValue;
          if (newData?.settings) {
            setSettings(newData.settings);
          }
          if (newData?.columnMapping !== undefined) {
            setColumnMapping(newData.columnMapping);
          }
        }
      };

      chrome.storage.onChanged.addListener(handleStorageChange);

      return () => {
        chrome.storage.onChanged.removeListener(handleStorageChange);
      };
    } else {
      // In development, use localStorage event listener
      const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'spinnerData') {
          loadSettings(); // Reload settings when localStorage changes
        }
      };

      window.addEventListener('storage', handleStorageChange);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, []);

  const loadSettings = async () => {
    const [loadedSettings, loadedMapping] = await Promise.all([
      storage.getSettings(),
      storage.getColumnMapping(),
    ]);
    setSettings(loadedSettings);
    setColumnMapping(loadedMapping);
  };

  const updateSettings = async (newSettings: Partial<SpinnerSettings>) => {
    const updated = { ...settings, ...newSettings };
    await storage.saveSettings(updated);
    setSettings(updated);
  };

  const updateColumnMapping = async (mapping: ColumnMapping) => {
    await storage.saveColumnMapping(mapping);
    setColumnMapping(mapping);
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        columnMapping,
        updateSettings,
        updateColumnMapping,
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
