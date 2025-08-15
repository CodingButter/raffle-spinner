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
import { useSlotMachineAnimation } from './hooks/useSlotMachineAnimation';
import { useSubsetManagementFixed } from './hooks/useSubsetManagementFixed';
import { WheelRenderer } from './components/WheelRenderer';
import { convertTheme } from './utils/theme-utils';
import { BaseSpinnerProps, DEFAULT_SPINNER_THEME } from '../types';

// Visual constants
const ITEM_HEIGHT = 80;
const VISIBLE_ITEMS = 5;
const VIEWPORT_HEIGHT = VISIBLE_ITEMS * ITEM_HEIGHT;
const WHEEL_WIDTH = 350;
const FRAME_BORDER_WIDTH = 8;
const CANVAS_WIDTH = WHEEL_WIDTH + FRAME_BORDER_WIDTH * 2;
const CANVAS_HEIGHT = VIEWPORT_HEIGHT + FRAME_BORDER_WIDTH * 2;

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
 * @param props.canvasWidth - Canvas width in pixels (default: 366)
 * @param props.canvasHeight - Canvas height in pixels (default: 416)
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
  const isAnimatingRef = useRef(false);

  // Convert theme to internal format
  const internalTheme = convertTheme(theme);

  // Use subset management hook
  const {
    displaySubset,
    position,
    setPosition,
    currentSubsetRef,
    handleMaxVelocity,
    findWinnerInFullList,
    resetForNewSpin,
  } = useSubsetManagementFixed({
    participants,
    targetTicketNumber,
    itemHeight: ITEM_HEIGHT,
  });

  // Animation hook with subset
  const { spin, cancel } = useSlotMachineAnimation({
    participants: displaySubset,
    targetTicketNumber,
    settings,
    onSpinComplete: (_winner) => {
      // Use the actual winner from the full list
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
      setPosition(pos);
    },
    onMaxVelocity: handleMaxVelocity,
    itemHeight: ITEM_HEIGHT,
    getParticipants: () => currentSubsetRef.current,
  });

  // Handle spin start/stop
  useEffect(() => {
    if (isSpinning && !isAnimatingRef.current) {
      isAnimatingRef.current = true;
      resetForNewSpin(); // Reset swap flag for new spin
      spin();
    } else if (!isSpinning && isAnimatingRef.current) {
      isAnimatingRef.current = false;
      cancel();
    }
  }, [isSpinning, spin, cancel, resetForNewSpin]);

  return (
    <div
      className={`inline-flex rounded-xl overflow-hidden ${className || ''}`}
      style={{ background: 'transparent' }}
    >
      <WheelRenderer
        displaySubset={displaySubset}
        position={position}
        theme={internalTheme}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        itemHeight={ITEM_HEIGHT}
        visibleItems={VISIBLE_ITEMS}
        showDebug={showDebug}
      />
    </div>
  );
}
