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
import { normalizeTicketNumber } from '@/lib/utils';

interface UseSpinAnimationProps {
  participants: Participant[];
  targetTicketNumber: string;
  settings: SpinnerSettings;
  onSpinComplete: (winner: Participant) => void;
  onError?: (error: string) => void;
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
  onError,
  itemHeight,
  wheelCircumference,
  currentPosition,
  setCurrentPosition,
  drawWheel,
}: UseSpinAnimationProps) {
  const animationRef = useRef<number>();

  const animate = useCallback(() => {
    console.log('Starting animation with ticket:', targetTicketNumber);
    console.log('Total participants:', participants.length);

    const normalizedTarget = normalizeTicketNumber(targetTicketNumber);
    console.log('Normalized target ticket:', normalizedTarget);

    const targetIndex = participants.findIndex(
      (p) => normalizeTicketNumber(p.ticketNumber) === normalizedTarget
    );

    console.log('Found target at index:', targetIndex);

    if (targetIndex === -1) {
      console.error(
        'Target ticket not found:',
        targetTicketNumber,
        'normalized:',
        normalizedTarget
      );
      console.error(
        'Available tickets (first 10):',
        participants.slice(0, 10).map((p) => ({
          original: p.ticketNumber,
          normalized: normalizeTicketNumber(p.ticketNumber),
        }))
      );

      if (onError) {
        onError(`Ticket number ${targetTicketNumber} not found in this competition`);
      }
      return;
    }

    // Target position calculation moved below for proper centering

    // For slot machine style, we'll create our own animation config
    // instead of using the angle-based physics
    const duration = settings.minSpinDuration * 1000; // Convert to milliseconds
    const easingFunction = {
      slow: (t: number) => 1 - Math.pow(1 - t, 3), // Cubic ease out
      medium: (t: number) => 1 - Math.pow(1 - t, 2), // Quadratic ease out
      fast: (t: number) => t, // Linear (no easing)
    }[settings.decelerationRate];

    console.log('Animation config:', {
      duration,
      decelerationRate: settings.decelerationRate,
      targetIndex,
    });

    const startTime = Date.now();
    const startPosition = currentPosition;

    // Add extra rotations for effect
    const extraRotations = 3 + Math.random() * 2;

    // The drawing loop shows items at positions:
    // i=-2: startIndex - 2
    // i=-1: startIndex - 1
    // i=0:  startIndex
    // i=1:  startIndex + 1
    // i=2:  startIndex + 2  <- CENTER (this should be our target)
    // i=3:  startIndex + 3
    // i=4:  startIndex + 4
    //
    // So for the target to be in center, we need: startIndex + 2 = targetIndex
    // Therefore: startIndex = targetIndex - 2
    // And position = startIndex * itemHeight = (targetIndex - 2) * itemHeight

    const finalPosition = (targetIndex - 2) * itemHeight;

    // Make sure final position is positive
    const adjustedFinalPosition =
      finalPosition < 0 ? finalPosition + wheelCircumference : finalPosition;

    // Calculate total distance to travel
    const totalDistance =
      extraRotations * wheelCircumference +
      (adjustedFinalPosition - (startPosition % wheelCircumference));

    console.log('Position calculation:', {
      targetIndex,
      participant: participants[targetIndex],
      finalPosition,
      adjustedFinalPosition,
      startPosition,
      totalDistance,
      duration,
      wheelCircumference,
    });

    let frameCount = 0;
    const spin = () => {
      frameCount++;
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Make sure we have a valid easing function
      const easedProgress = easingFunction ? easingFunction(progress) : progress;

      const position = startPosition + totalDistance * easedProgress;
      setCurrentPosition(position);
      drawWheel(position);

      if (frameCount % 60 === 0 || progress >= 1) {
        console.log('Animation progress:', {
          frame: frameCount,
          progress: (progress * 100).toFixed(2) + '%',
          elapsed: elapsed + 'ms',
          position,
          duration,
          shouldStop: progress >= 1,
        });
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(spin);
      } else {
        console.log('Animation complete! Calling onSpinComplete');
        console.log('Final progress:', progress);
        console.log('Target index:', targetIndex);
        const winner = participants[targetIndex];
        console.log('Winner:', winner);
        // Clear the animation ref
        animationRef.current = undefined;
        onSpinComplete(winner);
      }
    };

    // Start the animation
    console.log('Starting spin animation');
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
    onError,
  ]);

  const cancelAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, []);

  return { animate, cancelAnimation };
}
