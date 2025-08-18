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

import { useRef, useEffect } from 'react';
import { convertTheme, type InternalThemeSettings, type SpinnerTheme } from '@drawday/utils';
import { useSlotMachineAnimation } from './hooks/useSlotMachineAnimation';
import { useWheelRenderer } from './hooks/useWheelRenderer';
import { useSubsetManager } from './hooks/useSubsetManager';
import { BaseSpinnerProps, DEFAULT_SPINNER_THEME } from '../types';

// Visual constants
const ITEM_HEIGHT = 80;
const FRAME_BORDER_WIDTH = 8;
const CANVAS_WIDTH = 350 + FRAME_BORDER_WIDTH * 2; // WHEEL_WIDTH + borders
const CANVAS_HEIGHT = 5 * 80 + FRAME_BORDER_WIDTH * 2; // VIEWPORT_HEIGHT + borders


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
 * @param props - Component properties
 * @param props.participants - Array of participants to display
 * @param props.targetTicketNumber - Winning ticket number to land on
 * @param props.settings - Animation settings (duration, deceleration)
 * @param props.isSpinning - Controls animation state
 * @param props.onSpinComplete - Callback when spin animation completes
 * @param props.onError - Error handler callback
 * @param props.theme - Visual theme configuration
 * @param props.canvasWidth - Canvas width in pixels (default: 400)
 * @param props.canvasHeight - Canvas height in pixels (default: 500)
 * @param props.showDebug - Show debug overlay in development
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
  const isAnimatingRef = useRef(false);

  // Convert theme to internal format
  const internalTheme: InternalThemeSettings = convertTheme(theme);

  // Use subset manager hook for participant management
  const {
    displaySubset,
    position,
    setPosition,
    handleMaxVelocity,
    findWinnerInFullList,
    finalPositionRef,
    hasSwappedRef,
  } = useSubsetManager({
    participants,
    targetTicketNumber,
    itemHeight: ITEM_HEIGHT,
  });

  // Use wheel renderer hook for drawing logic
  const { drawWheel } = useWheelRenderer({
    canvasWidth,
    canvasHeight,
    showDebug,
    theme: internalTheme,
  });

  // Store current subset in a ref for animation to access
  const currentSubsetRef = useRef(displaySubset);
  useEffect(() => {
    currentSubsetRef.current = displaySubset;
  }, [displaySubset]);

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
        // Don't reset any flags - keep the wheel in its final position
        onSpinComplete(actualWinner);
      } else {
        isAnimatingRef.current = false;
        if (onError) onError(`Ticket ${targetTicketNumber} not found`);
      }
    },
    onError: (error) => {
      isAnimatingRef.current = false;
      hasSwappedRef.current = false;
      if (onError) onError(error);
    },
    onPositionUpdate: (pos: number) => {
      setPosition(pos);
      finalPositionRef.current = pos; // Always store the latest position
      drawWheel(canvasRef, pos, currentSubsetRef.current);
    },
    onMaxVelocity: handleMaxVelocity,
    itemHeight: ITEM_HEIGHT,
    getParticipants: () => currentSubsetRef.current,
  });

  // Handle spin start/stop
  useEffect(() => {
    if (isSpinning && !isAnimatingRef.current) {
      isAnimatingRef.current = true;
      hasSwappedRef.current = false; // Reset swap flag for new spin
      // Start spinning with current subset (will swap at max velocity)
      spin();
    } else if (!isSpinning && isAnimatingRef.current) {
      isAnimatingRef.current = false;
      // Don't reset hasSwappedRef here - keep the subset with the winner
      cancel();
    }
  }, [isSpinning, spin, cancel]);

  // Draw wheel when position, subset, or theme changes
  useEffect(() => {
    if (displaySubset.length > 0) {
      // Use final position if available, otherwise use current position
      const drawPosition = finalPositionRef.current ?? position;
      drawWheel(canvasRef, drawPosition, displaySubset);
    }
  }, [position, displaySubset, drawWheel]);

  return (
    <div
      className={`inline-flex rounded-xl overflow-hidden ${className || ''}`}
      style={{ background: 'transparent' }}
    >
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="block"
        style={{
          imageRendering: 'crisp-edges',
          background: 'transparent',
        }}
      />
    </div>
  );
}
