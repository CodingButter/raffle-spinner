/**
 * SlotMachinePhysics Utility
 * 
 * Physics calculations and easing functions for slot machine animation.
 * Optimized for smooth 60fps performance with precise landing calculations.
 * 
 * @module SlotMachinePhysics
 * @category Animation Utils
 */

import { SpinnerSettings } from '@raffle-spinner/storage';

/**
 * Animation physics configuration
 */
export interface AnimationPhysics {
  duration: number;
  totalDistance: number;
  startPosition: number;
  finalPosition: number;
}

/**
 * Spin calculation parameters
 */
export interface SpinCalculation {
  winnerIndex: number;
  participantCount: number;
  itemHeight: number;
  settings: SpinnerSettings;
}

// Animation constants optimized for performance
const CENTER_INDEX = 2; // Visual center position in slot machine
const MIN_ROTATIONS = 7; // Minimum rotations for dramatic effect
const MAX_ROTATIONS = 10; // Maximum rotations to prevent excessive animation time

/**
 * Calculates initial physics for spin animation
 * 
 * @param calculation - Spin calculation parameters
 * @returns Initial physics configuration
 */
export function calculateInitialPhysics(calculation: SpinCalculation): AnimationPhysics {
  const { winnerIndex, participantCount, itemHeight, settings } = calculation;
  
  // Calculate wheel dimensions
  const wheelCircumference = participantCount * itemHeight;
  
  // Target position to center the winner
  const targetPosition = (winnerIndex - CENTER_INDEX) * itemHeight;
  
  // Calculate spin parameters
  const duration = settings.minSpinDuration * 1000; // Convert to ms
  const rotations = MIN_ROTATIONS + Math.random() * (MAX_ROTATIONS - MIN_ROTATIONS);
  
  // Calculate total distance for precise landing
  const totalDistance = rotations * wheelCircumference + targetPosition;
  
  return {
    duration,
    totalDistance,
    startPosition: 0,
    finalPosition: totalDistance,
  };
}

/**
 * Recalculates physics after subset swap at max velocity
 * 
 * @param currentPosition - Current animation position
 * @param currentProgress - Animation progress (0-1)
 * @param originalPhysics - Original physics configuration
 * @param newCalculation - New calculation parameters after swap
 * @returns Recalculated physics for smooth continuation
 */
export function recalculatePhysicsAfterSwap(
  currentPosition: number,
  currentProgress: number,
  originalPhysics: AnimationPhysics,
  newCalculation: SpinCalculation
): AnimationPhysics {
  const { winnerIndex, participantCount, itemHeight } = newCalculation;
  
  // Calculate new wheel parameters
  const updatedCircumference = participantCount * itemHeight;
  
  // Winner is always at index 0 in our new subset structure
  const newTargetPosition = (0 - CENTER_INDEX) * itemHeight; // -160 for centering
  
  // Use remaining duration for smooth deceleration (92% since swap happens at 5% progress)
  const remainingDuration = originalPhysics.duration * 0.92;
  const remainingRotations = 5.5 + Math.random() * 2.5; // More rotations for dramatic effect
  
  // Calculate distance to travel from current position
  const remainingDistance = (remainingRotations * updatedCircumference) + newTargetPosition;
  
  return {
    duration: remainingDuration,
    totalDistance: remainingDistance,
    startPosition: 0, // Reset coordinate system
    finalPosition: newTargetPosition, // Land exactly at winner position
  };
}

/**
 * Optimized easing function for smooth deceleration
 * Uses cubic ease-out for natural spinning feel
 * 
 * @param progress - Animation progress (0-1)
 * @returns Eased progress value
 */
export function easeOutCubic(progress: number): number {
  return 1 - Math.pow(1 - progress, 3);
}

/**
 * Calculates position based on physics and easing
 * 
 * @param progress - Animation progress (0-1)
 * @param physics - Physics configuration
 * @returns Current position
 */
export function calculatePosition(progress: number, physics: AnimationPhysics): number {
  const easedProgress = easeOutCubic(progress);
  return physics.startPosition + physics.totalDistance * easedProgress;
}

/**
 * Validates landing accuracy for debugging
 * 
 * @param finalPosition - Final animation position
 * @param participantCount - Number of participants
 * @param itemHeight - Height of each item
 * @param expectedWinnerIndex - Expected winner index
 * @returns Validation result
 */
export function validateLanding(
  finalPosition: number,
  participantCount: number,
  itemHeight: number,
  expectedWinnerIndex: number
): {
  isAccurate: boolean;
  actualCenterIndex: number;
  expectedCenterIndex: number;
  positionError: number;
} {
  const wheelCircumference = participantCount * itemHeight;
  const normalizedPosition = ((finalPosition % wheelCircumference) + wheelCircumference) % wheelCircumference;
  
  // Calculate which participant is at the visual center
  const topIndex = Math.floor(normalizedPosition / itemHeight);
  const actualCenterIndex = (topIndex + CENTER_INDEX) % participantCount;
  
  // Calculate position error
  const expectedPosition = (expectedWinnerIndex - CENTER_INDEX) * itemHeight;
  const positionError = Math.abs(normalizedPosition - expectedPosition);
  
  return {
    isAccurate: actualCenterIndex === expectedWinnerIndex,
    actualCenterIndex,
    expectedCenterIndex: expectedWinnerIndex,
    positionError,
  };
}

/**
 * Gets physics debug information for development
 * 
 * @param physics - Physics configuration
 * @param calculation - Spin calculation parameters
 * @returns Debug information object
 */
export function getPhysicsDebugInfo(
  physics: AnimationPhysics,
  calculation: SpinCalculation
): {
  rotations: number;
  targetPosition: number;
  wheelCircumference: number;
  expectedLandingPosition: number;
} {
  const { participantCount, itemHeight } = calculation;
  const wheelCircumference = participantCount * itemHeight;
  const rotations = physics.totalDistance / wheelCircumference;
  const targetPosition = (calculation.winnerIndex - CENTER_INDEX) * itemHeight;
  const expectedLandingPosition = physics.totalDistance % wheelCircumference;
  
  return {
    rotations: parseFloat(rotations.toFixed(2)),
    targetPosition,
    wheelCircumference,
    expectedLandingPosition,
  };
}