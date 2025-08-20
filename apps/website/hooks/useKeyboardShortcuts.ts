'use client';

/**
 * Keyboard Shortcuts Hook (Website Integration)
 *
 * Purpose: Minimal keyboard shortcuts implementation for website integration.
 * Stub implementation to allow components to compile.
 */

import { useEffect } from 'react';

export interface KeyboardShortcutHandlers {
  onSpin?: () => void;
  onReset?: () => void;
  onRevealWinner?: () => void;
  onNewSession?: () => void;
  onExportWinners?: () => void;
  onClearWinners?: () => void;
  onOpenCompetitionSelector?: () => void;
  onOpenSettings?: () => void;
  onCloseModal?: () => void;
  onShowHelp?: () => void;
  onNavigateUp?: () => void;
  onNavigateDown?: () => void;
}

export interface KeyboardShortcutState {
  isHelpVisible?: boolean;
  canSpin?: boolean;
  canRevealWinner?: boolean;
  hasActiveModal?: boolean;
}

export function useKeyboardShortcuts(
  handlers: KeyboardShortcutHandlers,
  state: KeyboardShortcutState
) {
  // Minimal implementation for website - keyboard shortcuts not needed for demo
  useEffect(() => {
    // Stub implementation - could be enhanced later
  }, [handlers, state]);
}
