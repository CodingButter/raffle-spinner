/**
 * SpinnerArea Component
 * 
 * Purpose: Main spinner display area with winner overlay
 * Extracted from SidePanelWithPersistence.tsx to maintain file size limits
 * 
 * Architecture Decision:
 * - Encapsulates spinner and winner display logic
 * - Reduces parent component complexity
 * - Clear separation of spinner concerns
 */

import { SlotMachineWheel } from '@raffle-spinner/spinners';
import { WinnerOverlay } from './WinnerOverlay';
import { SpinControls } from './SpinControls';
import { convertToSpinnerTheme } from '@/utils/theme-converter';
import type { Competition, Participant, ThemeSettings, SpinnerSettings } from '@raffle-spinner/storage';

interface SpinnerAreaProps {
  competition: Competition;
  settings: SpinnerSettings;
  theme: ThemeSettings;
  ticketNumber: string;
  spinTarget: string;
  isSpinning: boolean;
  currentWinner: Participant | null;
  error: string | null;
  onTicketChange: (value: string) => void;
  onSpin: () => void;
  onSpinComplete: (winner: Participant) => void;
}

export function SpinnerArea({
  competition,
  settings,
  theme,
  ticketNumber,
  spinTarget,
  isSpinning,
  currentWinner,
  error,
  onTicketChange,
  onSpin,
  onSpinComplete,
}: SpinnerAreaProps) {
  return (
    <>
      <div className="relative flex justify-center">
        <SlotMachineWheel
          participants={competition.participants}
          targetTicketNumber={spinTarget || ticketNumber}
          settings={settings}
          isSpinning={isSpinning}
          onSpinComplete={onSpinComplete}
          onError={(errorMsg: string) => {
            console.error('Spinner error:', errorMsg);
          }}
          theme={convertToSpinnerTheme(theme)}
        />
        
        <WinnerOverlay winner={currentWinner} />
      </div>

      <SpinControls
        ticketNumber={ticketNumber}
        isSpinning={isSpinning}
        error={error}
        onTicketChange={onTicketChange}
        onSpin={onSpin}
      />
    </>
  );
}