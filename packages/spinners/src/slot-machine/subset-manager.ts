/**
 * Subset Manager for Performance Optimization
 * 
 * Handles intelligent subset swapping for large participant lists.
 * Maintains smooth animation performance with 5000+ participants.
 */

import { Participant } from '@raffle-spinner/storage';
import { normalizeTicketNumber } from '@drawday/utils';
import { SUBSET_SIZE, SUBSET_HALF } from './slot-machine-constants';

export class SubsetManager {
  private hasSwapped = false;
  private currentSubset: Participant[] = [];
  private sortedParticipants: Participant[] = [];

  constructor(participants: Participant[]) {
    this.updateParticipants(participants);
  }

  /**
   * Updates the participant list and resets swap state
   */
  updateParticipants(participants: Participant[]): void {
    this.sortedParticipants = [...participants].sort((a, b) => {
      const aNum = parseInt(a.ticketNumber.replace(/\D/g, '')) || 0;
      const bNum = parseInt(b.ticketNumber.replace(/\D/g, '')) || 0;
      return aNum - bNum;
    });
    this.hasSwapped = false;
    this.currentSubset = this.createInitialSubset();
  }

  /**
   * Creates the initial subset for displaying (first 50 + last 50)
   */
  private createInitialSubset(): Participant[] {
    if (this.sortedParticipants.length === 0) return [];

    if (this.sortedParticipants.length <= SUBSET_SIZE) {
      return this.fillToSubsetSize(this.sortedParticipants);
    }

    const firstHalf = this.sortedParticipants.slice(0, SUBSET_HALF);
    const lastHalf = this.sortedParticipants.slice(-SUBSET_HALF);
    return [...firstHalf, ...lastHalf];
  }

  /**
   * Fills a smaller participant list to the full subset size by repeating entries
   */
  private fillToSubsetSize(participants: Participant[]): Participant[] {
    if (participants.length >= SUBSET_SIZE) return participants;

    const repeated = [...participants];
    while (repeated.length < SUBSET_SIZE) {
      repeated.push(
        ...participants.slice(
          0,
          Math.min(participants.length, SUBSET_SIZE - repeated.length)
        )
      );
    }
    return repeated;
  }

  /**
   * Creates a winner-centered subset for precise animation landing
   */
  private createWinnerSubset(targetTicketNumber: string): Participant[] {
    const normalizedTarget = normalizeTicketNumber(targetTicketNumber);
    const winnerIndex = this.sortedParticipants.findIndex(
      (p) => normalizeTicketNumber(p.ticketNumber) === normalizedTarget
    );

    if (winnerIndex === -1) {
      // Winner not found - fallback to initial subset
      return this.createInitialSubset();
    }

    if (this.sortedParticipants.length <= SUBSET_SIZE) {
      return this.fillToSubsetSize(this.sortedParticipants);
    }

    // Create subset with winner approximately in the middle
    const subset: Participant[] = [];
    const halfSize = Math.floor(SUBSET_SIZE / 2);
    const startIdx = winnerIndex - halfSize;

    if (startIdx < 0) {
      // Winner is in the first half, need to wrap around from the end
      const wrapStartIdx = this.sortedParticipants.length + startIdx;
      const fromEnd = this.sortedParticipants.slice(wrapStartIdx);
      const fromStart = this.sortedParticipants.slice(0, winnerIndex + halfSize);
      subset.push(...fromEnd, ...fromStart);
    } else if (startIdx + SUBSET_SIZE > this.sortedParticipants.length) {
      // Winner is in the last half, need to wrap around to the beginning
      const fromMiddle = this.sortedParticipants.slice(startIdx);
      const fromBeginning = this.sortedParticipants.slice(0, SUBSET_SIZE - fromMiddle.length);
      subset.push(...fromMiddle, ...fromBeginning);
    } else {
      // Winner is in the middle, can take a continuous slice
      subset.push(...this.sortedParticipants.slice(startIdx, startIdx + SUBSET_SIZE));
    }

    return subset;
  }

  /**
   * Handles subset swap at maximum velocity for winner positioning
   */
  swapToWinnerSubset(targetTicketNumber: string): { subset: Participant[]; winnerIndex: number } {
    if (this.hasSwapped) {
      return { subset: this.currentSubset, winnerIndex: -1 };
    }

    this.hasSwapped = true;
    const winnerSubset = this.createWinnerSubset(targetTicketNumber);
    this.currentSubset = winnerSubset;

    // Find winner's new index in the subset
    const normalizedTarget = normalizeTicketNumber(targetTicketNumber);
    const newWinnerIndex = winnerSubset.findIndex(
      (p) => normalizeTicketNumber(p.ticketNumber) === normalizedTarget
    );

    return { subset: winnerSubset, winnerIndex: newWinnerIndex };
  }

  /**
   * Gets the current subset
   */
  getCurrentSubset(): Participant[] {
    return this.currentSubset;
  }

  /**
   * Checks if subset has been swapped
   */
  hasBeenSwapped(): boolean {
    return this.hasSwapped;
  }

  /**
   * Resets swap state for new spin
   */
  resetSwapState(): void {
    this.hasSwapped = false;
  }

  /**
   * Gets all sorted participants
   */
  getAllParticipants(): Participant[] {
    return this.sortedParticipants;
  }
}