'use client';

/**
 * Spinner Controls Component (Website Integration)
 */

import { useState } from 'react';
import { Competition, Participant } from '@raffle-spinner/storage';
import { Button, Alert } from '@drawday/ui';
import { PlayCircle, RotateCcw, AlertTriangle } from 'lucide-react';

interface SpinnerControlsProps {
  selectedCompetition: Competition;
  isSpinning: boolean;
  onSpin: (participant: Participant) => void;
  canConductRaffle: boolean;
  error: string | null;
  onError: (error: string) => void;
}

export function SpinnerControls({
  selectedCompetition,
  isSpinning,
  onSpin,
  canConductRaffle,
  error,
  onError,
}: SpinnerControlsProps) {
  const handleSpin = () => {
    if (!selectedCompetition?.participants.length) {
      onError('No participants available');
      return;
    }

    if (!canConductRaffle) {
      onError('Cannot conduct raffle - subscription limit reached');
      return;
    }

    // Select random participant
    const randomIndex = Math.floor(Math.random() * selectedCompetition.participants.length);
    const winner = selectedCompetition.participants[randomIndex];
    onSpin(winner);
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <div className="ml-2">{error}</div>
        </Alert>
      )}

      <div className="flex justify-center">
        <Button
          data-spin-button
          onClick={handleSpin}
          disabled={isSpinning || !selectedCompetition?.participants.length || !canConductRaffle}
          size="lg"
          className="min-w-32"
        >
          {isSpinning ? (
            <>
              <RotateCcw className="h-5 w-5 mr-2 animate-spin" />
              Spinning...
            </>
          ) : (
            <>
              <PlayCircle className="h-5 w-5 mr-2" />
              Spin
            </>
          )}
        </Button>
      </div>

      {selectedCompetition && (
        <p className="text-center text-sm text-muted-foreground">
          {selectedCompetition.participants.length} participants ready
        </p>
      )}
    </div>
  );
}
