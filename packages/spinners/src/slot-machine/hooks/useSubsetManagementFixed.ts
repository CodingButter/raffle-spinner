/**
 * Hook for managing participant subsets in the fixed slot machine wheel
 * Handles subset creation, swapping, and winner positioning
 *
 * @module useSubsetManagementFixed
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Participant } from '@raffle-spinner/storage';
import { normalizeTicketNumber } from '@drawday/utils';
import { createInitialSubset, createWinnerSubset } from '../utils/subset-utils';

export interface SubsetManagementConfig {
  participants: Participant[];
  targetTicketNumber: string;
  itemHeight: number;
}

export function useSubsetManagementFixed({
  participants,
  targetTicketNumber,
  itemHeight,
}: SubsetManagementConfig) {
  const [displaySubset, setDisplaySubset] = useState<Participant[]>([]);
  const [position, setPosition] = useState(0);
  const hasSwappedRef = useRef(false);
  const currentSubsetRef = useRef<Participant[]>([]);

  // Sort participants by ticket number for consistent ordering
  const sortedParticipants = useMemo(() => {
    return [...participants].sort((a, b) => {
      const aNum = parseInt(a.ticketNumber.replace(/\D/g, '')) || 0;
      const bNum = parseInt(b.ticketNumber.replace(/\D/g, '')) || 0;
      return aNum - bNum;
    });
  }, [participants]);

  // Initialize with a subset containing first 50 and last 50 entries
  useEffect(() => {
    if (sortedParticipants.length > 0 && !hasSwappedRef.current) {
      const initialSubset = createInitialSubset(sortedParticipants);
      setDisplaySubset(initialSubset);
      // Start with the first ticket centered in view (position -2)
      setPosition(-2 * itemHeight);
    }
  }, [sortedParticipants, itemHeight]);

  // Update current subset ref
  useEffect(() => {
    currentSubsetRef.current = displaySubset;
  }, [displaySubset]);

  /**
   * Handles the subset swap at maximum velocity
   */
  const handleMaxVelocity = useCallback(() => {
    if (!hasSwappedRef.current) {
      hasSwappedRef.current = true;
      const winnerSubset = createWinnerSubset(sortedParticipants, targetTicketNumber);
      setDisplaySubset(winnerSubset);
      return 0; // Winner is always at index 0
    }
    return -1;
  }, [sortedParticipants, targetTicketNumber]);

  /**
   * Finds the winner in the complete participant list
   */
  const findWinnerInFullList = useCallback(() => {
    const normalizedTarget = normalizeTicketNumber(targetTicketNumber);
    return participants.find((p) => normalizeTicketNumber(p.ticketNumber) === normalizedTarget);
  }, [participants, targetTicketNumber]);

  /**
   * Resets the swap flag for a new spin
   */
  const resetForNewSpin = useCallback(() => {
    hasSwappedRef.current = false;
  }, []);

  return {
    displaySubset,
    position,
    setPosition,
    currentSubsetRef,
    handleMaxVelocity,
    findWinnerInFullList,
    resetForNewSpin,
  };
}
