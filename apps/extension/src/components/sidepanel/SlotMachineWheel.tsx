/**
 * Slot Machine Wheel Component
 *
 * Main slot machine wheel visualization with subset swapping for performance.
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Participant, SpinnerSettings } from '@raffle-spinner/storage';
import { useSlotMachineAnimation } from '@/hooks/useSlotMachineAnimation';
import { drawWheelSegment } from './wheel/WheelSegment';
import { drawWheelFrame } from './wheel/WheelFrame';
import { useTheme } from '@/contexts/ThemeContext';
import { normalizeTicketNumber } from '@/lib/utils';

interface SlotMachineWheelProps {
  participants: Participant[];
  targetTicketNumber: string;
  settings: SpinnerSettings;
  isSpinning: boolean;
  onSpinComplete: (winner: Participant) => void;
  onError?: (error: string) => void;
}

// Visual constants
const ITEM_HEIGHT = 80;
const VISIBLE_ITEMS = 5;
const VIEWPORT_HEIGHT = VISIBLE_ITEMS * ITEM_HEIGHT;
const WHEEL_WIDTH = 350;
const PERSPECTIVE_SCALE = 0.15;
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 500;

// Subset configuration
const SUBSET_SIZE = 25; // Number of entries to show in the wheel
const SUBSET_PADDING = Math.floor(SUBSET_SIZE / 2); // Entries before/after winner

export function SlotMachineWheel({
  participants,
  targetTicketNumber,
  settings,
  isSpinning,
  onSpinComplete,
  onError,
}: SlotMachineWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [position, setPosition] = useState(0);
  const [displaySubset, setDisplaySubset] = useState<Participant[]>([]);
  const isAnimatingRef = useRef(false);
  const hasSwappedRef = useRef(false);
  const { theme } = useTheme();

  // Sort participants by ticket number to get consistent ordering - MEMOIZED
  const sortedParticipants = React.useMemo(() => {
    return [...participants].sort((a, b) => {
      const aNum = parseInt(a.ticketNumber.replace(/\D/g, '')) || 0;
      const bNum = parseInt(b.ticketNumber.replace(/\D/g, '')) || 0;
      return aNum - bNum;
    });
  }, [participants]);

  // Initialize with the first subset (lowest tickets) - only when participants change
  useEffect(() => {
    if (sortedParticipants.length > 0) {
      // Show initial subset starting from lowest ticket
      const initialSubset = sortedParticipants.slice(
        0,
        Math.min(SUBSET_SIZE, sortedParticipants.length)
      );

      // If we have fewer participants than subset size, repeat them to fill the wheel
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
        setDisplaySubset(repeated);
      } else {
        setDisplaySubset(initialSubset);
      }

      setPosition(0); // Reset to start
    }
  }, [sortedParticipants]); // Depend on the actual sorted array

  // Draw the wheel at a given position
  const drawWheel = useCallback(
    (currentPosition: number, subset: Participant[]) => {
      const canvas = canvasRef.current;
      if (!canvas || subset.length === 0) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw background
      const bgGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      bgGradient.addColorStop(0, '#1a1a2e');
      bgGradient.addColorStop(0.5, '#0f0f23');
      bgGradient.addColorStop(1, '#1a1a2e');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

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
        const yPosition = i * ITEM_HEIGHT - pixelOffset + 40; // 40px top padding

        // Highlight the center position for debugging
        const isCenter = i === 2;

        // Log center participant when perfectly aligned (small offset tolerance)
        // Uncomment for debugging
        // if (isCenter && Math.abs(pixelOffset) < 2) {
        //   console.log(`🎯 Center: Ticket #${participant.ticketNumber} (index ${participantIndex})`);
        // }

        // Draw the participant segment
        drawWheelSegment({
          participant,
          yPos: yPosition,
          itemIndex: participantIndex,
          itemHeight: ITEM_HEIGHT,
          viewportHeight: VIEWPORT_HEIGHT,
          wheelWidth: WHEEL_WIDTH,
          canvasWidth: CANVAS_WIDTH,
          perspectiveScale: PERSPECTIVE_SCALE,
          ctx,
          theme,
        });

        // Add debug text showing position indices (only in dev builds)
        // @ts-expect-error - import.meta.env is available in Vite
        if (import.meta.env?.DEV) {
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

      // Draw frame and selection indicators
      drawWheelFrame({
        ctx,
        canvasWidth: CANVAS_WIDTH,
        viewportHeight: VIEWPORT_HEIGHT,
      });
    },
    [theme]
  );

  // Find winner in the full participant list (not subset)
  const findWinnerInFullList = useCallback(() => {
    const normalizedTarget = normalizeTicketNumber(targetTicketNumber);
    return participants.find((p) => normalizeTicketNumber(p.ticketNumber) === normalizedTarget);
  }, [participants, targetTicketNumber]);

  // Create winner subset when spin starts
  const createWinnerSubset = useCallback(() => {
    // Find the winner in sorted participants
    const normalizedTarget = normalizeTicketNumber(targetTicketNumber);
    const winnerIndex = sortedParticipants.findIndex(
      (p) => normalizeTicketNumber(p.ticketNumber) === normalizedTarget
    );

    if (winnerIndex === -1) {
      // Winner not found in sorted list - shouldn't happen as validation is in SidePanel
      return sortedParticipants.slice(0, SUBSET_SIZE); // Fallback to first subset
    }

    // Create subset with winner in the middle
    const subset: Participant[] = [];
    const startIdx = Math.max(0, winnerIndex - SUBSET_PADDING);
    const endIdx = Math.min(sortedParticipants.length, startIdx + SUBSET_SIZE);

    // Add participants around the winner
    for (let i = startIdx; i < endIdx; i++) {
      subset.push(sortedParticipants[i]);
    }

    // If subset is too small, pad with repeated entries
    while (subset.length < SUBSET_SIZE) {
      subset.push(...subset.slice(0, Math.min(subset.length, SUBSET_SIZE - subset.length)));
    }

    return subset;
  }, [sortedParticipants, targetTicketNumber]);

  // Callback to swap subset at max velocity and return new winner index
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
        hasSwappedRef.current = false; // Reset for next spin
        onSpinComplete(actualWinner);
      } else {
        isAnimatingRef.current = false;
        hasSwappedRef.current = false;
        if (onError) onError(`Ticket ${targetTicketNumber} not found`);
      }
    },
    onError: (error) => {
      isAnimatingRef.current = false;
      hasSwappedRef.current = false;
      if (onError) onError(error);
    },
    onMaxVelocity: handleMaxVelocity,
    itemHeight: ITEM_HEIGHT,
    currentPosition: position,
    setCurrentPosition: setPosition,
    drawWheel: (pos) => drawWheel(pos, currentSubsetRef.current),
    getParticipants: () => currentSubsetRef.current,
  });

  // Handle spin start/stop
  useEffect(() => {
    if (isSpinning && !isAnimatingRef.current) {
      isAnimatingRef.current = true;
      hasSwappedRef.current = false; // Reset swap flag
      // Start spinning with current subset (will swap at max velocity)
      spin();
    } else if (!isSpinning && isAnimatingRef.current) {
      isAnimatingRef.current = false;
      hasSwappedRef.current = false;
      cancel();
    }
  }, [isSpinning, spin, cancel]);

  // Draw wheel when position or subset changes
  useEffect(() => {
    if (displaySubset.length > 0) {
      drawWheel(position, displaySubset);
    }
  }, [position, displaySubset]); // Remove drawWheel from deps to prevent loops

  return (
    <div className="relative w-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black rounded-lg p-4">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="max-w-full h-auto rounded-lg shadow-2xl"
        style={{ imageRendering: 'crisp-edges' }}
      />
    </div>
  );
}
