'use client';

/**
 * Competition Context (Website Integration)
 *
 * Purpose: Browser localStorage-based competition management for website integration.
 * Provides the same interface as the extension context but uses localStorage instead
 * of chrome.storage for seamless compatibility.
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Competition, Participant } from '@raffle-spinner/storage';

interface CompetitionContextType {
  competitions: Competition[];
  selectedCompetition: Competition | null;
  loading: boolean;
  error: string | null;
  loadCompetitions: () => Promise<void>;
  selectCompetition: (id: string) => void;
  addCompetition: (competition: Competition) => Promise<void>;
  deleteCompetition: (id: string) => Promise<void>;
  updateCompetitionBanner: (id: string, banner: string | undefined) => Promise<void>;
}

interface LocalStorageData {
  competitions: Competition[];
  settings: any;
  selectedCompetitionId: string | null;
}

const CompetitionContext = createContext<CompetitionContextType | undefined>(undefined);

export function CompetitionProvider({ children }: { children: ReactNode }) {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCompetitions = async () => {
    setLoading(true);
    setError(null);
    try {
      const stored = localStorage.getItem('raffleSpinnerData');
      if (stored) {
        const data: LocalStorageData = JSON.parse(stored);
        setCompetitions(data.competitions || []);

        // Restore selected competition if available
        if (data.selectedCompetitionId) {
          const selected = data.competitions.find((c) => c.id === data.selectedCompetitionId);
          setSelectedCompetition(selected || null);
        }
      }
    } catch (err) {
      setError('Failed to load competitions');
      console.error('Competition loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveToStorage = (comps: Competition[], selectedId?: string) => {
    try {
      const data: LocalStorageData = {
        competitions: comps,
        settings: {},
        selectedCompetitionId: selectedId || selectedCompetition?.id || null,
      };
      localStorage.setItem('raffleSpinnerData', JSON.stringify(data));

      // Dispatch storage event for cross-tab communication
      window.dispatchEvent(new CustomEvent('raffleDataUpdate', { detail: data }));
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
      setError('Failed to save competition data');
    }
  };

  const selectCompetition = (id: string) => {
    const comp = competitions.find((c) => c.id === id);
    setSelectedCompetition(comp || null);
    saveToStorage(competitions, id);
  };

  const addCompetition = async (competition: Competition) => {
    const updated = [...competitions, competition];
    setCompetitions(updated);
    saveToStorage(updated);
  };

  const deleteCompetition = async (id: string) => {
    const updated = competitions.filter((c) => c.id !== id);
    setCompetitions(updated);

    if (selectedCompetition?.id === id) {
      setSelectedCompetition(null);
    }

    saveToStorage(updated, selectedCompetition?.id === id ? null : selectedCompetition?.id);
  };

  const updateCompetitionBanner = async (id: string, banner: string | undefined) => {
    const competition = competitions.find((c) => c.id === id);
    if (!competition) return;

    const updatedCompetition = {
      ...competition,
      bannerImage: banner,
      updatedAt: Date.now(),
    };

    const updated = competitions.map((c) => (c.id === id ? updatedCompetition : c));
    setCompetitions(updated);
    saveToStorage(updated);

    // Update selected competition if it's the one being modified
    if (selectedCompetition?.id === id) {
      setSelectedCompetition(updatedCompetition);
    }
  };

  useEffect(() => {
    loadCompetitions();

    // Listen for storage events (cross-tab sync)
    const handleStorageUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<LocalStorageData>;
      if (customEvent.detail) {
        setCompetitions(customEvent.detail.competitions || []);

        // Update selected competition
        if (customEvent.detail.selectedCompetitionId) {
          const selected = customEvent.detail.competitions.find(
            (c) => c.id === customEvent.detail.selectedCompetitionId
          );
          setSelectedCompetition(selected || null);
        }
      }
    };

    // Listen for storage changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'raffleSpinnerData' && e.newValue) {
        try {
          const data: LocalStorageData = JSON.parse(e.newValue);
          setCompetitions(data.competitions || []);

          if (data.selectedCompetitionId) {
            const selected = data.competitions.find((c) => c.id === data.selectedCompetitionId);
            setSelectedCompetition(selected || null);
          }
        } catch (err) {
          console.error('Error parsing storage update:', err);
        }
      }
    };

    window.addEventListener('raffleDataUpdate', handleStorageUpdate);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('raffleDataUpdate', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <CompetitionContext.Provider
      value={{
        competitions,
        selectedCompetition,
        loading,
        error,
        loadCompetitions,
        selectCompetition,
        addCompetition,
        deleteCompetition,
        updateCompetitionBanner,
      }}
    >
      {children}
    </CompetitionContext.Provider>
  );
}

export function useCompetitions() {
  const context = useContext(CompetitionContext);
  if (!context) {
    throw new Error('useCompetitions must be used within CompetitionProvider');
  }
  return context;
}
