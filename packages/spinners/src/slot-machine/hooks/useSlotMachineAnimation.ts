/**
 * useSlotMachineAnimation Hook
 *
 * Manages the animation logic for the slot machine spinner,
 * including physics calculations and subset swapping.
 */

import { useCallback, useRef } from 'react';
import { Participant, SpinnerSettings } from '@raffle-spinner/storage';
import { normalizeTicketNumber, logger } from '@drawday/utils';

interface AnimationOptions {
  participants: Participant[];
  targetTicketNumber: string;
  settings: SpinnerSettings;
  onSpinComplete: (winner: Participant) => void;
  onError?: (error: string) => void;
  onPositionUpdate: (position: number) => void;
  getParticipants?: () => Participant[];
  onMaxVelocity?: () => number;
  itemHeight?: number;
}

interface AnimationControls {
  spin: () => void;
  cancel: () => void;
}

// Animation constants
const ITEM_HEIGHT = 80;

export function useSlotMachineAnimation({
  participants: initialParticipants,
  targetTicketNumber,
  settings,
  onSpinComplete,
  onError,
  onPositionUpdate,
  getParticipants,
  onMaxVelocity,
  itemHeight = ITEM_HEIGHT,
}: AnimationOptions): AnimationControls {
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const isSpinningRef = useRef(false);

  /**
   * Find the winner participant by ticket number
   */
  const findWinner = useCallback(
    (searchParticipants: Participant[]): Participant | undefined => {
      const normalizedTarget = normalizeTicketNumber(targetTicketNumber);
      return searchParticipants.find(
        (p) => normalizeTicketNumber(p.ticketNumber) === normalizedTarget
      );
    },
    [targetTicketNumber]
  );

  /**
   * Cancel any ongoing animation
   */
  const cancel = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    isSpinningRef.current = false;
  }, []);

  /**
   * Start the spin animation
   */
  const spin = useCallback(() => {
    // Prevent multiple simultaneous spins
    if (isSpinningRef.current) {
      return;
    }

    // Get current participants
    const currentParticipants = getParticipants ? getParticipants() : initialParticipants;

    if (currentParticipants.length === 0) {
      onError?.('No participants available');
      return;
    }

    // Try to find winner in current subset first
    const foundWinner = findWinner(currentParticipants);

    // Store the actual target ticket for later reference
    const targetTicket = targetTicketNumber;

    // If not found in subset, it might be in the full list (will be swapped in at max velocity)
    // For now, use a placeholder from the middle of the current subset
    let winner: Participant;
    if (!foundWinner) {
      // The actual winner will be found after subset swap at max velocity
      // For now, just start spinning to the middle position
      const middleIndex = Math.floor(currentParticipants.length / 2);
      winner = currentParticipants[middleIndex];

      // Don't error here - the subset will be swapped during animation
      logger.debug(`Ticket ${targetTicket} not in initial subset, will swap at max velocity`, {
        component: 'useSlotMachineAnimation',
        metadata: { targetTicket },
      });
    } else {
      winner = foundWinner;
    }

    // Calculate winner's position in the current subset
    let winnerIndex = currentParticipants.findIndex(
      (p) => normalizeTicketNumber(p.ticketNumber) === normalizeTicketNumber(targetTicketNumber)
    );

    logger.debug(`Initial spin setup`, {
      component: 'useSlotMachineAnimation',
      metadata: {
        targetTicket,
        winnerIndex,
        currentSubsetSize: currentParticipants.length,
        winnerFound: winnerIndex !== -1,
        winnerTicket: winnerIndex >= 0 ? currentParticipants[winnerIndex].ticketNumber : 'not found'
      }
    });

    // If winner not in current subset, spin to middle (will be corrected after swap)
    if (winnerIndex === -1) {
      winnerIndex = Math.floor(currentParticipants.length / 2);
      logger.debug(`Winner not in initial subset, using middle position`, {
        component: 'useSlotMachineAnimation',
        metadata: { middleIndex: winnerIndex }
      });
    }

    // Calculate physics for the spin
    const wheelCircumference = currentParticipants.length * itemHeight;
    // The center position is at index 2 (VISIBLE_ITEMS / 2), so we need to adjust
    // to put the winner at the center position, not at the top
    const CENTER_INDEX = 2; // The visual center of the slot machine
    const targetPosition = (winnerIndex - CENTER_INDEX) * itemHeight;
    
    console.log(`[Animation] Initial spin physics: ` + JSON.stringify({
      targetTicket: targetTicketNumber,
      winnerIndex,
      CENTER_INDEX,
      targetPosition,
      itemHeight,
      wheelCircumference,
      winnerAtIndex: currentParticipants[winnerIndex]?.ticketNumber
    }));

    // Calculate spin duration and distance
    const duration = settings.minSpinDuration * 1000; // Convert to ms
    const minRotations = 7;  // More initial rotations for faster start
    const maxRotations = 10; // Higher max for more dramatic spin
    const rotations = minRotations + Math.random() * (maxRotations - minRotations);

    // Make sure we end exactly at the target position by calculating total distance precisely
    const totalDistance = rotations * wheelCircumference + targetPosition;

    const physics = {
      duration,
      totalDistance,
      startPosition: 0,
      finalPosition: totalDistance, // Final position after traveling totalDistance from 0
    };
    
    // Log the initial physics setup
    console.log('[Animation] Initial physics: ' + JSON.stringify({
      startPosition: 0,
      totalDistance,
      finalPosition: totalDistance,
      targetPosition,
      rotations: parseFloat(rotations.toFixed(2)),
      expectedLanding: `After ${rotations.toFixed(1)} rotations, position ${totalDistance % wheelCircumference} (normalized)`
    }));

    // Track animation state
    isSpinningRef.current = true;
    startTimeRef.current = performance.now();
    let hasTriggeredMaxVelocity = false;
    let recalculatedPhysics = physics;
    let recalculatedTarget = false;

    // Animation loop
    const animate = (currentTime: number) => {
      if (!isSpinningRef.current) return;

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / recalculatedPhysics.duration, 1);

      // Trigger onMaxVelocity callback at 5% progress (very early during acceleration)
      // This makes the swap completely invisible as wheel is spinning extremely fast
      if (!hasTriggeredMaxVelocity && progress >= 0.05 && progress < 0.15 && onMaxVelocity) {
        hasTriggeredMaxVelocity = true;

        // Store the current position before the swap for continuity
        const currentPosition =
          recalculatedPhysics.startPosition +
          recalculatedPhysics.totalDistance * (1 - Math.pow(1 - progress, 3));

        const newWinnerIndex = onMaxVelocity();

        // If subset changed and we got a new winner index, recalculate physics
        if (typeof newWinnerIndex === 'number' && newWinnerIndex >= 0 && !recalculatedTarget) {
          recalculatedTarget = true;

          // Get updated participants after subset swap
          const updatedParticipants = getParticipants ? getParticipants() : currentParticipants;

          // Update the winner reference to the actual winner in the new subset
          const actualWinner = findWinner(updatedParticipants);
          if (actualWinner) {
            winner = actualWinner;
            
            logger.debug('Subset swapped - winner found', {
              component: 'useSlotMachineAnimation',
              metadata: {
                winnerIndex: 0, // Winner is always at index 0 in our new system
                winnerTicket: winner.ticketNumber,
                actualWinnerTicket: actualWinner.ticketNumber,
                subsetSize: updatedParticipants.length,
                firstInSubset: updatedParticipants[0]?.ticketNumber,
                lastInSubset: updatedParticipants[updatedParticipants.length - 1]?.ticketNumber,
                winnerAtIndex: updatedParticipants[0]?.ticketNumber // Winner is always at index 0
              }
            });
          }

          // Recalculate physics for new winner position
          const updatedCircumference = updatedParticipants.length * itemHeight;
          // The winner is always at index 0 in our new subset
          // To center it at visual position 2, we need final position = (0 - 2) * itemHeight = -160
          const CENTER_INDEX = 2;
          const newTargetPosition = (0 - CENTER_INDEX) * itemHeight; // Always -160 since winner is at index 0
          // Since we're swapping very early (5%), we have almost all the time remaining
          const remainingDuration = physics.duration * 0.92; // Almost full duration for smooth deceleration
          const remainingRotations = 5.5 + Math.random() * 2.5; // Many more rotations since swap is very early

          // The winner is at newWinnerIndex in the new subset
          // To center it at visual position 2, we need final position = (newWinnerIndex - 2) * itemHeight
          const exactFinalPosition = newTargetPosition;
          
          // Continue from current position but add more rotations to land exactly
          // We keep the animation smooth by continuing forward
          const continuePosition = currentPosition;
          
          // After subset swap, we need to land exactly at the position that centers the winner
          // The winner is at newWinnerIndex, center is at visual position 2
          // So we need final position = (newWinnerIndex - 2) * itemHeight = exactFinalPosition
          
          // We'll spin forward from current position and land exactly at the target
          const remainingDistance = (remainingRotations * updatedCircumference) + exactFinalPosition;
          
          // Verify the winner is actually at index 0 (our new subset structure)
          const verifyWinner = updatedParticipants[0]; // Winner is always at index 0
          console.log('[Animation] Physics after subset swap: ' + JSON.stringify({
            newWinnerIndex: 0, // Always 0 in our new system
            winnerTicket: verifyWinner?.ticketNumber,
            expectedTicket: targetTicketNumber,
            winnerCorrect: normalizeTicketNumber(verifyWinner?.ticketNumber || '') === normalizeTicketNumber(targetTicketNumber),
            CENTER_INDEX,
            exactFinalPosition,
            currentPosition: continuePosition,
            remainingDistance,
            remainingRotations,
            updatedCircumference,
            firstInSubset: updatedParticipants[0]?.ticketNumber,
            lastInSubset: updatedParticipants[updatedParticipants.length - 1]?.ticketNumber
          }));

          // Reset to a clean coordinate system after subset swap
          // We want to end at exactFinalPosition after spinning remainingDistance
          const resetStartPosition = 0;
          
          recalculatedPhysics = {
            duration: remainingDuration,
            totalDistance: remainingDistance,
            startPosition: resetStartPosition,
            finalPosition: exactFinalPosition, // Land exactly at the winner position
          };
          
          // Log the final calculation
          console.log('[Animation] Final position calculation: ' + JSON.stringify({
            resetStartPosition,
            remainingDistance,
            calculatedFinal: exactFinalPosition,
            expectedFinal: exactFinalPosition,
            shouldLandAt: `Position ${exactFinalPosition} should show ticket ${updatedParticipants[0]?.ticketNumber} at center`
          }));

          // Reset start time for the new animation segment
          startTimeRef.current = currentTime;
        }
      }

      // Calculate position based on easing
      // Use cubic ease-out for smooth deceleration
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const position =
        recalculatedPhysics.startPosition + recalculatedPhysics.totalDistance * easeOutCubic;

      // Update position
      onPositionUpdate(position);
      
      // Log position periodically for debugging - reduce frequency
      // Disable progress logging to clean up console
      if (false && Math.floor(progress * 100) % 25 === 0) {
        console.log('[Animation] Progress:', JSON.stringify({
          progress: (progress * 100).toFixed(1) + '%',
          position: parseFloat(position.toFixed(2)),
          startPos: recalculatedPhysics.startPosition,
          totalDist: recalculatedPhysics.totalDistance,
          finalPos: recalculatedPhysics.finalPosition
        }));
      }

      // Continue or complete animation
      if (progress < 0.999) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // For the final frame, use the EXACT final position from physics
        // This ensures we land precisely on the winner
        const finalExactPosition = recalculatedPhysics.finalPosition;
        onPositionUpdate(finalExactPosition);
        
        // Verify what's actually at the center
        const finalParticipants = getParticipants ? getParticipants() : currentParticipants;
        const finalWheelCircumference = finalParticipants.length * itemHeight;
        const normalizedFinalPos = ((finalExactPosition % finalWheelCircumference) + finalWheelCircumference) % finalWheelCircumference;
        const topIndex = Math.floor(normalizedFinalPos / itemHeight);
        const centerIndex = (topIndex + 2) % finalParticipants.length; // Center is 2 items down from top
        const actualCenterTicket = finalParticipants[centerIndex]?.ticketNumber;
        
        // Normalize ticket numbers for proper comparison (e.g., "018" vs "18")
        const normalizedTarget = normalizeTicketNumber(targetTicketNumber);
        const normalizedCenter = normalizeTicketNumber(actualCenterTicket || '');
        const isCorrect = normalizedCenter === normalizedTarget;
        
        console.log('[Animation] COMPLETE:', JSON.stringify({
          targetTicket: targetTicketNumber,
          winnerTicket: winner.ticketNumber,
          actualCenterTicket,
          finalPosition: finalExactPosition,
          normalizedFinalPos,
          topIndex,
          centerIndex,
          match: isCorrect ? '✅ CENTER CORRECT' : `❌ CENTER WRONG (got ${actualCenterTicket} instead of ${targetTicketNumber})`,
          normalized: { target: normalizedTarget, center: normalizedCenter, correct: isCorrect }
        }));

        // Animation complete
        isSpinningRef.current = false;
        animationRef.current = null;
        onSpinComplete(winner);
      }
    };

    // Start animation
    animationRef.current = requestAnimationFrame(animate);
  }, [
    initialParticipants,
    targetTicketNumber,
    settings,
    findWinner,
    onSpinComplete,
    onError,
    onPositionUpdate,
    getParticipants,
    onMaxVelocity,
    itemHeight,
  ]);

  return {
    spin,
    cancel,
  };
}
