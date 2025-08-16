/**
 * Advanced Keyboard Shortcuts Hook Tests - Session and Input
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useKeyboardShortcuts } from '../useKeyboardShortcuts';
import type { KeyboardShortcutHandlers, KeyboardShortcutState } from '../useKeyboardShortcuts';

describe('useKeyboardShortcuts - Session and Input', () => {
  let handlers: KeyboardShortcutHandlers;
  let state: KeyboardShortcutState;

  beforeEach(() => {
    handlers = {
      onSpin: vi.fn(),
      onReset: vi.fn(),
      onRevealWinner: vi.fn(),
      onNewSession: vi.fn(),
      onExportWinners: vi.fn(),
      onClearWinners: vi.fn(),
      onOpenCompetitionSelector: vi.fn(),
      onOpenSettings: vi.fn(),
      onCloseModal: vi.fn(),
      onShowHelp: vi.fn(),
    };

    state = {
      isHelpVisible: false,
      canSpin: true,
      canRevealWinner: false,
      hasActiveModal: false,
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Session Management', () => {
    it('should handle N key for new session', () => {
      renderHook(() => useKeyboardShortcuts(handlers, state));

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'n' });
        document.dispatchEvent(event);
      });

      expect(handlers.onNewSession).toHaveBeenCalledTimes(1);
    });

    it('should handle E key for export winners', () => {
      renderHook(() => useKeyboardShortcuts(handlers, state));

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'e' });
        document.dispatchEvent(event);
      });

      expect(handlers.onExportWinners).toHaveBeenCalledTimes(1);
    });

    it('should handle Shift+C for clear winners', () => {
      renderHook(() => useKeyboardShortcuts(handlers, state));

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'c', shiftKey: true });
        document.dispatchEvent(event);
      });

      expect(handlers.onClearWinners).toHaveBeenCalledTimes(1);
    });
  });

  describe('Input Field Behavior', () => {
    it('should ignore shortcuts when typing in input field', () => {
      renderHook(() => useKeyboardShortcuts(handlers, state));

      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();

      act(() => {
        const event = new KeyboardEvent('keydown', { key: ' ' });
        Object.defineProperty(event, 'target', {
          value: input,
          enumerable: true,
        });
        document.dispatchEvent(event);
      });

      expect(handlers.onSpin).not.toHaveBeenCalled();

      document.body.removeChild(input);
    });

    it('should ignore shortcuts when typing in textarea', () => {
      renderHook(() => useKeyboardShortcuts(handlers, state));

      const textarea = document.createElement('textarea');
      document.body.appendChild(textarea);
      textarea.focus();

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'r' });
        Object.defineProperty(event, 'target', {
          value: textarea,
          enumerable: true,
        });
        document.dispatchEvent(event);
      });

      expect(handlers.onReset).not.toHaveBeenCalled();

      document.body.removeChild(textarea);
    });
  });
});
