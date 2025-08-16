/**
 * Dark Mode Tests
 * 
 * Verifies that dark mode implementation works correctly
 */

import { getDefaultColors, getDefaultSpinnerStyle, getSystemColorScheme } from '../contexts/theme-defaults';

describe('Dark Mode Implementation', () => {
  describe('getDefaultColors', () => {
    it('should return light colors when isDark is false', () => {
      const colors = getDefaultColors(false);
      expect(colors.background).toBe('#fdfeff'); // Light background
      expect(colors.foreground).toBe('#161b21'); // Dark text
      expect(colors.card).toBe('#fdfeff'); // Light card
      expect(colors.cardForeground).toBe('#161b21'); // Dark text on card
    });

    it('should return dark colors when isDark is true', () => {
      const colors = getDefaultColors(true);
      expect(colors.background).toBe('#0c0e11'); // Dark background
      expect(colors.foreground).toBe('#fdfeff'); // Light text
      expect(colors.card).toBe('#161b21'); // Dark card
      expect(colors.cardForeground).toBe('#fdfeff'); // Light text on card
    });

    it('should preserve brand colors regardless of theme', () => {
      const lightColors = getDefaultColors(false);
      const darkColors = getDefaultColors(true);
      
      // Brand colors should remain consistent
      expect(lightColors.primary).toBe(darkColors.primary);
      expect(lightColors.secondary).toBe(darkColors.secondary);
      expect(lightColors.accent).toBe(darkColors.accent);
      expect(lightColors.winner).toBe(darkColors.winner);
      expect(lightColors.winnerGlow).toBe(darkColors.winnerGlow);
    });
  });

  describe('getDefaultSpinnerStyle', () => {
    it('should return light spinner colors when isDark is false', () => {
      const style = getDefaultSpinnerStyle(false);
      expect(style.nameColor).toBe('#161b21'); // Dark text
      expect(style.backgroundColor).toBe('#fdfeff'); // Light background
    });

    it('should return dark spinner colors when isDark is true', () => {
      const style = getDefaultSpinnerStyle(true);
      expect(style.nameColor).toBe('#fdfeff'); // Light text
      expect(style.backgroundColor).toBe('#161b21'); // Dark background
    });

    it('should preserve accent colors regardless of theme', () => {
      const lightStyle = getDefaultSpinnerStyle(false);
      const darkStyle = getDefaultSpinnerStyle(true);
      
      // Accent colors should remain consistent
      expect(lightStyle.ticketColor).toBe(darkStyle.ticketColor);
      expect(lightStyle.borderColor).toBe(darkStyle.borderColor);
      expect(lightStyle.highlightColor).toBe(darkStyle.highlightColor);
    });
  });

  describe('System Theme Detection', () => {
    it('should detect system color scheme', () => {
      // Mock matchMedia
      const originalMatchMedia = window.matchMedia;
      
      // Test light mode detection
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: false, // Light mode
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }));
      expect(getSystemColorScheme()).toBe('light');
      
      // Test dark mode detection
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: true, // Dark mode
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }));
      expect(getSystemColorScheme()).toBe('dark');
      
      // Restore original
      window.matchMedia = originalMatchMedia;
    });
  });
});