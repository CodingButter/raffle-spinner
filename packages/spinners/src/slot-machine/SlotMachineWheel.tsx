/**
 * Slot Machine Wheel Component
 *
 * A high-performance slot machine spinner visualization that handles large participant lists
 * through intelligent subset swapping. Optimized to maintain 60fps with 5000+ participants.
 *
 * Features:
 * - Subset swapping for performance (displays 100 entries, swaps at max velocity)
 * - Customizable theme with shadow effects
 * - Physics-based animation with configurable deceleration
 * - Canvas-based rendering for smooth performance
 * - Debug mode for development
 *
 * @module SlotMachineWheel
 * @category Components
 */

import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { normalizeTicketNumber } from '@drawday/utils';
import { BaseSpinnerProps, DEFAULT_SPINNER_THEME } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';
import { WheelCanvas } from './components/refactored/WheelCanvas';
import { useWheelAnimator } from './components/refactored/WheelAnimator';
import { useWheelState } from './hooks/useWheelState';
import {
  createWinnerSubset,
  findWinnerInFullList,
  sortParticipants,
} from './components/refactored/WinnerCalculator';
import { convertTheme } from './utils/themeConverter';

export interface SlotMachineWheelProps extends BaseSpinnerProps {
  /** Optional width for the canvas */
  canvasWidth?: number;
  /** Optional height for the canvas */
  canvasHeight?: number;
  /** Show debug info (dev only) */
  showDebug?: boolean;
}

/**
 * SlotMachineWheel Component
 *
 * Renders an animated slot machine wheel for participant selection.
 * Handles large datasets through subset swapping and provides smooth
 * physics-based animations.
 *
 * @example
 * ```tsx
 * <SlotMachineWheel
 *   participants={participants}
 *   targetTicketNumber="123"
 *   settings={{ minSpinDuration: 3, decelerationRate: 'medium' }}
 *   isSpinning={isSpinning}
 *   onSpinComplete={(winner) => console.log('Winner:', winner)}
 *   theme={customTheme}
 * />
 * ```
 */
export function SlotMachineWheel({
  participants,
  targetTicketNumber = '',
  settings,
  isSpinning,
  onSpinComplete,
  onError,
  theme = DEFAULT_SPINNER_THEME,
  className,
  canvasWidth = CANVAS_WIDTH,
  canvasHeight = CANVAS_HEIGHT,
  showDebug = false,
}: SlotMachineWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const internalTheme = useMemo(() => convertTheme(theme), [theme]);
  const sortedParticipants = useMemo(() => sortParticipants(participants), [participants]);
  
  // Use wheel state hook for state management
  const {
    position,
    setPosition,
    displaySubset,
    setDisplaySubset,
    hasSwappedRef,
    finalPositionRef,
  } = useWheelState({ participants, sortedParticipants });

  // Winner-related callbacks
  const findWinner = useCallback(
    () => findWinnerInFullList(participants, targetTicketNumber),
    [participants, targetTicketNumber]
  );

  const createWinnerSubsetCallback = useCallback(
    () => createWinnerSubset(sortedParticipants, targetTicketNumber),
    [sortedParticipants, targetTicketNumber]
  );

  // Handle subset swap at maximum velocity
  const handleMaxVelocity = useCallback(() => {
    if (!hasSwappedRef.current) {
      hasSwappedRef.current = true;
      const winnerSubset = createWinnerSubsetCallback();

      // Find winner's new index in the subset
      const normalizedTarget = normalizeTicketNumber(targetTicketNumber);
      const newWinnerIndex = winnerSubset.findIndex(
        (p) => normalizeTicketNumber(p.ticketNumber) === normalizedTarget
      );

      setDisplaySubset(winnerSubset);

      // Return the new index so animation can adjust
      return newWinnerIndex;
    }
    return -1;
  }, [createWinnerSubsetCallback, targetTicketNumber]);

  // Handle position updates
  const handlePositionUpdate = useCallback((pos: number) => {
    setPosition(pos);
    finalPositionRef.current = pos;
  }, []);

  // Use the wheel animator hook
  const { drawWheel } = useWheelAnimator({
    displaySubset,
    targetTicketNumber,
    settings,
    isSpinning,
    onSpinComplete,
    onError,
    onPositionUpdate: handlePositionUpdate,
    onMaxVelocity: handleMaxVelocity,
    findWinnerInFullList: findWinner,
    canvasRef,
    theme: internalTheme,
    canvasWidth,
    canvasHeight,
    showDebug,
  });

  // Draw wheel when position, subset, or theme changes
  useEffect(() => {
    if (displaySubset.length > 0) {
      // Use final position if available, otherwise use current position
      const drawPosition = finalPositionRef.current ?? position;
      drawWheel(drawPosition, displaySubset);
    }
  }, [position, displaySubset, drawWheel]);

  // Reset swap flag when spinning starts
  useEffect(() => {
    if (isSpinning) {
      hasSwappedRef.current = false;
    }
  }, [isSpinning]);

  return (
    <WheelCanvas
      ref={canvasRef}
      canvasWidth={canvasWidth}
      canvasHeight={canvasHeight}
      className={className}
    />
  );
}