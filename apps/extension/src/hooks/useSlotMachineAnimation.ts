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
  onMaxVelocity?: () => number | void; // Callback when max velocity is reached, returns new winner index
  getParticipants?: () => Participant[]; // Get current participants (may have changed)
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
  onMaxVelocity,
  getParticipants,
}: UseSlotMachineAnimationProps) {
  const animationRef = useRef<number>();

  const spin = useCallback(() => {
    // Get initial participants
    let currentParticipants = getParticipants ? getParticipants() : participants;
    let wheelCircumference = currentParticipants.length * itemHeight;

    // Find the target participant in the initial subset
    const normalizedTarget = normalizeTicketNumber(targetTicketNumber);
    const winnerIndex = currentParticipants.findIndex(
      (p) => normalizeTicketNumber(p.ticketNumber) === normalizedTarget
    );

    // If winner not in initial subset, spin to middle (will be corrected after swap)
    let targetIndex = winnerIndex !== -1 ? winnerIndex : Math.floor(currentParticipants.length / 2);
    let winner = currentParticipants[targetIndex];

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

    let totalDistance = extraDistance + forwardDistance;
    let finalPosition = startPos + totalDistance;

    // VERIFY CALCULATION - FIXED
    const testFinalNorm =
      ((finalPosition % wheelCircumference) + wheelCircumference) % wheelCircumference;
    const testTopIndex = Math.floor(testFinalNorm / itemHeight);
    const testCenterIndex = (testTopIndex + 2) % currentParticipants.length;

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
      console.error('Will actually show:', currentParticipants[testCenterIndex]?.ticketNumber);
    }

    // Easing functions
    const easingFunctions = {
      slow: (t: number) => 1 - Math.pow(1 - t, 3),
      medium: (t: number) => 1 - Math.pow(1 - t, 2),
      fast: (t: number) => t,
    };
    const easing = easingFunctions[settings.decelerationRate];

    // Track if we've triggered max velocity callback
    let hasTriggeredMaxVelocity = false;
    let recalculatedTarget = false;
    const maxVelocityThreshold = 0.2; // Trigger at 20% progress when velocity is highest

    // Animation loop
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(progress);

      // Calculate current position
      let currentPos = startPos + totalDistance * easedProgress;

      // Trigger max velocity callback and recalculate if needed
      if (
        !hasTriggeredMaxVelocity &&
        progress >= maxVelocityThreshold &&
        progress < 0.4 &&
        onMaxVelocity
      ) {
        hasTriggeredMaxVelocity = true;
        const newWinnerIndex = onMaxVelocity();

        if (typeof newWinnerIndex === 'number' && newWinnerIndex >= 0 && !recalculatedTarget) {
          recalculatedTarget = true;

          // Get updated participants after swap
          currentParticipants = getParticipants ? getParticipants() : participants;
          wheelCircumference = currentParticipants.length * itemHeight;

          // Update target with new index
          targetIndex = newWinnerIndex;
          winner = currentParticipants[targetIndex];

          // Recalculate target position for new subset
          let requiredTopIndex = targetIndex - 2;
          if (requiredTopIndex < 0) {
            requiredTopIndex += currentParticipants.length;
          }
          const newTargetPosition = requiredTopIndex * itemHeight;

          // Calculate how much distance we've already traveled
          const distanceTraveled = currentPos - startPos;

          // Calculate remaining distance to new target
          const currentNormalized =
            ((currentPos % wheelCircumference) + wheelCircumference) % wheelCircumference;
          let newForwardDistance = newTargetPosition - currentNormalized;
          if (newForwardDistance <= 0) {
            newForwardDistance += wheelCircumference;
          }

          // Add some extra spins for effect
          const remainingSpins = 2 + Math.random();
          const newTotalDistance =
            distanceTraveled + remainingSpins * wheelCircumference + newForwardDistance;

          // Update animation parameters
          totalDistance = newTotalDistance;
          finalPosition = startPos + totalDistance;

          // Recalculate current position with new total distance
          currentPos = startPos + totalDistance * easedProgress;
        }
      }

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
    itemHeight,
    setCurrentPosition,
    drawWheel,
    onSpinComplete,
    onError,
    onMaxVelocity,
    getParticipants,
  ]);

  const cancel = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }
  }, []);

  return { spin, cancel };
}
