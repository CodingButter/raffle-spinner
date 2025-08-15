/**
 * WheelAnimator Component
 * 
 * Handles animation logic, subset swapping, and position updates.
 * Manages the physics-based spinning animation and velocity calculations.
 * 
 * @module WheelAnimator
 */

import { useCallback, useRef, useEffect } from 'react';
import { Participant } from '@raffle-spinner/storage';
import { normalizeTicketNumber } from '@drawday/utils';
import { useSlotMachineAnimation } from '../hooks/useSlotMachineAnimation';
import { SpinnerSettings } from '../../types';
import { ITEM_HEIGHT, VIEWPORT_HEIGHT, FRAME_BORDER_WIDTH } from '../../constants';
import { 
  InternalTheme,
  drawBackground,
  drawSegments,
  drawFrame
} from './SegmentRenderer';
import { drawShadowOverlays } from './ShadowRenderer';

export interface WheelAnimatorProps {
  displaySubset: Participant[];
  targetTicketNumber: string;
  settings: SpinnerSettings;
  isSpinning: boolean;
  onSpinComplete: (winner: Participant) => void;
  onError?: (error: string) => void;
  onPositionUpdate: (position: number) => void;
  onMaxVelocity: () => number;
  findWinnerInFullList: () => Participant | undefined;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  theme: InternalTheme;
  canvasWidth: number;
  canvasHeight: number;
  showDebug: boolean;
}

/**
 * Hook for managing wheel animation and drawing
 */
export function useWheelAnimator({
  displaySubset,
  targetTicketNumber,
  settings,
  isSpinning,
  onSpinComplete,
  onError,
  onPositionUpdate,
  onMaxVelocity,
  findWinnerInFullList,
  canvasRef,
  theme,
  canvasWidth,
  canvasHeight,
  showDebug,
}: WheelAnimatorProps) {
  const isAnimatingRef = useRef(false);
  const currentSubsetRef = useRef(displaySubset);

  // Update subset ref when it changes
  useEffect(() => {
    currentSubsetRef.current = displaySubset;
  }, [displaySubset]);

  /**
   * Draws the complete wheel visualization at the specified position.
   * Handles background, segments, frame, and shadow overlays.
   */
  const drawWheel = useCallback(
    (currentPosition: number, subset: Participant[]) => {
      const canvas = canvasRef.current;
      if (!canvas || subset.length === 0) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas - make it completely transparent
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Define viewport area - now starts at top-left with border
      const VIEWPORT_TOP = FRAME_BORDER_WIDTH;
      const VIEWPORT_LEFT = FRAME_BORDER_WIDTH;
      const VIEWPORT_WIDTH = canvasWidth - FRAME_BORDER_WIDTH * 2;
      const VIEWPORT_BOTTOM = VIEWPORT_TOP + VIEWPORT_HEIGHT;

      // Save the current context state
      ctx.save();

      // Create clipping region for the viewport - EVERYTHING inside this will be clipped
      ctx.beginPath();
      ctx.rect(VIEWPORT_LEFT, VIEWPORT_TOP, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
      ctx.clip();

      // Draw background
      drawBackground(ctx, theme, VIEWPORT_TOP, VIEWPORT_LEFT, VIEWPORT_WIDTH, VIEWPORT_BOTTOM);

      // Calculate wheel position (based on subset, not all participants)
      const wheelCircumference = subset.length * ITEM_HEIGHT;
      const normalizedPos =
        ((currentPosition % wheelCircumference) + wheelCircumference) % wheelCircumference;

      // Draw all segments
      drawSegments(
        ctx,
        subset,
        normalizedPos,
        theme,
        canvasWidth,
        VIEWPORT_TOP,
        showDebug
      );

      // Draw shadow overlays
      drawShadowOverlays(
        ctx,
        theme,
        VIEWPORT_TOP,
        VIEWPORT_LEFT,
        VIEWPORT_WIDTH,
        VIEWPORT_BOTTOM
      );

      // Restore context to remove clipping
      ctx.restore();

      // Draw frame on top without clipping
      drawFrame(ctx, canvasWidth, theme);
    },
    [theme, canvasWidth, canvasHeight, showDebug, canvasRef]
  );

  // Animation hook with subset
  const { spin, cancel } = useSlotMachineAnimation({
    participants: displaySubset,
    targetTicketNumber,
    settings,
    onSpinComplete: (_winner) => {
      // Use the actual winner from the full list, not the subset
      const actualWinner = findWinnerInFullList();
      if (actualWinner) {
        isAnimatingRef.current = false;
        onSpinComplete(actualWinner);
      } else {
        isAnimatingRef.current = false;
        if (onError) onError(`Ticket ${targetTicketNumber} not found`);
      }
    },
    onError: (error) => {
      isAnimatingRef.current = false;
      if (onError) onError(error);
    },
    onPositionUpdate: (pos: number) => {
      onPositionUpdate(pos);
      drawWheel(pos, currentSubsetRef.current);
    },
    onMaxVelocity,
    itemHeight: ITEM_HEIGHT,
    getParticipants: () => currentSubsetRef.current,
  });

  // Handle spin start/stop
  useEffect(() => {
    if (isSpinning && !isAnimatingRef.current) {
      isAnimatingRef.current = true;
      // Start spinning with current subset (will swap at max velocity)
      spin();
    } else if (!isSpinning && isAnimatingRef.current) {
      isAnimatingRef.current = false;
      cancel();
    }
  }, [isSpinning, spin, cancel]);

  return { drawWheel, isAnimatingRef };
}