/**
 * Spinner Physics Types
 *
 * Purpose: Type definitions for spinner physics calculations including spin
 * configuration, animation parameters, and wheel segment structures.
 *
 * SRS Reference:
 * - FR-2.2: Winner Selection and Animation (SpinAnimation interface)
 * - FR-1.7: Spinner Physics Configuration (SpinConfig interface)
 * - FR-2.2: Performance optimization (WheelSegment for large datasets)
 */

export interface SpinConfig {
  targetIndex: number;
  totalItems: number;
  minDuration: number; // seconds
  decelerationRate: "slow" | "medium" | "fast";
}

export interface SpinAnimation {
  duration: number;
  startAngle: number;
  endAngle: number;
  easing: (t: number) => number;
}

export interface WheelSegment {
  startAngle: number;
  endAngle: number;
  index: number;
}
