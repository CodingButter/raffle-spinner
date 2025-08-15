/**
 * Keyboard Shortcuts Hook
 *
 * Purpose: Custom hook to handle keyboard shortcuts in the spinner extension.
 * Provides event handling, state management, and action callbacks for shortcuts.
 *
 * SRS Reference:
 * - UX-3.1: Keyboard Navigation and Accessibility
 * - FR-2.1: Side Panel Interface Enhancement
 */

import { useEffect, useCallback, useState } from 'react';
import { KEYBOARD_SHORTCUTS } from '@/constants/keyboard-shortcuts';

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
  isHelpVisible: boolean;
  canSpin: boolean;
  canRevealWinner: boolean;
  hasActiveModal: boolean;
}

export function useKeyboardShortcuts(
  handlers: KeyboardShortcutHandlers,
  state: KeyboardShortcutState
) {
  const [isEnabled, setIsEnabled] = useState(true);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't handle shortcuts if disabled or if typing in input field
      if (!isEnabled || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Prevent default behavior for handled shortcuts
      const shortcut = KEYBOARD_SHORTCUTS.find(s => 
        s.key === event.key && !s.disabled &&
        (!s.modifiers || s.modifiers.every(mod => {
          switch (mod) {
            case 'ctrl': return event.ctrlKey;
            case 'shift': return event.shiftKey;
            case 'alt': return event.altKey;
            case 'meta': return event.metaKey;
            default: return false;
          }
        }))
      );

      if (!shortcut) return;

      // Handle escape key specially - always allow closing modals
      if (shortcut.action === 'close-modal' && state.hasActiveModal) {
        event.preventDefault();
        handlers.onCloseModal?.();
        return;
      }

      // Don't handle other shortcuts if modal is open
      if (state.hasActiveModal && shortcut.action !== 'close-modal') {
        return;
      }

      event.preventDefault();

      // Route to appropriate handler based on action
      switch (shortcut.action) {
        case 'spin':
          if (state.canSpin) {
            handlers.onSpin?.();
          }
          break;
        case 'reset':
          handlers.onReset?.();
          break;
        case 'reveal-winner':
          if (state.canRevealWinner) {
            handlers.onRevealWinner?.();
          }
          break;
        case 'new-session':
          handlers.onNewSession?.();
          break;
        case 'export-winners':
          handlers.onExportWinners?.();
          break;
        case 'clear-winners':
          handlers.onClearWinners?.();
          break;
        case 'competition-selector':
          handlers.onOpenCompetitionSelector?.();
          break;
        case 'settings':
          handlers.onOpenSettings?.();
          break;
        case 'help':
          handlers.onShowHelp?.();
          break;
        case 'navigate-up':
          handlers.onNavigateUp?.();
          break;
        case 'navigate-down':
          handlers.onNavigateDown?.();
          break;
      }
    },
    [handlers, state, isEnabled]
  );

  useEffect(() => {
    if (isEnabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [handleKeyDown, isEnabled]);

  return {
    isEnabled,
    setIsEnabled,
    handleKeyDown,
  };
}