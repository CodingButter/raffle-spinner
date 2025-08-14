/**
 * Competition Context
 *
 * Purpose: React context for managing competition data including loading, selection,
 * creation, and deletion of competitions with error handling and loading states.
 *
 * SRS Reference:
 * - FR-1.6: Competition Management
 * - FR-2.1: Side Panel Interface (competition selection)
 * - Data Layer: Competition data persistence and retrieval
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Competition } from '@raffle-spinner/storage';
import { storage } from '@raffle-spinner/storage';

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
      const comps = await storage.getCompetitions();
      setCompetitions(comps);
    } catch (err) {
      setError('Failed to load competitions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectCompetition = (id: string) => {
    const comp = competitions.find((c) => c.id === id);
    setSelectedCompetition(comp || null);
  };

  const addCompetition = async (competition: Competition) => {
    await storage.saveCompetition(competition);
    await loadCompetitions();
  };

  const deleteCompetition = async (id: string) => {
    await storage.deleteCompetition(id);
    if (selectedCompetition?.id === id) {
      setSelectedCompetition(null);
    }
    await loadCompetitions();
  };

  const updateCompetitionBanner = async (id: string, banner: string | undefined) => {
    const competition = competitions.find((c) => c.id === id);
    if (!competition) return;

    const updatedCompetition = {
      ...competition,
      bannerImage: banner,
      updatedAt: Date.now(),
    };

    await storage.saveCompetition(updatedCompetition);
    await loadCompetitions();

    // Update selected competition if it's the one being modified
    if (selectedCompetition?.id === id) {
      setSelectedCompetition(updatedCompetition);
    }
  };

  useEffect(() => {
    loadCompetitions();

    // Listen for storage changes from other contexts (like options page)
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.data) {
        const newData = changes.data.newValue;
        if (newData?.competitions) {
          setCompetitions(newData.competitions);
          // Update selected competition if it still exists
          if (selectedCompetition) {
            const updatedComp = newData.competitions.find(
              (c: Competition) => c.id === selectedCompetition.id
            );
            setSelectedCompetition(updatedComp || null);
          }
        }
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, [selectedCompetition]);

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
