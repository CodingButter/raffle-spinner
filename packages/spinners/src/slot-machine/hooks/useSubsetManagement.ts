/**
 * Hook for managing participant subset in slot machine wheel
 * Handles subset creation, swapping, and winner positioning
 * 
 * @module useSubsetManagement
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Participant } from '@raffle-spinner/storage';
import { normalizeTicketNumber } from '@drawday/utils';

// Subset configuration
const SUBSET_SIZE = 100; // Total entries to show in the wheel (50 first + 50 last)
const SUBSET_HALF = 50; // Half of the subset size
const ITEM_HEIGHT = 80;

interface UseSubsetManagementProps {
  participants: Participant[];
  targetTicketNumber: string;
}

export function useSubsetManagement({ 
  participants, 
  targetTicketNumber 
}: UseSubsetManagementProps) {
  const [displaySubset, setDisplaySubset] = useState<Participant[]>([]);
  const [position, setPosition] = useState(0);
  
  const hasSwappedRef = useRef(false);
  const hasInitializedRef = useRef(false);
  const lastParticipantsRef = useRef(participants);
  const finalPositionRef = useRef<number | null>(null);
  const currentSubsetRef = useRef<Participant[]>([]);

  // Sort participants by ticket number to get consistent ordering
  const sortedParticipants = useMemo(() => {
    return [...participants].sort((a, b) => {
      const aNum = parseInt(a.ticketNumber.replace(/\D/g, '')) || 0;
      const bNum = parseInt(b.ticketNumber.replace(/\D/g, '')) || 0;
      return aNum - bNum;
    });
  }, [participants]);

  // Initialize with a subset containing first 50 and last 50 entries
  useEffect(() => {
    const participantsChanged = participants !== lastParticipantsRef.current;
    
    if (participantsChanged) {
      hasInitializedRef.current = false;
      hasSwappedRef.current = false;
      finalPositionRef.current = null;
      lastParticipantsRef.current = participants;
    }
    
    if (hasInitializedRef.current && !participantsChanged) {
      return;
    }
    
    if (sortedParticipants.length > 0) {
      hasInitializedRef.current = true;
      let initialSubset: Participant[];

      if (sortedParticipants.length <= SUBSET_SIZE) {
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
        const firstHalf = sortedParticipants.slice(0, SUBSET_HALF);
        const lastHalf = sortedParticipants.slice(-SUBSET_HALF);
        initialSubset = [...firstHalf, ...lastHalf];
      }

      setDisplaySubset(initialSubset);

      if (finalPositionRef.current === null) {
        const startPosition = -2 * ITEM_HEIGHT;
        setPosition(startPosition);
      }
    }
  }, [sortedParticipants]);

  // Update current subset ref
  useEffect(() => {
    currentSubsetRef.current = displaySubset;
  }, [displaySubset]);

  /**
   * Creates a new subset with the winner positioned for optimal animation
   */
  const createWinnerSubset = useCallback(() => {
    const normalizedTarget = normalizeTicketNumber(targetTicketNumber);
    const winnerIndex = sortedParticipants.findIndex(
      (p) => normalizeTicketNumber(p.ticketNumber) === normalizedTarget
    );

    if (winnerIndex === -1) {
      if (sortedParticipants.length <= SUBSET_SIZE) {
        return sortedParticipants;
      }
      const firstHalf = sortedParticipants.slice(0, SUBSET_HALF);
      const lastHalf = sortedParticipants.slice(-SUBSET_HALF);
      return [...firstHalf, ...lastHalf];
    }

    if (sortedParticipants.length <= SUBSET_SIZE) {
      return [...sortedParticipants];
    }

    const subset: Participant[] = [];
    const halfSize = Math.floor(SUBSET_SIZE / 2);
    const startIdx = winnerIndex - halfSize;

    if (startIdx < 0) {
      const wrapStartIdx = sortedParticipants.length + startIdx;
      const fromEnd = sortedParticipants.slice(wrapStartIdx);
      const fromStart = sortedParticipants.slice(0, winnerIndex + halfSize);
      subset.push(...fromEnd, ...fromStart);
    } else if (startIdx + SUBSET_SIZE > sortedParticipants.length) {
      const fromMiddle = sortedParticipants.slice(startIdx);
      const fromBeginning = sortedParticipants.slice(0, SUBSET_SIZE - fromMiddle.length);
      subset.push(...fromMiddle, ...fromBeginning);
    } else {
      subset.push(...sortedParticipants.slice(startIdx, startIdx + SUBSET_SIZE));
    }

    return subset;
  }, [sortedParticipants, targetTicketNumber]);

  /**
   * Handles the subset swap at maximum velocity
   */
  const handleMaxVelocity = useCallback(() => {
    if (!hasSwappedRef.current) {
      hasSwappedRef.current = true;
      const winnerSubset = createWinnerSubset();
      
      const normalizedTarget = normalizeTicketNumber(targetTicketNumber);
      const newWinnerIndex = winnerSubset.findIndex(
        (p) => normalizeTicketNumber(p.ticketNumber) === normalizedTarget
      );

      setDisplaySubset(winnerSubset);
      return newWinnerIndex;
    }
    return -1;
  }, [createWinnerSubset, targetTicketNumber]);

  /**
   * Finds the winner in the complete participant list
   */
  const findWinnerInFullList = useCallback(() => {
    const normalizedTarget = normalizeTicketNumber(targetTicketNumber);
    return participants.find((p) => normalizeTicketNumber(p.ticketNumber) === normalizedTarget);
  }, [participants, targetTicketNumber]);

  const resetSwapFlag = useCallback(() => {
    hasSwappedRef.current = false;
  }, []);

  const updatePosition = useCallback((pos: number) => {
    setPosition(pos);
    finalPositionRef.current = pos;
  }, []);

  return {
    displaySubset,
    position,
    finalPosition: finalPositionRef.current,
    currentSubsetRef,
    hasSwappedRef,
    handleMaxVelocity,
    findWinnerInFullList,
    resetSwapFlag,
    updatePosition,
  };
}