/**
 * Settings Test Fixtures
 * 
 * Provides reusable test data for settings-related tests.
 */

import type { SpinnerSettings, Theme } from '@raffle-spinner/storage';

export const mockSettings: Record<string, SpinnerSettings> = {
  default: {
    minSpinDuration: 3,
    maxSpinDuration: 5,
    decelerationRate: 0.98,
    soundEnabled: true,
    confettiEnabled: true,
    wheelColors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'],
    backgroundColor: '#1a1a2e',
    textColor: '#ffffff',
  },

  fast: {
    minSpinDuration: 1,
    maxSpinDuration: 2,
    decelerationRate: 0.95,
    soundEnabled: false,
    confettiEnabled: false,
    wheelColors: ['#FF6B6B', '#4ECDC4'],
    backgroundColor: '#ffffff',
    textColor: '#000000',
  },

  slow: {
    minSpinDuration: 5,
    maxSpinDuration: 10,
    decelerationRate: 0.99,
    soundEnabled: true,
    confettiEnabled: true,
    wheelColors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#FDCB6E'],
    backgroundColor: '#2c3e50',
    textColor: '#ecf0f1',
  },
};

export const mockThemes: Record<string, Theme> = {
  light: {
    name: 'light',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    primaryColor: '#007bff',
    secondaryColor: '#6c757d',
  },

  dark: {
    name: 'dark',
    backgroundColor: '#1a1a2e',
    textColor: '#ffffff',
    primaryColor: '#4ECDC4',
    secondaryColor: '#FF6B6B',
  },

  custom: {
    name: 'custom',
    backgroundColor: '#2c3e50',
    textColor: '#ecf0f1',
    primaryColor: '#3498db',
    secondaryColor: '#e74c3c',
  },
};

export const createMockSettings = (
  overrides?: Partial<SpinnerSettings>
): SpinnerSettings => {
  return {
    minSpinDuration: 3,
    maxSpinDuration: 5,
    decelerationRate: 0.98,
    soundEnabled: true,
    confettiEnabled: true,
    wheelColors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'],
    backgroundColor: '#1a1a2e',
    textColor: '#ffffff',
    ...overrides,
  };
};