/**
 * WinnerCalculator Component
 * 
 * Handles winner determination logic and subset creation for optimal animation.
 * Manages the positioning of winners within subsets for smooth landing.
 * 
 * @module WinnerCalculator
 */

import { Participant } from '@raffle-spinner/storage';
import { normalizeTicketNumber } from '@drawday/utils';
import { SUBSET_SIZE, SUBSET_HALF } from '../../constants';

/**
 * Creates a new subset with the winner positioned for optimal animation.
 * Places the winner approximately in the middle of the 100-entry subset
 * to ensure smooth animation and proper landing.
 * 
 * @param sortedParticipants - Sorted array of all participants
 * @param targetTicketNumber - The winning ticket number
 * @returns Subset of participants with winner positioned centrally
 */
export function createWinnerSubset(
  sortedParticipants: Participant[],
  targetTicketNumber: string
): Participant[] {
  // Find the winner in sorted participants
  const normalizedTarget = normalizeTicketNumber(targetTicketNumber);
  const winnerIndex = sortedParticipants.findIndex(
    (p) => normalizeTicketNumber(p.ticketNumber) === normalizedTarget
  );

  if (winnerIndex === -1) {
    // Winner not found - fallback to initial subset pattern
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
}

/**
 * Creates an initial subset for the wheel display.
 * Takes first 50 and last 50 entries to create wrap-around effect.
 * 
 * @param sortedParticipants - Sorted array of all participants
 * @returns Initial subset for display
 */
export function createInitialSubset(sortedParticipants: Participant[]): Participant[] {
  if (sortedParticipants.length === 0) {
    return [];
  }

  if (sortedParticipants.length <= SUBSET_SIZE) {
    // If we have 100 or fewer participants, use all of them
    const initialSubset = [...sortedParticipants];

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
      return repeated;
    }
    return initialSubset;
  }

  // Take first 50 and last 50 entries to create wrap-around effect
  const firstHalf = sortedParticipants.slice(0, SUBSET_HALF);
  const lastHalf = sortedParticipants.slice(-SUBSET_HALF);
  return [...firstHalf, ...lastHalf];
}

/**
 * Finds the winner in the complete participant list.
 * 
 * @param participants - Complete list of participants
 * @param targetTicketNumber - The winning ticket number
 * @returns The winning participant or undefined if not found
 */
export function findWinnerInFullList(
  participants: Participant[],
  targetTicketNumber: string
): Participant | undefined {
  const normalizedTarget = normalizeTicketNumber(targetTicketNumber);
  return participants.find((p) => normalizeTicketNumber(p.ticketNumber) === normalizedTarget);
}

/**
 * Sorts participants by ticket number for consistent ordering.
 * 
 * @param participants - Array of participants to sort
 * @returns Sorted array of participants
 */
export function sortParticipants(participants: Participant[]): Participant[] {
  return [...participants].sort((a, b) => {
    const aNum = parseInt(a.ticketNumber.replace(/\D/g, '')) || 0;
    const bNum = parseInt(b.ticketNumber.replace(/\D/g, '')) || 0;
    return aNum - bNum;
  });
}