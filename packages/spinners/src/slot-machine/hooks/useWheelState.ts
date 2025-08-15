/**
 * Hook for managing wheel state and initialization
 * 
 * @module useWheelState
 */

import { useState, useRef, useEffect } from 'react';
import { Participant } from '@raffle-spinner/storage';
import { ITEM_HEIGHT } from '../constants';
import { createInitialSubset } from '../components/refactored/WinnerCalculator';

interface UseWheelStateProps {
  participants: Participant[];
  sortedParticipants: Participant[];
}

export function useWheelState({ participants, sortedParticipants }: UseWheelStateProps) {
  const [position, setPosition] = useState(0);
  const [displaySubset, setDisplaySubset] = useState<Participant[]>([]);
  
  const hasSwappedRef = useRef(false);
  const hasInitializedRef = useRef(false);
  const lastParticipantsRef = useRef(participants);
  const finalPositionRef = useRef<number | null>(null);

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
      const initialSubset = createInitialSubset(sortedParticipants);
      setDisplaySubset(initialSubset);

      if (finalPositionRef.current === null) {
        const startPosition = -2 * ITEM_HEIGHT;
        setPosition(startPosition);
      }
    }
  }, [sortedParticipants, participants]);

  return {
    position,
    setPosition,
    displaySubset,
    setDisplaySubset,
    hasSwappedRef,
    finalPositionRef,
  };
}