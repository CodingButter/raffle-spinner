/**
 * Competition Context for Website Extension Pages
 *
 * Manages competition data using localStorage instead of chrome.storage
 * Provides same API as Chrome extension version for compatibility
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Competition } from '@raffle-spinner/storage';
import { storage } from '@/lib/storage/localStorage';

interface CompetitionContextType {
  competitions: Competition[];
  selectedCompetition: Competition | null;
  loading: boolean;
  addCompetition: (competition: Competition) => Promise<void>;
  updateCompetition: (id: string, updates: Partial<Competition>) => Promise<void>;
  deleteCompetition: (id: string) => Promise<void>;
  selectCompetition: (id: string) => Promise<void>;
  updateCompetitionBanner: (id: string, bannerImage: string) => Promise<void>;
}

const CompetitionContext = createContext<CompetitionContextType | undefined>(undefined);

export function CompetitionProvider({ children }: { children: React.ReactNode }) {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const [loading, setLoading] = useState(true);

  // Load competitions from localStorage on mount
  useEffect(() => {
    const loadCompetitions = async () => {
      try {
        const stored = await storage.get<{
          competitions: Competition[];
          selectedId: string | null;
        }>('competitions');

        if (stored) {
          setCompetitions(stored.competitions || []);
          if (stored.selectedId) {
            const selected = stored.competitions?.find((c) => c.id === stored.selectedId);
            setSelectedCompetition(selected || null);
          }
        }
      } catch (error) {
        console.error('Error loading competitions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCompetitions();
  }, []);

  // Save to localStorage whenever competitions change
  const saveCompetitions = useCallback(
    async (newCompetitions: Competition[], selectedId: string | null) => {
      await storage.set('competitions', {
        competitions: newCompetitions,
        selectedId,
      });
    },
    []
  );

  const addCompetition = useCallback(
    async (competition: Competition) => {
      const newCompetitions = [...competitions, competition];
      setCompetitions(newCompetitions);
      await saveCompetitions(newCompetitions, selectedCompetition?.id || null);
    },
    [competitions, selectedCompetition, saveCompetitions]
  );

  const updateCompetition = useCallback(
    async (id: string, updates: Partial<Competition>) => {
      const newCompetitions = competitions.map((c) => (c.id === id ? { ...c, ...updates } : c));
      setCompetitions(newCompetitions);

      if (selectedCompetition?.id === id) {
        setSelectedCompetition({ ...selectedCompetition, ...updates });
      }

      await saveCompetitions(newCompetitions, selectedCompetition?.id || null);
    },
    [competitions, selectedCompetition, saveCompetitions]
  );

  const deleteCompetition = useCallback(
    async (id: string) => {
      const newCompetitions = competitions.filter((c) => c.id !== id);
      setCompetitions(newCompetitions);

      if (selectedCompetition?.id === id) {
        setSelectedCompetition(null);
      }

      await saveCompetitions(
        newCompetitions,
        selectedCompetition?.id === id ? null : selectedCompetition?.id || null
      );
    },
    [competitions, selectedCompetition, saveCompetitions]
  );

  const selectCompetition = useCallback(
    async (id: string) => {
      const competition = competitions.find((c) => c.id === id);
      setSelectedCompetition(competition || null);
      await saveCompetitions(competitions, id);
    },
    [competitions, saveCompetitions]
  );

  const updateCompetitionBanner = useCallback(
    async (id: string, bannerImage: string) => {
      await updateCompetition(id, { bannerImage });
    },
    [updateCompetition]
  );

  return (
    <CompetitionContext.Provider
      value={{
        competitions,
        selectedCompetition,
        loading,
        addCompetition,
        updateCompetition,
        deleteCompetition,
        selectCompetition,
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
