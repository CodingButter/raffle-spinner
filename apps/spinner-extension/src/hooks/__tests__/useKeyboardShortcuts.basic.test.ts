/**
 * Basic Keyboard Shortcuts Hook Tests
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useKeyboardShortcuts } from '../useKeyboardShortcuts';
import type { KeyboardShortcutHandlers, KeyboardShortcutState } from '../useKeyboardShortcuts';

describe('useKeyboardShortcuts - Basic Shortcuts', () => {
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

  it('should handle Space key for spinning', () => {
    renderHook(() => useKeyboardShortcuts(handlers, state));

    act(() => {
      const event = new KeyboardEvent('keydown', { key: ' ' });
      document.dispatchEvent(event);
    });

    expect(handlers.onSpin).toHaveBeenCalledTimes(1);
  });

  it('should handle Enter key for spinning', () => {
    renderHook(() => useKeyboardShortcuts(handlers, state));

    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      document.dispatchEvent(event);
    });

    expect(handlers.onSpin).toHaveBeenCalledTimes(1);
  });

  it('should not spin when canSpin is false', () => {
    state.canSpin = false;
    renderHook(() => useKeyboardShortcuts(handlers, state));

    act(() => {
      const event = new KeyboardEvent('keydown', { key: ' ' });
      document.dispatchEvent(event);
    });

    expect(handlers.onSpin).not.toHaveBeenCalled();
  });

  it('should handle R key for reset', () => {
    renderHook(() => useKeyboardShortcuts(handlers, state));

    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'r' });
      document.dispatchEvent(event);
    });

    expect(handlers.onReset).toHaveBeenCalledTimes(1);
  });

  it('should handle W key for revealing winner when allowed', () => {
    state.canRevealWinner = true;
    renderHook(() => useKeyboardShortcuts(handlers, state));

    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'w' });
      document.dispatchEvent(event);
    });

    expect(handlers.onRevealWinner).toHaveBeenCalledTimes(1);
  });

  it('should not reveal winner when canRevealWinner is false', () => {
    state.canRevealWinner = false;
    renderHook(() => useKeyboardShortcuts(handlers, state));

    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'w' });
      document.dispatchEvent(event);
    });

    expect(handlers.onRevealWinner).not.toHaveBeenCalled();
  });
});
