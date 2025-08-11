/**
 * Slot Machine Animation Hook - Complete Rewrite
 *
 * This hook manages the slot machine wheel animation with clear position tracking.
 * Position represents the Y-offset of the wheel in pixels.
 */

import { useRef, useCallback } from 'react';
import { Participant, SpinnerSettings } from '@raffle-spinner/storage';
import { normalizeTicketNumber } from '@/lib/utils';

interface UseSlotMachineAnimationProps {
  participants: Participant[];
  targetTicketNumber: string;
  settings: SpinnerSettings;
  onSpinComplete: (winner: Participant) => void;
  onError?: (error: string) => void;
  itemHeight: number;
  currentPosition: number;
  setCurrentPosition: (position: number) => void;
  drawWheel: (position: number) => void;
}

export function useSlotMachineAnimation({
  participants,
  targetTicketNumber,
  settings,
  onSpinComplete,
  onError,
  itemHeight,
  currentPosition,
  setCurrentPosition,
  drawWheel,
}: UseSlotMachineAnimationProps) {
  const animationRef = useRef<number>();
  const wheelCircumference = participants.length * itemHeight;

  const spin = useCallback(() => {
    // console.log('=== STARTING SLOT MACHINE SPIN ===');

    // Find the target participant in the subset
    const normalizedTarget = normalizeTicketNumber(targetTicketNumber);
    const winnerIndex = participants.findIndex(
      (p) => normalizeTicketNumber(p.ticketNumber) === normalizedTarget
    );

    // If winner not in subset, just spin to the middle position
    // The actual winner will be determined by the parent component
    const targetIndex = winnerIndex !== -1 ? winnerIndex : Math.floor(participants.length / 2);
    const winner = participants[targetIndex];
    // console.log(`Target: ${winner.ticketNumber} at index ${targetIndex}`);

    // Animation setup
    const duration = settings.minSpinDuration * 1000;
    const startTime = Date.now();
    const startPos = currentPosition;

    // Calculate target position
    // In the slot machine, we have a viewport showing 5 items
    // The center (winning) position is the 3rd item (index 2 in 0-based)
    // If we want participant at index X to be in the center:
    // - We need to scroll so that participant X-2 is at the top of the viewport
    // - Position = (X - 2) * itemHeight

    // But we need to handle the circular nature of the wheel
    // Position represents how many pixels we've scrolled down from participant 0
    // After a full rotation, we're back at participant 0

    // CRITICAL POSITION CALCULATION - FIXED
    // The wheel visual layout shows items at positions: -2, -1, 0, 1, 2 (CENTER), 3, 4
    // When position = P pixels:
    //   - topIndex = floor(P / itemHeight)
    //   - Center item is at topIndex + 2
    //
    // To show targetIndex at CENTER:
    //   - We need topIndex such that (topIndex + 2) % participants.length = targetIndex
    //   - Therefore: topIndex = targetIndex - 2
    //   - If negative, add participants.length to wrap around

    let requiredTopIndex = targetIndex - 2;
    if (requiredTopIndex < 0) {
      requiredTopIndex += participants.length;
    }
    const targetPositionNormalized = requiredTopIndex * itemHeight;

    // Debug: Position calculation
    // console.log('🎯 Position Math:', {
    //   targetIndex,
    //   requiredTopIndex,
    //   targetPositionNormalized,
    //   willShowAtCenter: participants[(requiredTopIndex + 2) % participants.length]?.ticketNumber,
    //   expectedTicket: winner.ticketNumber,
    // });

    // Add extra rotations for effect (3-5 full spins)
    const extraSpins = 3 + Math.random() * 2;
    const extraDistance = extraSpins * wheelCircumference;

    // Calculate total distance to travel
    // We always spin forward, so find the forward distance
    const currentNormalized =
      ((startPos % wheelCircumference) + wheelCircumference) % wheelCircumference;
    let forwardDistance = targetPositionNormalized - currentNormalized;
    if (forwardDistance <= 0) {
      forwardDistance += wheelCircumference;
    }

    const totalDistance = extraDistance + forwardDistance;
    const finalPosition = startPos + totalDistance;

    // VERIFY CALCULATION - FIXED
    const testFinalNorm =
      ((finalPosition % wheelCircumference) + wheelCircumference) % wheelCircumference;
    const testTopIndex = Math.floor(testFinalNorm / itemHeight);
    const testCenterIndex = (testTopIndex + 2) % participants.length;

    // Debug: Animation target
    // console.log('🎯 Animation Target:', {
    //   targetTicket: winner.ticketNumber,
    //   targetIndex,
    //   requiredTopIndex,
    //   targetPositionNormalized,
    //   currentNormalized,
    //   forwardDistance,
    //   totalDistance,
    //   finalPosition: finalPosition.toFixed(2),
    //   verification: {
    //     testTopIndex,
    //     testCenterIndex,
    //     testCenterTicket: participants[testCenterIndex]?.ticketNumber,
    //     isCorrect: testCenterIndex === targetIndex ? '✅ WILL BE CORRECT' : '❌ WILL BE WRONG'
    //   }
    // });

    if (testCenterIndex !== targetIndex) {
      console.error('⚠️ PRE-FLIGHT CHECK FAILED - Calculation will be wrong!');
      console.error('Expected to show:', winner.ticketNumber);
      console.error('Will actually show:', participants[testCenterIndex]?.ticketNumber);
    }

    // Easing functions
    const easingFunctions = {
      slow: (t: number) => 1 - Math.pow(1 - t, 3),
      medium: (t: number) => 1 - Math.pow(1 - t, 2),
      fast: (t: number) => t,
    };
    const easing = easingFunctions[settings.decelerationRate];

    // Animation loop
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(progress);

      // Calculate current position
      const currentPos = startPos + totalDistance * easedProgress;

      // Update position and redraw
      setCurrentPosition(currentPos);
      drawWheel(currentPos);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete - verify we're at the right position
        setCurrentPosition(finalPosition);
        drawWheel(finalPosition);

        // Verify what's displayed - CRITICAL FIX
        const finalNorm =
          ((finalPosition % wheelCircumference) + wheelCircumference) % wheelCircumference;
        const topIndex = Math.floor(finalNorm / itemHeight);
        const centerIndex = (topIndex + 2) % participants.length;

        // Only log if there's an error
        if (centerIndex !== targetIndex) {
          console.error('=== SPIN ERROR ===');
          console.error(`Target winner: ${winner.ticketNumber} (index ${targetIndex})`);
          console.error(
            `Center shows: ${participants[centerIndex].ticketNumber} (index ${centerIndex})`
          );
        }

        if (centerIndex !== targetIndex) {
          console.error('🚨 CRITICAL ERROR: Wrong ticket displayed!');
          console.error(`Should show: ${winner.ticketNumber}`);
          console.error(`Actually showing: ${participants[centerIndex].ticketNumber}`);

          // FORCE CORRECTION - Adjust position to show correct winner
          let correctTopIndex = targetIndex - 2;
          if (correctTopIndex < 0) {
            correctTopIndex += participants.length;
          }
          const correctPosition = correctTopIndex * itemHeight;

          console.warn('Applying position correction:', correctPosition);
          setCurrentPosition(correctPosition);
          drawWheel(correctPosition);

          // Verify correction worked
          const correctedTopIndex = Math.floor(correctPosition / itemHeight);
          const correctedCenterIndex = (correctedTopIndex + 2) % participants.length;
          console.log('After correction:', {
            correctedCenterIndex,
            correctedTicket: participants[correctedCenterIndex]?.ticketNumber,
            isNowCorrect: correctedCenterIndex === targetIndex,
          });
        }

        animationRef.current = undefined;
        onSpinComplete(winner);
      }
    };

    animate();
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

  const cancel = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }
  }, []);

  return { spin, cancel };
}
