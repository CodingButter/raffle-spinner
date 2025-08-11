/**
 * Slot Machine Wheel Component - Version 2 (Complete Rewrite)
 *
 * A cleaner implementation of the slot machine wheel visualization.
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import { Participant, SpinnerSettings } from '@raffle-spinner/storage';
import { useSlotMachineAnimation } from '@/hooks/useSlotMachineAnimation';
import { drawWheelSegment } from './wheel/WheelSegment';
import { drawWheelFrame } from './wheel/WheelFrame';

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

export function SlotMachineWheelV2({
  participants,
  targetTicketNumber,
  settings,
  isSpinning,
  onSpinComplete,
  onError,
}: SlotMachineWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [position, setPosition] = useState(0);
  const isAnimatingRef = useRef(false);

  // Draw the wheel at a given position
  const drawWheel = useCallback(
    (currentPosition: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

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

      // Calculate wheel position
      const wheelCircumference = participants.length * ITEM_HEIGHT;
      const normalizedPos =
        ((currentPosition % wheelCircumference) + wheelCircumference) % wheelCircumference;

      // Determine which participant is at the top of the viewport
      const topParticipantIndex = Math.floor(normalizedPos / ITEM_HEIGHT);
      const pixelOffset = normalizedPos % ITEM_HEIGHT;

      // Draw participants from top to bottom
      // We draw extra ones above and below for smooth scrolling
      for (let i = -2; i <= VISIBLE_ITEMS + 2; i++) {
        // Calculate which participant to draw
        let participantIndex = (topParticipantIndex + i) % participants.length;
        if (participantIndex < 0) {
          participantIndex += participants.length;
        }

        const participant = participants[participantIndex];
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
    [participants]
  );

  // Animation hook
  const { spin, cancel } = useSlotMachineAnimation({
    participants,
    targetTicketNumber,
    settings,
    onSpinComplete: (winner) => {
      isAnimatingRef.current = false;
      onSpinComplete(winner);
    },
    onError: (error) => {
      isAnimatingRef.current = false;
      if (onError) onError(error);
    },
    itemHeight: ITEM_HEIGHT,
    currentPosition: position,
    setCurrentPosition: setPosition,
    drawWheel,
  });

  // Handle spin start/stop
  useEffect(() => {
    if (isSpinning && !isAnimatingRef.current) {
      // console.log('[SlotMachineWheelV2] Starting spin');
      isAnimatingRef.current = true;
      spin();
    } else if (!isSpinning && isAnimatingRef.current) {
      // console.log('[SlotMachineWheelV2] Cancelling spin');
      isAnimatingRef.current = false;
      cancel();
    }
  }, [isSpinning, spin, cancel]);

  // Draw wheel when position changes
  useEffect(() => {
    drawWheel(position);
  }, [position, drawWheel]);

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
