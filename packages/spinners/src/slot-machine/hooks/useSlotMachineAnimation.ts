/**
 * useSlotMachineAnimation Hook
 *
 * Manages the animation logic for the slot machine spinner,
 * including physics calculations and subset swapping.
 */

import { useCallback, useRef } from "react";
import { Participant, SpinnerSettings } from "@raffle-spinner/storage";
import { normalizeTicketNumber, logger } from "@raffle-spinner/utils";

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
        (p) => normalizeTicketNumber(p.ticketNumber) === normalizedTarget,
      );
    },
    [targetTicketNumber],
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
    const currentParticipants = getParticipants
      ? getParticipants()
      : initialParticipants;

    if (currentParticipants.length === 0) {
      onError?.("No participants available");
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
      logger.debug(
        `Ticket ${targetTicket} not in initial subset, will swap at max velocity`,
        {
          component: "useSlotMachineAnimation",
          metadata: { targetTicket },
        },
      );
    } else {
      winner = foundWinner;
    }

    // Calculate winner's position in the current subset
    let winnerIndex = currentParticipants.findIndex(
      (p) =>
        normalizeTicketNumber(p.ticketNumber) ===
        normalizeTicketNumber(targetTicketNumber),
    );

    // If winner not in current subset, spin to middle (will be corrected after swap)
    if (winnerIndex === -1) {
      winnerIndex = Math.floor(currentParticipants.length / 2);
    }

    // Calculate physics for the spin
    const wheelCircumference = currentParticipants.length * itemHeight;
    const targetPosition = winnerIndex * itemHeight;

    // Calculate spin duration and distance
    const duration = settings.minSpinDuration * 1000; // Convert to ms
    const minRotations = 5;
    const maxRotations = 8;
    const rotations =
      minRotations + Math.random() * (maxRotations - minRotations);
    const totalDistance = rotations * wheelCircumference + targetPosition;

    const physics = {
      duration,
      totalDistance,
      startPosition: 0,
      finalPosition: targetPosition,
    };

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

      // Trigger onMaxVelocity callback at 20% progress
      if (
        !hasTriggeredMaxVelocity &&
        progress >= 0.2 &&
        progress < 0.4 &&
        onMaxVelocity
      ) {
        hasTriggeredMaxVelocity = true;
        const newWinnerIndex = onMaxVelocity();

        // If subset changed and we got a new winner index, recalculate physics
        if (
          typeof newWinnerIndex === "number" &&
          newWinnerIndex >= 0 &&
          !recalculatedTarget
        ) {
          recalculatedTarget = true;

          // Get updated participants after subset swap
          const updatedParticipants = getParticipants
            ? getParticipants()
            : currentParticipants;

          // Update the winner reference to the actual winner in the new subset
          const actualWinner = findWinner(updatedParticipants);
          if (actualWinner) {
            winner = actualWinner;
          }

          // Recalculate physics for new winner position
          const updatedCircumference = updatedParticipants.length * itemHeight;
          const newTargetPosition = newWinnerIndex * itemHeight;
          const remainingDuration = physics.duration * 0.8; // Slightly shorter for second part
          const remainingRotations = 3 + Math.random() * 2;
          const remainingDistance =
            remainingRotations * updatedCircumference + newTargetPosition;

          recalculatedPhysics = {
            duration: remainingDuration,
            totalDistance: remainingDistance,
            startPosition: 0,
            finalPosition: newTargetPosition,
          };

          // Adjust the start time to account for progress already made
          startTimeRef.current = currentTime - elapsed * 0.2; // Keep 20% of progress
        }
      }

      // Calculate position based on easing
      let position: number;
      if (progress < 1) {
        // Use cubic ease-out for smooth deceleration
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        position =
          recalculatedPhysics.startPosition +
          recalculatedPhysics.totalDistance * easeOutCubic;
      } else {
        // Snap to final position
        position = recalculatedPhysics.finalPosition;
      }

      // Update position
      onPositionUpdate(position);

      // Continue or complete animation
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
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
