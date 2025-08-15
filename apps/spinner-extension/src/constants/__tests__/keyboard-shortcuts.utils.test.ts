/**
 * Keyboard Shortcuts Utility Functions Tests
 */

import { describe, it, expect } from 'vitest';
import { getShortcutsByCategory, formatKeyForDisplay } from '../keyboard-shortcuts';

describe('Keyboard Shortcuts - Utility Functions', () => {
  describe('getShortcutsByCategory', () => {
    it('should organize shortcuts by category', () => {
      const categorized = getShortcutsByCategory();

      expect(categorized).toHaveProperty('spinner');
      expect(categorized).toHaveProperty('navigation');
      expect(categorized).toHaveProperty('session');
      expect(categorized).toHaveProperty('system');
    });

    it('should exclude disabled shortcuts', () => {
      const categorized = getShortcutsByCategory();

      Object.values(categorized).forEach((shortcuts) => {
        shortcuts.forEach((shortcut) => {
          expect(shortcut.disabled).not.toBe(true);
        });
      });
    });

    it('should have correct shortcuts in each category', () => {
      const categorized = getShortcutsByCategory();

      // Check spinner category
      const spinnerActions = categorized.spinner.map((s) => s.action);
      expect(spinnerActions).toContain('spin');
      expect(spinnerActions).toContain('reset');
      expect(spinnerActions).toContain('reveal-winner');

      // Check session category
      const sessionActions = categorized.session.map((s) => s.action);
      expect(sessionActions).toContain('new-session');
      expect(sessionActions).toContain('export-winners');
      expect(sessionActions).toContain('clear-winners');

      // Check navigation category
      const navActions = categorized.navigation.map((s) => s.action);
      expect(navActions).toContain('competition-selector');
      expect(navActions).toContain('settings');

      // Check system category
      const systemActions = categorized.system.map((s) => s.action);
      expect(systemActions).toContain('close-modal');
      expect(systemActions).toContain('help');
    });
  });

  describe('formatKeyForDisplay', () => {
    it('should format special keys correctly', () => {
      expect(formatKeyForDisplay(' ')).toBe('Space');
      expect(formatKeyForDisplay('Enter')).toBe('Enter');
      expect(formatKeyForDisplay('Escape')).toBe('Esc');
      expect(formatKeyForDisplay('?')).toBe('?');
      expect(formatKeyForDisplay('ArrowUp')).toBe('↑');
      expect(formatKeyForDisplay('ArrowDown')).toBe('↓');
    });

    it('should uppercase regular keys', () => {
      expect(formatKeyForDisplay('a')).toBe('A');
      expect(formatKeyForDisplay('r')).toBe('R');
      expect(formatKeyForDisplay('w')).toBe('W');
    });

    it('should handle modifier keys', () => {
      expect(formatKeyForDisplay('c', ['shift'])).toBe('⇧+C');
      expect(formatKeyForDisplay('s', ['ctrl'])).toBe('Ctrl+S');
      expect(formatKeyForDisplay('a', ['alt'])).toBe('Alt+A');
      expect(formatKeyForDisplay('q', ['meta'])).toBe('⌘+Q');
    });

    it('should handle multiple modifiers', () => {
      expect(formatKeyForDisplay('s', ['ctrl', 'shift'])).toBe('Ctrl+⇧+S');
      expect(formatKeyForDisplay('a', ['ctrl', 'alt'])).toBe('Ctrl+Alt+A');
    });

    it('should handle no modifiers', () => {
      expect(formatKeyForDisplay('a', [])).toBe('A');
      expect(formatKeyForDisplay('b', undefined)).toBe('B');
    });
  });
});
