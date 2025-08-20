'use client';

import { useState, useCallback } from 'react';
import { Participant } from '@raffle-spinner/storage';

export interface Winner {
  firstName: string;
  lastName: string;
  ticketNumber: string;
  competition: string;
  timestamp: number;
}

/**
 * useSessionWinners Hook
 * Manages session winners state and export functionality
 * Extracted from SidePanel.tsx for separation of concerns
 */
export function useSessionWinners() {
  const [sessionWinners, setSessionWinners] = useState<Winner[]>([]);

  const addWinner = useCallback((participant: Participant, competitionName: string) => {
    const newWinner: Winner = {
      firstName: participant.firstName,
      lastName: participant.lastName,
      ticketNumber: participant.ticketNumber,
      competition: competitionName,
      timestamp: Date.now(),
    };

    setSessionWinners((prev) => [newWinner, ...prev]);
  }, []);

  const clearWinners = useCallback(() => {
    setSessionWinners([]);
  }, []);

  const exportWinners = useCallback(() => {
    if (sessionWinners.length === 0) return;

    const csv = [
      ['First Name', 'Last Name', 'Ticket Number', 'Competition', 'Time'],
      ...sessionWinners.map((w) => [
        w.firstName,
        w.lastName,
        w.ticketNumber,
        w.competition,
        new Date(w.timestamp).toLocaleString(),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `raffle-winners-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sessionWinners]);

  return {
    sessionWinners,
    addWinner,
    clearWinners,
    exportWinners,
  };
}
