/**
 * Custom hook for OptionsPage handlers
 * Extracted to reduce OptionsPage.tsx file size and improve separation of concerns
 */

import { useState } from 'react';
import { useAuth } from '@drawday/auth';
import { createDashboardUrl, createUpgradeUrl, openInNewTab } from '@drawday/utils';
import { Competition } from '@raffle-spinner/storage';

export function useOptionsPageHandlers(deleteCompetition: (id: string) => Promise<void>) {
  const { tokens, logout } = useAuth();
  const [competitionToDelete, setCompetitionToDelete] = useState<Competition | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // URL handlers
  const handleDashboardClick = () => {
    if (tokens?.access_token) {
      openInNewTab(createDashboardUrl(tokens.access_token));
    }
  };

  const handleUpgradeClick = () => {
    if (tokens?.access_token) {
      openInNewTab(createUpgradeUrl(tokens.access_token));
    }
  };

  // Delete handlers
  const handleDeleteClick = (competitions: Competition[]) => (id: string) => {
    const competition = competitions.find((c) => c.id === id);
    if (competition) {
      setCompetitionToDelete(competition);
      setShowDeleteDialog(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (competitionToDelete) {
      await deleteCompetition(competitionToDelete.id);
      setCompetitionToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  const handleDeleteCancel = () => {
    setCompetitionToDelete(null);
    setShowDeleteDialog(false);
  };

  return {
    // URL handlers
    handleDashboardClick,
    handleUpgradeClick,
    logout,
    
    // Delete handlers
    competitionToDelete,
    showDeleteDialog,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
  };
}