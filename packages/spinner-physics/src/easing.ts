/**
 * Easing Functions
 *
 * Purpose: Mathematical easing functions for spinner animation deceleration
 * providing different animation curves for slow, medium, and fast spin rates.
 *
 * SRS Reference:
 * - FR-1.7: Spinner Physics Configuration (deceleration rate options)
 * - FR-2.2: Winner Selection and Animation (smooth animation transitions)
 */

export const easingFunctions = {
  slow: (t: number): number => {
    // Cubic ease-out for slow deceleration
    return 1 - Math.pow(1 - t, 3);
  },

  medium: (t: number): number => {
    // Quadratic ease-out for medium deceleration
    return 1 - Math.pow(1 - t, 2);
  },

  fast: (t: number): number => {
    // Linear to slight ease-out for fast deceleration
    return t < 0.5 ? 2 * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  },
};
