/**
 * Settings Context for Website Extension Pages
 *
 * Manages spinner settings using localStorage
 */

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Settings, ColumnMapping } from '@raffle-spinner/storage';
import { storage } from '@/lib/storage/localStorage';

interface SettingsContextType {
  settings: Settings;
  columnMapping: ColumnMapping | null;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
  updateColumnMapping: (mapping: ColumnMapping) => Promise<void>;
}

const defaultSettings: Settings = {
  minSpinDuration: 3,
  decelerationRate: 0.99,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      const storedSettings = await storage.get<Settings>('settings');
      const storedMapping = await storage.get<ColumnMapping>('columnMapping');

      if (storedSettings) {
        setSettings(storedSettings);
      }
      if (storedMapping) {
        setColumnMapping(storedMapping);
      }
    };

    loadSettings();
  }, []);

  const updateSettings = async (updates: Partial<Settings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    await storage.set('settings', newSettings);
  };

  const updateColumnMapping = async (mapping: ColumnMapping) => {
    setColumnMapping(mapping);
    await storage.set('columnMapping', mapping);
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
