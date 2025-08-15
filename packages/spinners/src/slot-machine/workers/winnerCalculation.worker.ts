/**
 * WebWorker for Winner Calculation
 * 
 * Offloads heavy winner calculation and subset generation to a separate thread
 * to maintain 60fps on the main thread during animation
 */

import type { Participant } from '@raffle-spinner/storage';

export interface WinnerCalculationRequest {
  type: 'CALCULATE_WINNER';
  participants: Participant[];
  targetTicketNumber: string;
  subsetSize: number;
}

export interface WinnerCalculationResponse {
  type: 'WINNER_RESULT';
  winner: Participant | null;
  winnerIndex: number;
  subset: Participant[];
  stats: {
    calculationTime: number;
    participantCount: number;
    subsetSize: number;
  };
}

// Normalize ticket number for comparison
function normalizeTicketNumber(ticketNumber: string): string {
  return ticketNumber.replace(/\D/g, '').replace(/^0+/, '') || '0';
}

// Sort participants by ticket number
function sortParticipantsByTicket(participants: Participant[]): Participant[] {
  return [...participants].sort((a, b) => {
    const aNum = parseInt(a.ticketNumber.replace(/\D/g, '')) || 0;
    const bNum = parseInt(b.ticketNumber.replace(/\D/g, '')) || 0;
    return aNum - bNum;
  });
}

// Create winner-centered subset
function createWinnerSubset(
  sortedParticipants: Participant[],
  targetTicketNumber: string,
  subsetSize: number
): { subset: Participant[]; winnerIndex: number } {
  if (sortedParticipants.length === 0) {
    return { subset: [], winnerIndex: -1 };
  }

  // Find the winner in sorted participants
  const normalizedTarget = normalizeTicketNumber(targetTicketNumber);
  const winnerIndex = sortedParticipants.findIndex(
    (p) => normalizeTicketNumber(p.ticketNumber) === normalizedTarget
  );

  if (winnerIndex === -1) {
    // Winner not found - return first subset
    const subset = sortedParticipants.slice(0, Math.min(subsetSize, sortedParticipants.length));
    return { subset, winnerIndex: -1 };
  }

  // If we have fewer participants than subset size, return all
  if (sortedParticipants.length <= subsetSize) {
    return { subset: [...sortedParticipants], winnerIndex };
  }

  // Create subset with winner approximately in the middle
  const subset: Participant[] = [];
  const halfSize = Math.floor(subsetSize / 2);

  // Calculate start index to center the winner
  const startIdx = winnerIndex - halfSize;

  if (startIdx < 0) {
    // Winner is in the first half, wrap around from the end
    const wrapStartIdx = sortedParticipants.length + startIdx;
    const fromEnd = sortedParticipants.slice(wrapStartIdx);
    const fromStart = sortedParticipants.slice(0, winnerIndex + halfSize);
    subset.push(...fromEnd, ...fromStart);
  } else if (startIdx + subsetSize > sortedParticipants.length) {
    // Winner is in the last half, wrap around to the beginning
    const fromMiddle = sortedParticipants.slice(startIdx);
    const fromBeginning = sortedParticipants.slice(0, subsetSize - fromMiddle.length);
    subset.push(...fromMiddle, ...fromBeginning);
  } else {
    // Winner is in the middle, take a continuous slice
    subset.push(...sortedParticipants.slice(startIdx, startIdx + subsetSize));
  }

  // Find winner's new index in the subset
  const newWinnerIndex = subset.findIndex(
    (p) => normalizeTicketNumber(p.ticketNumber) === normalizedTarget
  );

  return { subset, winnerIndex: newWinnerIndex };
}

// Handle messages from main thread
self.addEventListener('message', (event: MessageEvent<WinnerCalculationRequest>) => {
  const { type, participants, targetTicketNumber, subsetSize } = event.data;

  if (type === 'CALCULATE_WINNER') {
    const startTime = performance.now();

    // Sort participants
    const sortedParticipants = sortParticipantsByTicket(participants);

    // Find winner
    const normalizedTarget = normalizeTicketNumber(targetTicketNumber);
    const winner = participants.find(
      (p) => normalizeTicketNumber(p.ticketNumber) === normalizedTarget
    ) || null;

    // Create winner subset
    const { subset, winnerIndex } = createWinnerSubset(
      sortedParticipants,
      targetTicketNumber,
      subsetSize
    );

    const calculationTime = performance.now() - startTime;

    // Send result back to main thread
    const response: WinnerCalculationResponse = {
      type: 'WINNER_RESULT',
      winner,
      winnerIndex,
      subset,
      stats: {
        calculationTime,
        participantCount: participants.length,
        subsetSize: subset.length,
      },
    };

    self.postMessage(response);
  }
});

// Export for TypeScript
export {};