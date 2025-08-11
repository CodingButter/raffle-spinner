/**
 * Spin Animation Hook
 *
 * Purpose: Manages the animation logic for the slot machine wheel,
 * including physics calculations and animation frame updates.
 *
 * SRS Reference:
 * - FR-2.2: Winner Selection and Animation
 * - FR-1.7: Spinner Physics Configuration
 */

import { useRef, useCallback } from 'react';
import { Participant, SpinnerSettings } from '@raffle-spinner/storage';
import { SpinnerPhysics } from '@raffle-spinner/spinner-physics';

interface UseSpinAnimationProps {
  participants: Participant[];
  targetTicketNumber: string;
  settings: SpinnerSettings;
  onSpinComplete: (winner: Participant) => void;
  itemHeight: number;
  wheelCircumference: number;
  currentPosition: number;
  setCurrentPosition: (position: number) => void;
  drawWheel: (position: number) => void;
}

export function useSpinAnimation({
  participants,
  targetTicketNumber,
  settings,
  onSpinComplete,
  itemHeight,
  wheelCircumference,
  currentPosition,
  setCurrentPosition,
  drawWheel,
}: UseSpinAnimationProps) {
  const animationRef = useRef<number>();
  const physics = useRef(new SpinnerPhysics());

  const animate = useCallback(() => {
    const targetIndex = participants.findIndex((p) => p.ticketNumber === targetTicketNumber);
    if (targetIndex === -1) return;

    // Calculate target position (center of viewport)
    const targetPosition = targetIndex * itemHeight;

    const spinConfig = {
      targetIndex,
      totalItems: participants.length,
      minDuration: settings.minSpinDuration,
      decelerationRate: settings.decelerationRate,
    };

    const animation = physics.current.calculateSpinAnimation(spinConfig);
    const startTime = Date.now();
    const startPosition = currentPosition;

    // Add extra rotations for effect
    const extraRotations = 3 + Math.random() * 2;
    const totalDistance =
      extraRotations * wheelCircumference + targetPosition - (startPosition % wheelCircumference);

    const spin = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animation.duration, 1);
      const easedProgress = animation.easing(progress);

      const position = startPosition + totalDistance * easedProgress;
      setCurrentPosition(position);
      drawWheel(position);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(spin);
      } else {
        const winner = participants[targetIndex];
        onSpinComplete(winner);
      }
    };

    spin();
  }, [
    participants,
    targetTicketNumber,
    settings,
    currentPosition,
    wheelCircumference,
    itemHeight,
    setCurrentPosition,
    drawWheel,
    onSpinComplete,
  ]);

  const cancelAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, []);

  return { animate, cancelAnimation };
}
