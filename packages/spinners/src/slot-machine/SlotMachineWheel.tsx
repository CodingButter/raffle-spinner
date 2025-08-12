/**
 * Slot Machine Wheel Component
 *
 * Main slot machine wheel visualization with subset swapping for performance.
 * This component can be used in both the extension and website.
 */

import React, { useRef, useEffect, useState, useCallback } from "react";
import { Participant } from "@raffle-spinner/storage";
import { normalizeTicketNumber } from "@raffle-spinner/utils";
import { useSlotMachineAnimation } from "./hooks/useSlotMachineAnimation";
import { drawWheelSegment } from "./components/WheelSegment";
import { drawWheelFrame } from "./components/WheelFrame";
import { BaseSpinnerProps, DEFAULT_SPINNER_THEME } from "../types";

// Visual constants
const ITEM_HEIGHT = 80;
const VISIBLE_ITEMS = 5;
const VIEWPORT_HEIGHT = VISIBLE_ITEMS * ITEM_HEIGHT;
const WHEEL_WIDTH = 350;
const PERSPECTIVE_SCALE = 0.15;
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 500;

// Subset configuration
const SUBSET_SIZE = 100; // Total entries to show in the wheel (50 first + 50 last)
const SUBSET_HALF = 50; // Half of the subset size

export interface SlotMachineWheelProps extends BaseSpinnerProps {
  /** Optional width for the canvas */
  canvasWidth?: number;
  /** Optional height for the canvas */
  canvasHeight?: number;
}

export function SlotMachineWheel({
  participants,
  targetTicketNumber = "",
  settings,
  isSpinning,
  onSpinComplete,
  onError,
  theme = DEFAULT_SPINNER_THEME,
  className,
  canvasWidth = CANVAS_WIDTH,
  canvasHeight = CANVAS_HEIGHT,
}: SlotMachineWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [position, setPosition] = useState(0);
  const [displaySubset, setDisplaySubset] = useState<Participant[]>([]);
  const isAnimatingRef = useRef(false);
  const hasSwappedRef = useRef(false);

  // Sort participants by ticket number for consistent ordering
  const sortedParticipants = React.useMemo(() => {
    return [...participants].sort((a, b) => {
      const aNum = parseInt(a.ticketNumber.replace(/\D/g, "")) || 0;
      const bNum = parseInt(b.ticketNumber.replace(/\D/g, "")) || 0;
      return aNum - bNum;
    });
  }, [participants]);

  /**
   * Initialize with a subset containing first 50 and last 50 entries
   * This creates the illusion of a complete wheel that wraps around
   */
  useEffect(() => {
    if (sortedParticipants.length > 0) {
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
                Math.min(
                  sortedParticipants.length,
                  SUBSET_SIZE - repeated.length,
                ),
              ),
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

      // Start with the first ticket centered in view
      const startPosition = -2 * ITEM_HEIGHT;
      setPosition(startPosition);
    }
  }, [sortedParticipants]);

  /**
   * Draw the wheel at a given position
   */
  const drawWheel = useCallback(
    (currentPosition: number, subset: Participant[]) => {
      const canvas = canvasRef.current;
      if (!canvas || subset.length === 0) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Draw background
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
      bgGradient.addColorStop(0, "#1a1a2e");
      bgGradient.addColorStop(0.5, "#0f0f23");
      bgGradient.addColorStop(1, "#1a1a2e");
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Calculate wheel position
      const wheelCircumference = subset.length * ITEM_HEIGHT;
      const normalizedPos =
        ((currentPosition % wheelCircumference) + wheelCircumference) %
        wheelCircumference;

      // Determine which participant is at the top
      const topParticipantIndex = Math.floor(normalizedPos / ITEM_HEIGHT);
      const pixelOffset = normalizedPos % ITEM_HEIGHT;

      // Set up clipping region to hide overflow with rounded corners
      ctx.save();

      // Define the visible wheel area (with some padding for the frame)
      const wheelTop = 40;
      const wheelLeft = (canvasWidth - WHEEL_WIDTH) / 2 - 10;
      const wheelWidth = WHEEL_WIDTH + 20;
      const cornerRadius = 20;

      // Create rounded rectangle clipping path
      ctx.beginPath();
      ctx.moveTo(wheelLeft + cornerRadius, wheelTop);
      ctx.lineTo(wheelLeft + wheelWidth - cornerRadius, wheelTop);
      ctx.quadraticCurveTo(
        wheelLeft + wheelWidth,
        wheelTop,
        wheelLeft + wheelWidth,
        wheelTop + cornerRadius,
      );
      ctx.lineTo(
        wheelLeft + wheelWidth,
        wheelTop + VIEWPORT_HEIGHT - cornerRadius,
      );
      ctx.quadraticCurveTo(
        wheelLeft + wheelWidth,
        wheelTop + VIEWPORT_HEIGHT,
        wheelLeft + wheelWidth - cornerRadius,
        wheelTop + VIEWPORT_HEIGHT,
      );
      ctx.lineTo(wheelLeft + cornerRadius, wheelTop + VIEWPORT_HEIGHT);
      ctx.quadraticCurveTo(
        wheelLeft,
        wheelTop + VIEWPORT_HEIGHT,
        wheelLeft,
        wheelTop + VIEWPORT_HEIGHT - cornerRadius,
      );
      ctx.lineTo(wheelLeft, wheelTop + cornerRadius);
      ctx.quadraticCurveTo(
        wheelLeft,
        wheelTop,
        wheelLeft + cornerRadius,
        wheelTop,
      );
      ctx.closePath();
      ctx.clip();

      // Draw participants
      for (let i = -2; i <= VISIBLE_ITEMS + 2; i++) {
        let participantIndex = (topParticipantIndex + i) % subset.length;
        if (participantIndex < 0) {
          participantIndex += subset.length;
        }

        const participant = subset[participantIndex];
        const yPosition = i * ITEM_HEIGHT - pixelOffset + 40;

        // Draw the participant segment
        drawWheelSegment({
          participant,
          yPos: yPosition,
          itemIndex: participantIndex,
          itemHeight: ITEM_HEIGHT,
          viewportHeight: VIEWPORT_HEIGHT,
          wheelWidth: WHEEL_WIDTH,
          canvasWidth,
          perspectiveScale: PERSPECTIVE_SCALE,
          ctx,
          theme,
        });
      }

      // Restore context (removes clipping)
      ctx.restore();

      // Draw frame and selection indicators (outside of clipping region)
      drawWheelFrame({
        ctx,
        canvasWidth,
        canvasHeight,
        viewportHeight: VIEWPORT_HEIGHT,
      });
    },
    [theme, canvasWidth, canvasHeight],
  );

  /**
   * Find winner in the full participant list
   */
  const findWinnerInFullList = useCallback(() => {
    const normalizedTarget = normalizeTicketNumber(targetTicketNumber);
    return participants.find(
      (p) => normalizeTicketNumber(p.ticketNumber) === normalizedTarget,
    );
  }, [participants, targetTicketNumber]);

  /**
   * Create winner subset when spin starts
   */
  const createWinnerSubset = useCallback(() => {
    const normalizedTarget = normalizeTicketNumber(targetTicketNumber);
    const winnerIndex = sortedParticipants.findIndex(
      (p) => normalizeTicketNumber(p.ticketNumber) === normalizedTarget,
    );

    if (winnerIndex === -1) {
      // Winner not found - fallback to initial subset pattern
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
      // Winner is in the first half, need to wrap around
      const fromEnd = sortedParticipants.slice(startIdx);
      const fromStart = sortedParticipants.slice(0, winnerIndex + halfSize);
      subset.push(...fromEnd, ...fromStart);
    } else if (startIdx + SUBSET_SIZE > sortedParticipants.length) {
      // Winner is in the last half, need to wrap around
      const fromMiddle = sortedParticipants.slice(startIdx);
      const fromBeginning = sortedParticipants.slice(
        0,
        SUBSET_SIZE - fromMiddle.length,
      );
      subset.push(...fromMiddle, ...fromBeginning);
    } else {
      // Winner is in the middle, can take a continuous slice
      subset.push(
        ...sortedParticipants.slice(startIdx, startIdx + SUBSET_SIZE),
      );
    }

    return subset;
  }, [sortedParticipants, targetTicketNumber]);

  /**
   * Callback to swap subset at max velocity
   */
  const handleMaxVelocity = useCallback(() => {
    if (!hasSwappedRef.current && targetTicketNumber) {
      hasSwappedRef.current = true;
      const winnerSubset = createWinnerSubset();

      // Find winner's new index in the subset
      const normalizedTarget = normalizeTicketNumber(targetTicketNumber);
      const newWinnerIndex = winnerSubset.findIndex(
        (p) => normalizeTicketNumber(p.ticketNumber) === normalizedTarget,
      );

      setDisplaySubset(winnerSubset);
      return newWinnerIndex;
    }
    return -1;
  }, [createWinnerSubset, targetTicketNumber]);

  // Store current subset in a ref for animation to access
  const currentSubsetRef = useRef(displaySubset);
  useEffect(() => {
    currentSubsetRef.current = displaySubset;
  }, [displaySubset]);

  // Animation hook
  const { spin, cancel } = useSlotMachineAnimation({
    participants: displaySubset,
    targetTicketNumber,
    settings,
    onSpinComplete: (_winner) => {
      // Use the actual winner from the full list
      const actualWinner = findWinnerInFullList();
      if (actualWinner) {
        isAnimatingRef.current = false;
        hasSwappedRef.current = false;
        onSpinComplete(actualWinner);
      } else {
        onError?.(`Winner not found: ${targetTicketNumber}`);
      }
    },
    onError,
    onPositionUpdate: setPosition,
    getParticipants: () => currentSubsetRef.current,
    onMaxVelocity: targetTicketNumber ? handleMaxVelocity : undefined,
    itemHeight: ITEM_HEIGHT,
  });

  // Draw wheel when position or subset changes
  useEffect(() => {
    drawWheel(position, displaySubset);
  }, [position, displaySubset, drawWheel]);

  // Handle spin trigger
  useEffect(() => {
    if (isSpinning && !isAnimatingRef.current && targetTicketNumber) {
      isAnimatingRef.current = true;
      hasSwappedRef.current = false;
      spin();
    } else if (!isSpinning && isAnimatingRef.current) {
      cancel();
      isAnimatingRef.current = false;
      hasSwappedRef.current = false;
    }
  }, [isSpinning, targetTicketNumber, spin, cancel]);

  return (
    <div className="flex justify-center">
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className={`rounded-xl ${className || ""}`}
        style={{
          display: "block",
          maxWidth: "100%",
          height: "auto",
        }}
      />
    </div>
  );
}
