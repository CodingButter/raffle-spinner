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

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Participant } from '@raffle-spinner/storage';
import { normalizeTicketNumber } from '@drawday/utils';
import { useSlotMachineAnimation } from './hooks/useSlotMachineAnimation';
import { drawSlotMachineSegment } from './components/SlotMachineSegment';
import { drawSlotMachineFrame } from './components/SlotMachineFrame';
import { BaseSpinnerProps, DEFAULT_SPINNER_THEME, SpinnerTheme } from '../types';
import { usePerformanceMonitor, PerformanceOverlay } from './hooks/usePerformanceMonitor';

// Visual constants
const ITEM_HEIGHT = 80;
const VISIBLE_ITEMS = 5;
const VIEWPORT_HEIGHT = VISIBLE_ITEMS * ITEM_HEIGHT;
const WHEEL_WIDTH = 350;
const PERSPECTIVE_SCALE = 0.15;
const FRAME_BORDER_WIDTH = 8; // Frame border thickness
const CANVAS_WIDTH = WHEEL_WIDTH + FRAME_BORDER_WIDTH * 2; // Viewport width + borders
const CANVAS_HEIGHT = VIEWPORT_HEIGHT + FRAME_BORDER_WIDTH * 2; // Viewport height + borders

// Subset configuration
const SUBSET_SIZE = 100; // Total entries to show in the wheel (50 first + 50 last)
const SUBSET_HALF = 50; // Half of the subset size

/**
 * Adjusts the brightness of a hex color
 * @param color - Hex color string (e.g., '#ffffff')
 * @param percent - Amount to adjust (-255 to 255)
 * @returns Adjusted hex color string
 */
function adjustBrightness(color: string, percent: number): string {
  // Handle hex colors
  if (color.startsWith('#')) {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, ((num >> 16) & 255) + percent));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 255) + percent));
    const b = Math.max(0, Math.min(255, (num & 255) + percent));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }
  // For non-hex colors, return with opacity adjustment
  return color;
}

export interface SlotMachineWheelProps extends BaseSpinnerProps {
  /** Optional width for the canvas */
  canvasWidth?: number;
  /** Optional height for the canvas */
  canvasHeight?: number;
  /** Show debug info (dev only) */
  showDebug?: boolean;
}

/**
 * Converts the public SpinnerTheme interface to the internal ThemeSettings format
 * required by the drawing functions. This maintains backward compatibility while
 * allowing for a cleaner public API.
 *
 * @param theme - Public theme configuration
 * @returns Internal theme settings with all required properties
 */
function convertTheme(theme: SpinnerTheme) {
  return {
    colors: {
      primary: '#007BFF',
      secondary: '#FF1493',
      accent: '#FFD700',
      background: 'transparent',
      foreground: '#fafafa',
      card: 'transparent',
      cardForeground: '#fafafa',
      winner: theme.highlightColor || '#FFD700',
      winnerGlow: theme.highlightColor || '#FFD700',
    },
    spinnerStyle: {
      type: 'slotMachine' as const,
      backgroundColor: theme.backgroundColor || '#1a1a1a',
      canvasBackground: 'transparent',
      borderColor: theme.borderColor || '#FFD700',
      highlightColor: theme.highlightColor || '#FF1493',
      nameColor: theme.nameColor || '#fafafa',
      ticketColor: theme.ticketColor || '#FFD700',
      fontFamily: theme.fontFamily || 'system-ui',
      nameSize: theme.nameSize || 'large',
      ticketSize: theme.ticketSize || 'extra-large',
      topShadowOpacity: theme.topShadowOpacity ?? 0.3,
      bottomShadowOpacity: theme.bottomShadowOpacity ?? 0.3,
      shadowSize: theme.shadowSize ?? 30,
      shadowColor: theme.shadowColor,
    },
    branding: {
      logoPosition: 'center' as const,
      showCompanyName: false,
    },
  };
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
  const [position, setPosition] = useState(0);
  const [displaySubset, setDisplaySubset] = useState<Participant[]>([]);
  const isAnimatingRef = useRef(false);
  const hasSwappedRef = useRef(false);
  const hasInitializedRef = useRef(false); // Track if we've initialized the wheel
  const lastParticipantsRef = useRef(participants); // Track participant changes
  const finalPositionRef = useRef<number | null>(null); // Store final position after spin

  // Convert theme to internal format
  const internalTheme = convertTheme(theme);
  
  // Performance monitoring for large datasets
  const { metrics } = usePerformanceMonitor({
    enabled: showDebug && participants.length > 1000,
    participantCount: participants.length,
    subsetSize: SUBSET_SIZE,
    warnThreshold: 50,
  });

  // Sort participants by ticket number to get consistent ordering - MEMOIZED
  const sortedParticipants = React.useMemo(() => {
    return [...participants].sort((a, b) => {
      const aNum = parseInt(a.ticketNumber.replace(/\D/g, '')) || 0;
      const bNum = parseInt(b.ticketNumber.replace(/\D/g, '')) || 0;
      return aNum - bNum;
    });
  }, [participants]);

  /**
   * Initialize with a subset containing first 50 and last 50 entries
   * This creates the illusion of a complete wheel that wraps around
   */
  useEffect(() => {
    // Check if participants have actually changed (new competition)
    const participantsChanged = participants !== lastParticipantsRef.current;
    
    if (participantsChanged) {
      // New competition - reset everything
      hasInitializedRef.current = false;
      hasSwappedRef.current = false;
      finalPositionRef.current = null;
      lastParticipantsRef.current = participants;
    }
    
    // Only initialize if not already initialized or if participants changed
    if (hasInitializedRef.current && !participantsChanged) {
      return;
    }
    
    if (sortedParticipants.length > 0) {
      hasInitializedRef.current = true; // Mark as initialized
      let initialSubset: Participant[];

      if (sortedParticipants.length <= SUBSET_SIZE) {
        // If we have 100 or fewer participants, use all of them
        initialSubset = [...sortedParticipants];

        // If we have fewer than SUBSET_SIZE, repeat to fill the wheel
        if (initialSubset.length < SUBSET_SIZE) {
          const repeated = [...initialSubset];
          while (repeated.length < SUBSET_SIZE) {
            repeated.push(
              ...sortedParticipants.slice(
                0,
                Math.min(sortedParticipants.length, SUBSET_SIZE - repeated.length)
              )
            );
          }
          initialSubset = repeated;
        }
      } else {
        // Take first 50 and last 50 entries to create wrap-around effect
        const firstHalf = sortedParticipants.slice(0, SUBSET_HALF);
        const lastHalf = sortedParticipants.slice(-SUBSET_HALF);
        initialSubset = [...firstHalf, ...lastHalf];
      }

      setDisplaySubset(initialSubset);

      // Only set initial position if we don't have a final position stored
      if (finalPositionRef.current === null) {
        // Start with the first ticket centered in view
        // The center position is at index 2 (VISIBLE_ITEMS / 2, rounded down)
        // To center the first ticket, we need to move up by 2 positions
        const startPosition = -2 * ITEM_HEIGHT;
        setPosition(startPosition);
      }
    }
  }, [sortedParticipants]); // Depend on the actual sorted array

  /**
   * Draws the complete wheel visualization at the specified position.
   * Handles background, segments, frame, and shadow overlays.
   *
   * @param currentPosition - Current scroll position in pixels
   * @param subset - Current subset of participants to display
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

      // Only draw background inside the clipped area
      // Check if we should draw a background at all
      if (
        internalTheme?.spinnerStyle?.backgroundColor &&
        internalTheme.spinnerStyle.backgroundColor !== 'transparent'
      ) {
        const slotBgColor = internalTheme.spinnerStyle.backgroundColor;
        const bgGradient = ctx.createLinearGradient(0, VIEWPORT_TOP, 0, VIEWPORT_BOTTOM);
        bgGradient.addColorStop(0, adjustBrightness(slotBgColor, -20));
        bgGradient.addColorStop(0.5, slotBgColor);
        bgGradient.addColorStop(1, adjustBrightness(slotBgColor, -20));
        ctx.fillStyle = bgGradient;
        ctx.fillRect(VIEWPORT_LEFT, VIEWPORT_TOP, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
      }

      // Calculate wheel position (based on subset, not all participants)
      const wheelCircumference = subset.length * ITEM_HEIGHT;
      const normalizedPos =
        ((currentPosition % wheelCircumference) + wheelCircumference) % wheelCircumference;

      // Determine which participant is at the top of the viewport
      const topParticipantIndex = Math.floor(normalizedPos / ITEM_HEIGHT);
      const pixelOffset = normalizedPos % ITEM_HEIGHT;

      // Draw participants from top to bottom
      // We draw extra ones above and below for smooth scrolling
      for (let i = -2; i <= VISIBLE_ITEMS + 2; i++) {
        // Calculate which participant to draw from the subset
        let participantIndex = (topParticipantIndex + i) % subset.length;
        if (participantIndex < 0) {
          participantIndex += subset.length;
        }

        const participant = subset[participantIndex];
        const yPosition = i * ITEM_HEIGHT - pixelOffset + VIEWPORT_TOP;

        // Highlight the center position for debugging
        const isCenter = i === 2;

        // Draw the participant segment
        drawSlotMachineSegment({
          participant,
          yPos: yPosition,
          itemIndex: participantIndex,
          itemHeight: ITEM_HEIGHT,
          viewportHeight: VIEWPORT_HEIGHT,
          wheelWidth: WHEEL_WIDTH,
          canvasWidth,
          perspectiveScale: PERSPECTIVE_SCALE,
          ctx,
          theme: internalTheme,
        });

        // Add debug text showing position indices (only in dev builds)
        if (showDebug) {
          ctx.save();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.font = '10px monospace';
          ctx.textAlign = 'left';
          ctx.fillText(`i=${i}, idx=${participantIndex}`, 10, yPosition + ITEM_HEIGHT / 2);
          if (isCenter) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
            ctx.fillText('← CENTER', 60, yPosition + ITEM_HEIGHT / 2);
          }
          ctx.restore();
        }
      }

      // Draw top and bottom shadow overlays INSIDE the viewport
      const topShadowOpacity = internalTheme?.spinnerStyle?.topShadowOpacity ?? 0.3;
      const bottomShadowOpacity = internalTheme?.spinnerStyle?.bottomShadowOpacity ?? 0.3;
      const shadowSize = (internalTheme?.spinnerStyle?.shadowSize ?? 30) / 100; // Convert percentage to decimal
      const shadowColor =
        internalTheme?.spinnerStyle?.shadowColor ||
        internalTheme?.spinnerStyle?.backgroundColor ||
        '#1a1a1a';

      // Parse hex color to RGB
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
          ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
            }
          : { r: 26, g: 26, b: 26 }; // Fallback to #1a1a1a
      };

      const rgb = hexToRgb(shadowColor);

      // Top shadow gradient - within viewport only
      if (topShadowOpacity > 0) {
        const topShadowHeight = VIEWPORT_HEIGHT * shadowSize;
        const topGradient = ctx.createLinearGradient(
          0,
          VIEWPORT_TOP,
          0,
          VIEWPORT_TOP + topShadowHeight
        );
        topGradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${topShadowOpacity})`);
        topGradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
        ctx.fillStyle = topGradient;
        ctx.fillRect(VIEWPORT_LEFT, VIEWPORT_TOP, VIEWPORT_WIDTH, topShadowHeight);
      }

      // Bottom shadow gradient - within viewport only
      if (bottomShadowOpacity > 0) {
        const bottomShadowHeight = VIEWPORT_HEIGHT * shadowSize;
        const bottomStart = VIEWPORT_BOTTOM - bottomShadowHeight;
        const bottomGradient = ctx.createLinearGradient(0, bottomStart, 0, VIEWPORT_BOTTOM);
        bottomGradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
        bottomGradient.addColorStop(
          1,
          `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${bottomShadowOpacity})`
        );
        ctx.fillStyle = bottomGradient;
        ctx.fillRect(VIEWPORT_LEFT, bottomStart, VIEWPORT_WIDTH, bottomShadowHeight);
      }

      // Restore context to remove clipping
      ctx.restore();

      // Draw frame and selection indicators AFTER restoring context
      // This ensures the frame is drawn on top without clipping
      drawSlotMachineFrame({
        ctx,
        canvasWidth,
        viewportHeight: VIEWPORT_HEIGHT,
        theme: internalTheme,
      });
    },
    [internalTheme, canvasWidth, canvasHeight, showDebug]
  );

  /**
   * Finds the winner in the complete participant list.
   * Necessary because the animation works with a subset.
   *
   * @returns The winning participant or undefined if not found
   */
  const findWinnerInFullList = useCallback(() => {
    const normalizedTarget = normalizeTicketNumber(targetTicketNumber);
    return participants.find((p) => normalizeTicketNumber(p.ticketNumber) === normalizedTarget);
  }, [participants, targetTicketNumber]);

  /**
   * Creates a new subset with the winner positioned for optimal animation.
   * Places the winner approximately in the middle of the 100-entry subset
   * to ensure smooth animation and proper landing.
   *
   * @returns Subset of participants with winner positioned centrally
   */
  const createWinnerSubset = useCallback(() => {
    // Find the winner in sorted participants
    const normalizedTarget = normalizeTicketNumber(targetTicketNumber);
    const winnerIndex = sortedParticipants.findIndex(
      (p) => normalizeTicketNumber(p.ticketNumber) === normalizedTarget
    );

    if (winnerIndex === -1) {
      // Winner not found - shouldn't happen as validation is in SidePanel
      // Fallback to initial subset pattern
      if (sortedParticipants.length <= SUBSET_SIZE) {
        return sortedParticipants;
      }
      const firstHalf = sortedParticipants.slice(0, SUBSET_HALF);
      const lastHalf = sortedParticipants.slice(-SUBSET_HALF);
      return [...firstHalf, ...lastHalf];
    }

    // If we have 100 or fewer participants, return all of them
    if (sortedParticipants.length <= SUBSET_SIZE) {
      return [...sortedParticipants];
    }

    // Create subset with winner approximately in the middle
    const subset: Participant[] = [];
    const halfSize = Math.floor(SUBSET_SIZE / 2);

    // Calculate start index to center the winner
    const startIdx = winnerIndex - halfSize;

    if (startIdx < 0) {
      // Winner is in the first half, need to wrap around from the end
      // Fix: properly handle negative indices by adding array length
      const wrapStartIdx = sortedParticipants.length + startIdx;
      const fromEnd = sortedParticipants.slice(wrapStartIdx);
      const fromStart = sortedParticipants.slice(0, winnerIndex + halfSize);
      subset.push(...fromEnd, ...fromStart);
    } else if (startIdx + SUBSET_SIZE > sortedParticipants.length) {
      // Winner is in the last half, need to wrap around to the beginning
      const fromMiddle = sortedParticipants.slice(startIdx);
      const fromBeginning = sortedParticipants.slice(0, SUBSET_SIZE - fromMiddle.length);
      subset.push(...fromMiddle, ...fromBeginning);
    } else {
      // Winner is in the middle, can take a continuous slice
      subset.push(...sortedParticipants.slice(startIdx, startIdx + SUBSET_SIZE));
    }

    return subset;
  }, [sortedParticipants, targetTicketNumber]);

  /**
   * Handles the subset swap at maximum velocity.
   * This creates the illusion of an infinite wheel while maintaining performance.
   *
   * @returns New index of the winner in the swapped subset, or -1 if already swapped
   */
  const handleMaxVelocity = useCallback(() => {
    if (!hasSwappedRef.current) {
      hasSwappedRef.current = true;
      const winnerSubset = createWinnerSubset();
      // Swap to winner subset at max velocity

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
  }, [createWinnerSubset, targetTicketNumber]);

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
      drawWheel(pos, currentSubsetRef.current);
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
      drawWheel(drawPosition, displaySubset);
    }
  }, [position, displaySubset, drawWheel]);

  return (
    <>
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
      {showDebug && <PerformanceOverlay metrics={metrics} />}
    </>
  );
}
