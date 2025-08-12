/**
 * Test file for subset logic verification
 *
 * @description
 * Tests the subset creation logic used in the slot machine animation
 * to ensure proper wrap-around effects and winner positioning
 *
 * @module tests/subset-logic
 */

import { logger } from '@raffle-spinner/utils';
import type { Participant } from '@raffle-spinner/storage';

/**
 * Generate mock participants for testing
 *
 * @param count - Number of participants to generate
 * @returns Array of mock participants
 */
function generateParticipants(count: number): Participant[] {
  const participants: Participant[] = [];
  for (let i = 1; i <= count; i++) {
    participants.push({
      firstName: `First${i}`,
      lastName: `Last${i}`,
      ticketNumber: String(i).padStart(3, '0'),
    });
  }
  return participants;
}

/**
 * Create initial subset for animation start
 *
 * @param sortedParticipants - All participants sorted by ticket number
 * @returns Subset of participants for initial display
 */
function createInitialSubset(sortedParticipants: Participant[]): Participant[] {
  const SUBSET_SIZE = 100;
  const SUBSET_HALF = 50;

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
 * Create subset with winner positioned appropriately
 *
 * @param sortedParticipants - All participants sorted by ticket number
 * @param winnerIndex - Index of the winner in sorted participants
 * @returns Subset of participants with winner positioned
 */
function createWinnerSubset(sortedParticipants: Participant[], winnerIndex: number): Participant[] {
  const SUBSET_SIZE = 100;
  const SUBSET_HALF = 50;

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
    // Winner is in the first half, need to wrap around
    const fromEnd = sortedParticipants.slice(startIdx); // Get from end
    const fromStart = sortedParticipants.slice(0, winnerIndex + halfSize);
    subset.push(...fromEnd, ...fromStart);
  } else if (startIdx + SUBSET_SIZE > sortedParticipants.length) {
    // Winner is in the last half, need to wrap around
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
 * Run all subset logic tests
 */
export function runTests(): void {
  logger.info('Testing Subset Logic', { component: 'subset-logic-test' });

  // Test with different participant counts
  const testCases = [
    { count: 50, winnerIndex: 25, description: '50 participants (less than subset)' },
    { count: 100, winnerIndex: 50, description: '100 participants (exact subset size)' },
    { count: 200, winnerIndex: 25, description: '200 participants, winner near start' },
    { count: 200, winnerIndex: 100, description: '200 participants, winner in middle' },
    { count: 200, winnerIndex: 175, description: '200 participants, winner near end' },
    { count: 1000, winnerIndex: 10, description: '1000 participants, winner at start' },
    { count: 1000, winnerIndex: 990, description: '1000 participants, winner at end' },
  ];

  testCases.forEach((test) => {
    logger.debug(`Test: ${test.description}`, { component: 'subset-logic-test' });
    const participants = generateParticipants(test.count);

    // Test initial subset
    const initial = createInitialSubset(participants);
    logger.debug(`Initial subset: ${initial.length} entries`, {
      component: 'subset-logic-test',
      metadata: {
        first3: initial
          .slice(0, 3)
          .map((p) => p.ticketNumber)
          .join(', '),
        last3: initial
          .slice(-3)
          .map((p) => p.ticketNumber)
          .join(', '),
      },
    });

    // Test winner subset
    const winner = createWinnerSubset(participants, test.winnerIndex);
    const winnerPos = winner.findIndex(
      (p) => p.ticketNumber === participants[test.winnerIndex].ticketNumber
    );
    logger.debug(`Winner subset: ${winner.length} entries`, {
      component: 'subset-logic-test',
      metadata: {
        winnerTicket: participants[test.winnerIndex].ticketNumber,
        winnerPosition: winnerPos,
        first3: winner
          .slice(0, 3)
          .map((p) => p.ticketNumber)
          .join(', '),
        last3: winner
          .slice(-3)
          .map((p) => p.ticketNumber)
          .join(', '),
      },
    });
  });

  logger.info('Tests complete!', { component: 'subset-logic-test' });
}

// Export functions for testing
export { generateParticipants, createInitialSubset, createWinnerSubset };
