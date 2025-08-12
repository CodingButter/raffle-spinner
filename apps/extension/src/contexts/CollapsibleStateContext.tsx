/**
 * Collapsible State Context
 *
 * Manages the collapsed/expanded state of sections in the options page
 * with persistence to chrome.storage.local
 */

import React, { createContext, useContext, useEffect, useState } from 'react';

interface CollapsibleState {
  competitions: boolean;
  settings: boolean;
  theme: boolean;
  branding: boolean;
  help: boolean;
}

interface CollapsibleStateContextType {
  collapsedSections: CollapsibleState;
  toggleSection: (section: keyof CollapsibleState) => void;
  setSectionCollapsed: (section: keyof CollapsibleState, collapsed: boolean) => void;
}

const CollapsibleStateContext = createContext<CollapsibleStateContextType | undefined>(undefined);

const STORAGE_KEY = 'collapsibleSections';

// Default state - all sections collapsed
const DEFAULT_STATE: CollapsibleState = {
  competitions: true,
  settings: true,
  theme: true,
  branding: true,
  help: true,
};

export function CollapsibleStateProvider({ children }: { children: React.ReactNode }) {
  const [collapsedSections, setCollapsedSections] = useState<CollapsibleState>(DEFAULT_STATE);

  // Load state from storage on mount
  useEffect(() => {
    const loadState = async () => {
      try {
        const result = await chrome.storage.local.get(STORAGE_KEY);
        const stored = result[STORAGE_KEY];
        if (stored && typeof stored === 'object') {
          setCollapsedSections({ ...DEFAULT_STATE, ...stored });
        }
      } catch (error) {
        console.error('Failed to load collapsible state:', error);
      }
    };
    loadState();
  }, []);

  // Save state to storage whenever it changes
  useEffect(() => {
    const saveState = async () => {
      try {
        await chrome.storage.local.set({ [STORAGE_KEY]: collapsedSections });
      } catch (error) {
        console.error('Failed to save collapsible state:', error);
      }
    };
    saveState();
  }, [collapsedSections]);

  const toggleSection = (section: keyof CollapsibleState) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const setSectionCollapsed = (section: keyof CollapsibleState, collapsed: boolean) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: collapsed,
    }));
  };

  return (
    <CollapsibleStateContext.Provider
      value={{ collapsedSections, toggleSection, setSectionCollapsed }}
    >
      {children}
    </CollapsibleStateContext.Provider>
  );
}

export function useCollapsibleState() {
  const context = useContext(CollapsibleStateContext);
  if (!context) {
    throw new Error('useCollapsibleState must be used within CollapsibleStateProvider');
  }
  return context;
}
