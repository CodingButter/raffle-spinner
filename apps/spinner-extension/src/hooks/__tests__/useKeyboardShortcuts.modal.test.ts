/**
 * Keyboard Shortcuts Modal and State Tests
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useKeyboardShortcuts } from '../useKeyboardShortcuts';
import type { KeyboardShortcutHandlers, KeyboardShortcutState } from '../useKeyboardShortcuts';

describe('useKeyboardShortcuts - Modal and State', () => {
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

  it('should block non-escape shortcuts when modal is active', () => {
    state.hasActiveModal = true;
    renderHook(() => useKeyboardShortcuts(handlers, state));

    act(() => {
      const event = new KeyboardEvent('keydown', { key: ' ' });
      document.dispatchEvent(event);
    });

    expect(handlers.onSpin).not.toHaveBeenCalled();
  });

  it('should allow Escape key even when modal is active', () => {
    state.hasActiveModal = true;
    renderHook(() => useKeyboardShortcuts(handlers, state));

    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);
    });

    expect(handlers.onCloseModal).toHaveBeenCalledTimes(1);
  });

  it('should disable shortcuts when setIsEnabled(false)', () => {
    const { result } = renderHook(() => useKeyboardShortcuts(handlers, state));

    act(() => {
      result.current.setIsEnabled(false);
    });

    act(() => {
      const event = new KeyboardEvent('keydown', { key: ' ' });
      document.dispatchEvent(event);
    });

    expect(handlers.onSpin).not.toHaveBeenCalled();
  });

  it('should re-enable shortcuts when setIsEnabled(true)', () => {
    const { result } = renderHook(() => useKeyboardShortcuts(handlers, state));

    act(() => {
      result.current.setIsEnabled(false);
    });

    act(() => {
      result.current.setIsEnabled(true);
    });

    act(() => {
      const event = new KeyboardEvent('keydown', { key: ' ' });
      document.dispatchEvent(event);
    });

    expect(handlers.onSpin).toHaveBeenCalledTimes(1);
  });
});
