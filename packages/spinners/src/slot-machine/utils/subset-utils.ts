/**
 * Utility functions for subset management
 *
 * @module subset-utils
 */

import { Participant } from '@raffle-spinner/storage';
import { normalizeTicketNumber } from '@drawday/utils';

const SUBSET_SIZE = 100; // Total entries to show in the wheel
const SUBSET_HALF = 50; // Half of the subset size

/**
 * Creates initial subset for the wheel display
 */
export function createInitialSubset(sortedParticipants: Participant[]): Participant[] {
  if (sortedParticipants.length === 0) return [];

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

  return initialSubset;
}

/**
 * Creates a new subset with the winner positioned at index 0
 */
export function createWinnerSubset(
  sortedParticipants: Participant[],
  targetTicketNumber: string
): Participant[] {
  const normalizedTarget = normalizeTicketNumber(targetTicketNumber);
  const winnerIndex = sortedParticipants.findIndex(
    (p) => normalizeTicketNumber(p.ticketNumber) === normalizedTarget
  );

  if (winnerIndex === -1) {
    // Fallback to initial subset pattern
    if (sortedParticipants.length <= SUBSET_SIZE) {
      return sortedParticipants;
    }
    const firstHalf = sortedParticipants.slice(0, SUBSET_HALF);
    const lastHalf = sortedParticipants.slice(-SUBSET_HALF);
    return [...firstHalf, ...lastHalf];
  }

  const winner = sortedParticipants[winnerIndex];

  // If we have 100 or fewer participants, put winner first and add the rest
  if (sortedParticipants.length <= SUBSET_SIZE) {
    const others = sortedParticipants.filter((_, i) => i !== winnerIndex);
    return [winner, ...others];
  }

  // Create subset with winner at index 0
  const subset: Participant[] = [winner];

  // Fill the rest of the subset with other participants
  const beforeWinner = sortedParticipants.slice(0, winnerIndex);
  const afterWinner = sortedParticipants.slice(winnerIndex + 1);

  // Alternate between before and after to create a good mix
  let beforeIdx = beforeWinner.length - 1;
  let afterIdx = 0;

  while (subset.length < SUBSET_SIZE && (beforeIdx >= 0 || afterIdx < afterWinner.length)) {
    if (afterIdx < afterWinner.length) {
      subset.push(afterWinner[afterIdx]);
      afterIdx++;
    }
    if (subset.length < SUBSET_SIZE && beforeIdx >= 0) {
      subset.push(beforeWinner[beforeIdx]);
      beforeIdx--;
    }
  }

  return subset.slice(0, SUBSET_SIZE);
}
