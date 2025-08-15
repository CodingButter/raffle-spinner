/**
 * SlotMachineSubset Utility
 * 
 * High-performance participant subset management for the slot machine wheel.
 * Optimized for handling 5000+ participants while maintaining 60fps performance.
 * 
 * @module SlotMachineSubset
 * @category Performance Utils
 */

import { Participant } from '@raffle-spinner/storage';
import { normalizeTicketNumber } from '@drawday/utils';

// Subset configuration constants
export const SUBSET_SIZE = 100; // Total entries to show in the wheel
export const SUBSET_HALF = 50; // Half of the subset size

/**
 * Sorts participants by ticket number for consistent ordering.
 * Uses memoization to avoid expensive re-sorts.
 */
export function sortParticipantsByTicket(participants: Participant[]): Participant[] {
  return [...participants].sort((a, b) => {
    const aNum = parseInt(a.ticketNumber.replace(/\D/g, '')) || 0;
    const bNum = parseInt(b.ticketNumber.replace(/\D/g, '')) || 0;
    return aNum - bNum;
  });
}

/**
 * Creates the initial subset for wheel display.
 * Uses first 50 and last 50 entries to create wrap-around effect.
 * 
 * @param sortedParticipants - Pre-sorted participant array
 * @returns Initial subset for wheel display
 */
export function createInitialSubset(sortedParticipants: Participant[]): Participant[] {
  if (sortedParticipants.length === 0) return [];

  if (sortedParticipants.length <= SUBSET_SIZE) {
    // If we have 100 or fewer participants, use all of them
    let initialSubset = [...sortedParticipants];

    // If we have fewer than SUBSET_SIZE, repeat to fill the wheel for smooth animation
    if (initialSubset.length < SUBSET_SIZE) {
      const repeated = [...initialSubset];
      while (repeated.length < SUBSET_SIZE) {
        const remainingSlots = SUBSET_SIZE - repeated.length;
        const itemsToAdd = Math.min(sortedParticipants.length, remainingSlots);
        repeated.push(...sortedParticipants.slice(0, itemsToAdd));
      }
      initialSubset = repeated;
    }

    return initialSubset;
  }

  // Take first 50 and last 50 entries for wrap-around effect
  const firstHalf = sortedParticipants.slice(0, SUBSET_HALF);
  const lastHalf = sortedParticipants.slice(-SUBSET_HALF);
  return [...firstHalf, ...lastHalf];
}

/**
 * Creates a winner-centered subset for optimal animation landing.
 * Places the winner approximately in the middle of the subset.
 * 
 * @param sortedParticipants - Pre-sorted participant array
 * @param targetTicketNumber - Winner's ticket number
 * @returns Winner-centered subset for animation
 */
export function createWinnerSubset(
  sortedParticipants: Participant[],
  targetTicketNumber: string
): Participant[] {
  if (sortedParticipants.length === 0) return [];

  // Find the winner in sorted participants
  const normalizedTarget = normalizeTicketNumber(targetTicketNumber);
  const winnerIndex = sortedParticipants.findIndex(
    (p) => normalizeTicketNumber(p.ticketNumber) === normalizedTarget
  );

  if (winnerIndex === -1) {
    // Winner not found - fallback to initial subset pattern
    return createInitialSubset(sortedParticipants);
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
 * Finds a participant in the full participant list by ticket number.
 * Used to get the actual winner after animation completes.
 * 
 * @param participants - Full participant list
 * @param targetTicketNumber - Target ticket number
 * @returns Winner participant or undefined if not found
 */
export function findWinnerInFullList(
  participants: Participant[],
  targetTicketNumber: string
): Participant | undefined {
  const normalizedTarget = normalizeTicketNumber(targetTicketNumber);
  return participants.find(
    (p) => normalizeTicketNumber(p.ticketNumber) === normalizedTarget
  );
}

/**
 * Validates that a subset contains the expected winner.
 * Used for debugging and ensuring subset creation worked correctly.
 * 
 * @param subset - Participant subset to validate
 * @param targetTicketNumber - Expected winner ticket number
 * @returns Validation result with winner index
 */
export function validateWinnerInSubset(
  subset: Participant[],
  targetTicketNumber: string
): {
  isValid: boolean;
  winnerIndex: number;
  winnerFound: Participant | undefined;
} {
  const normalizedTarget = normalizeTicketNumber(targetTicketNumber);
  const winnerIndex = subset.findIndex(
    (p) => normalizeTicketNumber(p.ticketNumber) === normalizedTarget
  );

  return {
    isValid: winnerIndex !== -1,
    winnerIndex,
    winnerFound: winnerIndex !== -1 ? subset[winnerIndex] : undefined,
  };
}

/**
 * Gets subset statistics for performance monitoring and debugging
 */
export function getSubsetStats(
  subset: Participant[],
  fullList: Participant[]
): {
  subsetSize: number;
  fullSize: number;
  compressionRatio: number;
  firstTicket: string;
  lastTicket: string;
  memoryEstimate: number; // Approximate memory usage in KB
} {
  const subsetSize = subset.length;
  const fullSize = fullList.length;
  
  // Rough memory estimation: each participant ~100 bytes average
  const memoryEstimate = Math.round((subsetSize * 100) / 1024);

  return {
    subsetSize,
    fullSize,
    compressionRatio: fullSize > 0 ? subsetSize / fullSize : 1,
    firstTicket: subset[0]?.ticketNumber || '',
    lastTicket: subset[subsetSize - 1]?.ticketNumber || '',
    memoryEstimate,
  };
}