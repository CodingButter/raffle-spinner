/**
 * Slot Machine Style Wheel Component (Refactored)
 *
 * Purpose: Main component that orchestrates the slot machine wheel visualization
 * using smaller, focused sub-components.
 *
 * SRS Reference:
 * - FR-2.2: Winner Selection and Animation
 * - FR-1.7: Spinner Physics Configuration
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import { Participant, SpinnerSettings } from '@raffle-spinner/storage';
import { useSpinAnimation } from '@/hooks/useSpinAnimation';
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

// Constants for the slot machine appearance
const VISIBLE_ITEMS = 5;
const ITEM_HEIGHT = 80;
const VIEWPORT_HEIGHT = VISIBLE_ITEMS * ITEM_HEIGHT;
const WHEEL_WIDTH = 350;
const PERSPECTIVE_SCALE = 0.15;

export function SlotMachineWheel({
  participants,
  targetTicketNumber,
  settings,
  isSpinning,
  onSpinComplete,
  onError,
}: SlotMachineWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentPosition, setCurrentPosition] = useState(0);
  const wheelCircumference = participants.length * ITEM_HEIGHT;
  const isAnimatingRef = useRef(false);

  const drawWheel = useCallback(
    (position: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, '#1a1a2e');
      bgGradient.addColorStop(0.5, '#0f0f23');
      bgGradient.addColorStop(1, '#1a1a2e');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Calculate visible segments
      const normalizedPosition =
        ((position % wheelCircumference) + wheelCircumference) % wheelCircumference;
      const startIndex = Math.floor(normalizedPosition / ITEM_HEIGHT);
      const offset = normalizedPosition % ITEM_HEIGHT;

      // Draw wheel segments
      for (let i = -2; i <= VISIBLE_ITEMS + 2; i++) {
        const itemIndex = (startIndex + i) % participants.length;
        const participant =
          participants[itemIndex < 0 ? itemIndex + participants.length : itemIndex];

        const yPos = i * ITEM_HEIGHT - offset + 40;

        drawWheelSegment({
          participant,
          yPos,
          itemIndex,
          itemHeight: ITEM_HEIGHT,
          viewportHeight: VIEWPORT_HEIGHT,
          wheelWidth: WHEEL_WIDTH,
          canvasWidth: canvas.width,
          perspectiveScale: PERSPECTIVE_SCALE,
          ctx,
        });
      }

      // Draw frame and decorations
      drawWheelFrame({
        ctx,
        canvasWidth: canvas.width,
        viewportHeight: VIEWPORT_HEIGHT,
      });
    },
    [participants, wheelCircumference]
  );

  const { animate, cancelAnimation } = useSpinAnimation({
    participants,
    targetTicketNumber,
    settings,
    onSpinComplete: (winner) => {
      console.log('Animation completed, resetting flag');
      isAnimatingRef.current = false;
      onSpinComplete(winner);
    },
    onError: (error) => {
      console.log('Animation error, resetting flag');
      isAnimatingRef.current = false;
      if (onError) onError(error);
    },
    itemHeight: ITEM_HEIGHT,
    wheelCircumference,
    currentPosition,
    setCurrentPosition,
    drawWheel,
  });

  useEffect(() => {
    if (isSpinning && !isAnimatingRef.current) {
      console.log('Starting animation from SlotMachineWheel');
      isAnimatingRef.current = true;
      animate();
    } else if (!isSpinning && isAnimatingRef.current) {
      console.log('Cancelling animation from SlotMachineWheel');
      isAnimatingRef.current = false;
      cancelAnimation();
    }
  }, [isSpinning, animate, cancelAnimation]);

  useEffect(() => {
    drawWheel(currentPosition);
  }, [currentPosition, drawWheel]);

  return (
    <div className="relative w-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black rounded-lg p-4">
      <canvas
        ref={canvasRef}
        width={400}
        height={500}
        className="max-w-full h-auto rounded-lg shadow-2xl"
        style={{ imageRendering: 'crisp-edges' }}
      />
    </div>
  );
}
