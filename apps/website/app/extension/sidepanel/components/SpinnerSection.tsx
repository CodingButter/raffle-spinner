'use client';

import dynamic from 'next/dynamic';
import { Participant, Competition, Settings } from '@raffle-spinner/storage';
import type { SpinnerTheme } from '@raffle-spinner/spinners';
import { WinnerDisplay } from '@/components/sidepanel/WinnerDisplay';

// Dynamic import for Canvas component to avoid SSR issues
const SlotMachineWheel = dynamic(
  () => import('@raffle-spinner/spinners').then((mod) => mod.SlotMachineWheel),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    ),
  }
);

interface SpinnerSectionProps {
  competition: Competition;
  settings: Settings;
  theme: SpinnerTheme;
  isSpinning: boolean;
  spinTarget: string;
  currentWinner: Participant | null;
  onSpinComplete: (winner: Participant) => void;
  onError: (error: string) => void;
  onNewSession: () => void;
  onReset: () => void;
}

/**
 * SpinnerSection Component
 * Manages the spinner wheel display and winner presentation
 * Extracted from SidePanel.tsx for better organization
 */
export function SpinnerSection({
  competition,
  settings,
  theme,
  isSpinning,
  spinTarget,
  currentWinner,
  onSpinComplete,
  onError,
  onNewSession,
  onReset,
}: SpinnerSectionProps) {
  return (
    <div className="relative flex justify-center">
      <SlotMachineWheel
        participants={competition.participants}
        targetTicketNumber={spinTarget}
        settings={settings}
        isSpinning={isSpinning}
        onSpinComplete={onSpinComplete}
        onError={(error: string) => {
          onError(error);
        }}
        theme={theme}
      />

      {currentWinner && (
        <WinnerDisplay winner={currentWinner} onNewSession={onNewSession} onReset={onReset} />
      )}
    </div>
  );
}
