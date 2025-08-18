/**
 * Settings Test Fixtures
 * 
 * Provides reusable test data for settings-related tests.
 */

import type { SpinnerSettings } from '@raffle-spinner/storage';

export const mockSettings: Record<string, SpinnerSettings> = {
  default: {
    minSpinDuration: 3,
    decelerationRate: 'medium',
    spinRotations: 5,
    bezierCurve: {
      x1: 0.25,
      y1: 0.1,
      x2: 0.25,
      y2: 1,
    },
  },

  fast: {
    minSpinDuration: 1,
    decelerationRate: 'fast',
    spinRotations: 3,
    bezierCurve: {
      x1: 0.55,
      y1: 0.055,
      x2: 0.68,
      y2: 0.53,
    },
  },

  slow: {
    minSpinDuration: 5,
    decelerationRate: 'slow',
    spinRotations: 8,
    bezierCurve: {
      x1: 0.17,
      y1: 0.67,
      x2: 0.83,
      y2: 0.67,
    },
  },
};

export const createMockSettings = (
  overrides?: Partial<SpinnerSettings>
): SpinnerSettings => {
  return {
    minSpinDuration: 3,
    decelerationRate: 'medium',
    spinRotations: 5,
    bezierCurve: {
      x1: 0.25,
      y1: 0.1,
      x2: 0.25,
      y2: 1,
    },
    ...overrides,
  };
};