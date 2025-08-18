/**
 * Custom hook for managing participant subsets in the slot machine wheel
 * Handles subset creation, winner positioning, and swap logic for performance optimization
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Participant } from '@raffle-spinner/storage';
import { normalizeTicketNumber } from '@drawday/utils';

export interface UseSubsetManagerProps {
  participants: Participant[];
  targetTicketNumber: string;
  itemHeight: number;
}

// Subset configuration constants
const SUBSET_SIZE = 100; // Total entries to show in the wheel (50 first + 50 last)
const SUBSET_HALF = 50; // Half of the subset size

export function useSubsetManager({
  participants,
  targetTicketNumber,
  itemHeight,
}: UseSubsetManagerProps) {
  const [displaySubset, setDisplaySubset] = useState<Participant[]>([]);
  const [position, setPosition] = useState(0);
  
  const hasSwappedRef = useRef(false);
  const hasInitializedRef = useRef(false);
  const lastParticipantsRef = useRef(participants);
  const finalPositionRef = useRef<number | null>(null);

  // Sort participants by ticket number to get consistent ordering - MEMOIZED
  const sortedParticipants = useMemo(() => {
    return [...participants].sort((a, b) => {
      const aNum = parseInt(a.ticketNumber.replace(/\D/g, '')) || 0;
      const bNum = parseInt(b.ticketNumber.replace(/\D/g, '')) || 0;
      return aNum - bNum;
    });
  }, [participants]);

  /**
   * Creates a new subset with the winner positioned for optimal animation.
   * Places the winner approximately in the middle of the 100-entry subset
   * to ensure smooth animation and proper landing.
   *
   * @returns Subset of participants with winner positioned centrally
   */
  const createWinnerSubset = useCallback(() => {
    // Find the winner in sorted participants
    const normalizedTarget = normalizeTicketNumber(targetTicketNumber);
    const winnerIndex = sortedParticipants.findIndex(
      (p) => normalizeTicketNumber(p.ticketNumber) === normalizedTarget
    );

    if (winnerIndex === -1) {
      // Winner not found - shouldn't happen as validation is in SidePanel
      // Fallback to initial subset pattern
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
      // Winner is in the first half, need to wrap around from the end
      // Fix: properly handle negative indices by adding array length
      const wrapStartIdx = sortedParticipants.length + startIdx;
      const fromEnd = sortedParticipants.slice(wrapStartIdx);
      const fromStart = sortedParticipants.slice(0, winnerIndex + halfSize);
      subset.push(...fromEnd, ...fromStart);
    } else if (startIdx + SUBSET_SIZE > sortedParticipants.length) {
      // Winner is in the last half, need to wrap around to the beginning
      const fromMiddle = sortedParticipants.slice(startIdx);
      const fromBeginning = sortedParticipants.slice(0, SUBSET_SIZE - fromMiddle.length);
      subset.push(...fromMiddle, ...fromBeginning);
    } else {
      // Winner is in the middle, can take a continuous slice
      subset.push(...sortedParticipants.slice(startIdx, startIdx + SUBSET_SIZE));
    }

    return subset;
  }, [sortedParticipants, targetTicketNumber]);

  /**
   * Handles the subset swap at maximum velocity.
   * This creates the illusion of an infinite wheel while maintaining performance.
   *
   * @returns New index of the winner in the swapped subset, or -1 if already swapped
   */
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

  /**
   * Finds the winner in the complete participant list.
   * Necessary because the animation works with a subset.
   *
   * @returns The winning participant or undefined if not found
   */
  const findWinnerInFullList = useCallback(() => {
    const normalizedTarget = normalizeTicketNumber(targetTicketNumber);
    return participants.find((p) => normalizeTicketNumber(p.ticketNumber) === normalizedTarget);
  }, [participants, targetTicketNumber]);

  /**
   * Resets the subset manager state for a new competition
   */
  const resetState = useCallback(() => {
    hasInitializedRef.current = false;
    hasSwappedRef.current = false;
    finalPositionRef.current = null;
    setPosition(0);
  }, []);

  /**
   * Initialize with a subset containing first 50 and last 50 entries
   * This creates the illusion of a complete wheel that wraps around
   */
  useEffect(() => {
    // Check if participants have actually changed (new competition)
    const participantsChanged = participants !== lastParticipantsRef.current;
    
    if (participantsChanged) {
      // New competition - reset everything
      resetState();
      lastParticipantsRef.current = participants;
    }
    
    // Only initialize if not already initialized or if participants changed
    if (hasInitializedRef.current && !participantsChanged) {
      return;
    }
    
    if (sortedParticipants.length > 0) {
      hasInitializedRef.current = true; // Mark as initialized
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
                Math.min(sortedParticipants.length, SUBSET_SIZE - repeated.length)
              )
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

      // Only set initial position if we don't have a final position stored
      if (finalPositionRef.current === null) {
        // Start with the first ticket centered in view
        // The center position is at index 2 (VISIBLE_ITEMS / 2, rounded down)
        // To center the first ticket, we need to move up by 2 positions
        const startPosition = -2 * itemHeight;
        setPosition(startPosition);
      }
    }
  }, [sortedParticipants, itemHeight, resetState]);

  return {
    displaySubset,
    position,
    setPosition,
    handleMaxVelocity,
    findWinnerInFullList,
    resetState,
    finalPositionRef,
    hasSwappedRef,
  };
}