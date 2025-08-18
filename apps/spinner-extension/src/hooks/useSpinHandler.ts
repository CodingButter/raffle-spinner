/**
 * useSpinHandler Hook
 * 
 * Purpose: Encapsulates spin business logic and winner management
 * Extracted from SidePanelWithPersistence.tsx to maintain file size limits
 * 
 * Architecture Decision:
 * - Centralized spin state management
 * - Reusable business logic across components
 * - Clear separation of concerns from UI
 */

import { useState, useRef, useCallback } from 'react';
import { normalizeTicketNumber } from '@/lib/utils';
import type { Participant, Competition } from '@raffle-spinner/storage';
import type { Winner } from '@/components/sidepanel/SessionWinners';
import confetti from 'canvas-confetti';

interface UseSpinHandlerProps {
  selectedCompetition: Competition | null;
  canConductRaffle: () => boolean;
  getRemainingRaffles: () => number | null;
  incrementRaffleCount: () => Promise<void>;
}

interface UseSpinHandlerReturn {
  ticketNumber: string;
  setTicketNumber: (value: string) => void;
  isSpinning: boolean;
  currentWinner: Participant | null;
  error: string | null;
  spinTarget: string;
  handleSpin: () => void;
  handleSpinComplete: (winner: Participant) => void;
  sessionWinners: Winner[];
  setSessionWinners: React.Dispatch<React.SetStateAction<Winner[]>>;
}

export function useSpinHandler({
  selectedCompetition,
  canConductRaffle,
  getRemainingRaffles,
  incrementRaffleCount,
}: UseSpinHandlerProps): UseSpinHandlerReturn {
  const [ticketNumber, setTicketNumber] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [sessionWinners, setSessionWinners] = useState<Winner[]>([]);
  const [currentWinner, setCurrentWinner] = useState<Participant | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [spinTarget, setSpinTarget] = useState('');
  
  const confettiRef = useRef<boolean>(false);

  const handleSpin = useCallback(() => {
    setError(null);

    // Check subscription limits
    if (!canConductRaffle()) {
      const remaining = getRemainingRaffles();
      if (remaining === 0) {
        setError('You have reached your raffle limit. Upgrade to Pro for unlimited raffles.');
      } else {
        setError('You cannot conduct more raffles with your current subscription.');
      }
      return;
    }

    if (!selectedCompetition) {
      setError('Please select a competition first');
      return;
    }

    if (!ticketNumber) {
      setError('Please enter a ticket number');
      return;
    }

    const normalizedInput = normalizeTicketNumber(ticketNumber);
    const participant = selectedCompetition.participants.find(
      (p) => normalizeTicketNumber(p.ticketNumber) === normalizedInput
    );

    if (!participant) {
      setError('Ticket number not found in this competition');
      return;
    }

    setIsSpinning(true);
    setCurrentWinner(null);
    setSpinTarget(ticketNumber);
  }, [ticketNumber, selectedCompetition, canConductRaffle, getRemainingRaffles]);

  const handleSpinComplete = useCallback(async (winner: Participant) => {
    setIsSpinning(false);
    setCurrentWinner(winner);

    // Increment raffle count
    await incrementRaffleCount();

    // Add to session winners
    const newWinner: Winner = {
      firstName: winner.firstName,
      lastName: winner.lastName,
      ticketNumber: winner.ticketNumber,
      competition: selectedCompetition!.name,
      timestamp: Date.now(),
    };

    setSessionWinners((prev) => [newWinner, ...prev]);

    // Trigger confetti with guard
    if (!confettiRef.current) {
      confettiRef.current = true;
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      setTimeout(() => {
        confettiRef.current = false;
      }, 1000);
    }

    // Clear after 5 seconds
    setTimeout(() => {
      setTicketNumber('');
      setCurrentWinner(null);
    }, 5000);
  }, [selectedCompetition, incrementRaffleCount]);

  return {
    ticketNumber,
    setTicketNumber,
    isSpinning,
    currentWinner,
    error,
    spinTarget,
    handleSpin,
    handleSpinComplete,
    sessionWinners,
    setSessionWinners,
  };
}