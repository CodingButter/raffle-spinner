'use client';

import { useCallback } from 'react';

interface KeyboardHandlersProps {
  onReset: () => void;
  onNewSession: () => void;
  onExportWinners: () => void;
  onClearWinners: () => void;
  setIsHelpVisible: (visible: boolean) => void;
}

/**
 * useSpinnerKeyboardHandlers Hook
 * Creates keyboard shortcut handlers for the spinner interface
 * Extracted from SidePanel.tsx for modularity
 */
export function useSpinnerKeyboardHandlers({
  onReset,
  onNewSession,
  onExportWinners,
  onClearWinners,
  setIsHelpVisible,
}: KeyboardHandlersProps) {
  const handleSpin = useCallback(() => {
    const spinButton = document.querySelector('[data-spin-button]') as HTMLButtonElement;
    if (spinButton && !spinButton.disabled) {
      spinButton.click();
    }
  }, []);

  const handleOpenCompetitionSelector = useCallback(() => {
    const selector = document.querySelector('[data-competition-selector]') as HTMLButtonElement;
    if (selector) {
      selector.focus();
      selector.click();
    }
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsHelpVisible(false);
  }, [setIsHelpVisible]);

  const handleShowHelp = useCallback(() => {
    setIsHelpVisible(true);
  }, [setIsHelpVisible]);

  return {
    onSpin: handleSpin,
    onReset,
    onRevealWinner: () => {
      // Future enhancement: reveal winner without auto-clear
    },
    onNewSession,
    onExportWinners,
    onClearWinners,
    onOpenCompetitionSelector: handleOpenCompetitionSelector,
    onOpenSettings: () => {
      // Future enhancement: open settings modal
    },
    onCloseModal: handleCloseModal,
    onShowHelp: handleShowHelp,
  };
}
