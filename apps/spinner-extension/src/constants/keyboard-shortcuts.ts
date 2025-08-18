/**
 * Keyboard Shortcuts Constants
 *
 * Purpose: Define all keyboard shortcuts for the spinner extension side panel.
 * These shortcuts provide quick access to common actions during live draws.
 *
 * SRS Reference:
 * - UX-3.1: Keyboard Navigation and Accessibility
 * - FR-2.1: Side Panel Interface Enhancement
 */

export interface KeyboardShortcut {
  key: string;
  action: string;
  description: string;
  category: 'spinner' | 'navigation' | 'session' | 'system';
  modifiers?: ('ctrl' | 'shift' | 'alt' | 'meta')[];
  disabled?: boolean;
}

export const KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  // Spinner Actions
  {
    key: ' ',
    action: 'spin',
    description: 'Start/Stop spinning',
    category: 'spinner',
  },
  {
    key: 'Enter',
    action: 'spin',
    description: 'Start/Stop spinning',
    category: 'spinner',
  },
  {
    key: 'r',
    action: 'reset',
    description: 'Reset the spinner',
    category: 'spinner',
  },
  {
    key: 'w',
    action: 'reveal-winner',
    description: 'Reveal winner (when spin complete)',
    category: 'spinner',
  },

  // Session Actions
  {
    key: 'n',
    action: 'new-session',
    description: 'Start new session',
    category: 'session',
  },
  {
    key: 'e',
    action: 'export-winners',
    description: 'Export session winners',
    category: 'session',
  },
  {
    key: 'c',
    action: 'clear-winners',
    description: 'Clear all session winners',
    category: 'session',
    modifiers: ['shift'],
  },
  {
    key: 'c',
    action: 'competition-selector',
    description: 'Open competition selector',
    category: 'navigation',
  },
  {
    key: 's',
    action: 'settings',
    description: 'Open settings',
    category: 'navigation',
  },

  // System Actions
  {
    key: 'Escape',
    action: 'close-modal',
    description: 'Close modals/dialogs',
    category: 'system',
  },
  {
    key: '?',
    action: 'help',
    description: 'Show keyboard shortcuts help',
    category: 'system',
  },
  {
    key: 'h',
    action: 'help',
    description: 'Show keyboard shortcuts help',
    category: 'system',
  },

  // Arrow Navigation (for future enhancement)
  {
    key: 'ArrowUp',
    action: 'navigate-up',
    description: 'Navigate up in UI',
    category: 'navigation',
    disabled: true,
  },
  {
    key: 'ArrowDown',
    action: 'navigate-down',
    description: 'Navigate down in UI',
    category: 'navigation',
    disabled: true,
  },
];

export const SHORTCUT_CATEGORIES = {
  spinner: 'Spinner Controls',
  navigation: 'Navigation',
  session: 'Session Management',
  system: 'System',
} as const;

/**
 * Get shortcuts by category for display purposes
 */
export function getShortcutsByCategory() {
  const categories: Record<string, KeyboardShortcut[]> = {};

  KEYBOARD_SHORTCUTS.filter((s) => !s.disabled).forEach((shortcut) => {
    if (!categories[shortcut.category]) {
      categories[shortcut.category] = [];
    }
    categories[shortcut.category].push(shortcut);
  });

  return categories;
}

/**
 * Format key for display (handle special keys)
 */
export function formatKeyForDisplay(
  key: string,
  modifiers?: ('ctrl' | 'shift' | 'alt' | 'meta')[]
): string {
  const keyMap: Record<string, string> = {
    ' ': 'Space',
    Enter: 'Enter',
    Escape: 'Esc',
    ArrowUp: '↑',
    ArrowDown: '↓',
    ArrowLeft: '←',
    ArrowRight: '→',
    '?': '?',
  };

  const formattedKey = keyMap[key] || key.toUpperCase();

  if (!modifiers || modifiers.length === 0) {
    return formattedKey;
  }

  const modifierSymbols = modifiers
    .map((mod) => {
      switch (mod) {
        case 'ctrl':
          return 'Ctrl';
        case 'shift':
          return '⇧';
        case 'alt':
          return 'Alt';
        case 'meta':
          return '⌘';
        default:
          return '';
      }
    })
    .filter(Boolean);

  return modifierSymbols.join('+') + '+' + formattedKey;
}
