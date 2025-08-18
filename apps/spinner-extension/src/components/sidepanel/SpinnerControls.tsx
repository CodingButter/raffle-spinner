/**
 * Spinner Controls Component
 *
 * Purpose: Handles the ticket input and spin button with keyboard shortcut indicators.
 * Extracted from SidePanel for better separation of concerns and file size management.
 *
 * SRS Reference:
 * - FR-2.1: Side Panel Interface
 * - UX-3.1: Keyboard Navigation and Accessibility
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { normalizeTicketNumber } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Competition, Participant } from '@raffle-spinner/storage';

interface SpinnerControlsProps {
  selectedCompetition: Competition | null;
  isSpinning: boolean;
  onSpin: (participant: Participant) => void;
  canConductRaffle: boolean;
  error: string | null;
  onError: (error: string | null) => void;
}

export function SpinnerControls({
  selectedCompetition,
  isSpinning,
  onSpin,
  canConductRaffle,
  error,
  onError,
}: SpinnerControlsProps) {
  const [ticketNumber, setTicketNumber] = useState('');

  // Clear ticket number when spinning completes
  useEffect(() => {
    if (!isSpinning && ticketNumber) {
      const timer = setTimeout(() => {
        setTicketNumber('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isSpinning, ticketNumber]);

  const handleSpin = () => {
    onError(null);

    if (!canConductRaffle) {
      onError('You have reached your raffle limit. Upgrade to Pro for unlimited raffles.');
      return;
    }

    if (!selectedCompetition) {
      onError('Please select a competition first');
      return;
    }

    if (!ticketNumber.trim()) {
      onError('Please enter a ticket number');
      return;
    }

    const normalizedInput = normalizeTicketNumber(ticketNumber);
    const participant = selectedCompetition.participants.find(
      (p) => normalizeTicketNumber(p.ticketNumber) === normalizedInput
    );

    if (!participant) {
      onError('Ticket number not found in this competition');
      return;
    }

    onSpin(participant);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isSpinning && ticketNumber.trim()) {
      handleSpin();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder="Enter ticket number"
            value={ticketNumber}
            onChange={(e) => setTicketNumber(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSpinning}
            className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-16"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            Enter
          </div>
        </div>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              data-spin-button
              onClick={handleSpin}
              disabled={isSpinning || !ticketNumber.trim()}
              size="lg"
              className="min-w-[120px] relative"
            >
              {isSpinning ? 'Spinning...' : 'Spin'}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Start spinning (Space or Enter)</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}