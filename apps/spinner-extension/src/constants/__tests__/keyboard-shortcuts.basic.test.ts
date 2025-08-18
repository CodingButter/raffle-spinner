/**
 * Keyboard Shortcuts Constants Basic Tests
 */

import { describe, it, expect } from 'vitest';
import { KEYBOARD_SHORTCUTS, SHORTCUT_CATEGORIES } from '../keyboard-shortcuts';

describe('Keyboard Shortcuts - Basic Configuration', () => {
  describe('KEYBOARD_SHORTCUTS', () => {
    it('should have all required shortcuts defined', () => {
      const requiredActions = [
        'spin',
        'reset',
        'reveal-winner',
        'new-session',
        'export-winners',
        'clear-winners',
        'competition-selector',
        'settings',
        'close-modal',
        'help',
      ];

      requiredActions.forEach((action) => {
        const shortcut = KEYBOARD_SHORTCUTS.find((s) => s.action === action);
        expect(shortcut, `Missing shortcut for action: ${action}`).toBeDefined();
      });
    });

    it('should have proper structure for each shortcut', () => {
      KEYBOARD_SHORTCUTS.forEach((shortcut) => {
        expect(shortcut).toHaveProperty('key');
        expect(shortcut).toHaveProperty('action');
        expect(shortcut).toHaveProperty('description');
        expect(shortcut).toHaveProperty('category');
        expect(['spinner', 'navigation', 'session', 'system']).toContain(shortcut.category);
      });
    });

    it('should have multiple keys for spin action', () => {
      const spinShortcuts = KEYBOARD_SHORTCUTS.filter((s) => s.action === 'spin');
      expect(spinShortcuts).toHaveLength(2);
      expect(spinShortcuts.map((s) => s.key)).toContain(' ');
      expect(spinShortcuts.map((s) => s.key)).toContain('Enter');
    });

    it('should have modifier keys for clear-winners', () => {
      const clearShortcut = KEYBOARD_SHORTCUTS.find((s) => s.action === 'clear-winners');
      expect(clearShortcut?.modifiers).toContain('shift');
    });

    it('should mark disabled shortcuts properly', () => {
      const disabledShortcuts = KEYBOARD_SHORTCUTS.filter((s) => s.disabled);
      expect(disabledShortcuts.length).toBeGreaterThan(0);

      disabledShortcuts.forEach((shortcut) => {
        expect(shortcut.disabled).toBe(true);
      });
    });
  });

  describe('SHORTCUT_CATEGORIES', () => {
    it('should have all categories defined', () => {
      expect(SHORTCUT_CATEGORIES).toHaveProperty('spinner');
      expect(SHORTCUT_CATEGORIES).toHaveProperty('navigation');
      expect(SHORTCUT_CATEGORIES).toHaveProperty('session');
      expect(SHORTCUT_CATEGORIES).toHaveProperty('system');
    });

    it('should have descriptive category names', () => {
      expect(SHORTCUT_CATEGORIES.spinner).toBe('Spinner Controls');
      expect(SHORTCUT_CATEGORIES.navigation).toBe('Navigation');
      expect(SHORTCUT_CATEGORIES.session).toBe('Session Management');
      expect(SHORTCUT_CATEGORIES.system).toBe('System');
    });
  });
});
