/**
 * Side Panel Component (Clean Audience View) with Keyboard Shortcuts
 *
 * Purpose: Minimal interface for live raffle presentations with keyboard shortcuts
 * for efficient operation during live draws.
 *
 * SRS Reference:
 * - FR-2.1: Side Panel Interface
 * - FR-2.2: Winner Selection and Animation
 * - UX-3.1: Keyboard Navigation and Accessibility
 */

import { useState, useRef } from 'react';
import { CompetitionProvider, useCompetitions } from '@/contexts/CompetitionContext';
import { SettingsProvider, useSettings } from '@/contexts/SettingsContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { SlotMachineWheel } from '@raffle-spinner/spinners';
import type { SpinnerTheme } from '@raffle-spinner/spinners';
import { SessionWinners, Winner } from '@/components/sidepanel/SessionWinners';
import { CompetitionSelector } from '@/components/sidepanel/CompetitionSelector';
import { SpinnerControls } from '@/components/sidepanel/SpinnerControls';
import { WinnerDisplay } from '@/components/sidepanel/WinnerDisplay';
import { KeyboardShortcutsHelp } from '@/components/sidepanel/KeyboardShortcutsHelp';
import { Card, CardContent } from '@/components/ui/card';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Participant } from '@raffle-spinner/storage';
import confetti from 'canvas-confetti';

function SidePanelContent() {
  const { competitions, selectedCompetition, selectCompetition } = useCompetitions();
  const { settings } = useSettings();
  const { theme } = useTheme();
  const { canConductRaffle, incrementRaffleCount, hasBranding } = useSubscription();
  const [isSpinning, setIsSpinning] = useState(false);
  const [sessionWinners, setSessionWinners] = useState<Winner[]>([]);
  const [currentWinner, setCurrentWinner] = useState<Participant | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [spinTarget, setSpinTarget] = useState('');
  const [isHelpVisible, setIsHelpVisible] = useState(false);

  const confettiRef = useRef<boolean>(false);

  const handleSpin = (participant: Participant) => {
    setError(null);
    setIsSpinning(true);
    setCurrentWinner(null);
    setSpinTarget(participant.ticketNumber);
  };

  const handleReset = () => {
    setIsSpinning(false);
    setCurrentWinner(null);
    setSpinTarget('');
    setError(null);
  };

  const handleNewSession = () => {
    setSessionWinners([]);
    handleReset();
  };

  const handleExportWinners = () => {
    if (sessionWinners.length === 0) return;
    
    const csv = [
      ['First Name', 'Last Name', 'Ticket Number', 'Competition', 'Time'],
      ...sessionWinners.map(w => [
        w.firstName,
        w.lastName,
        w.ticketNumber,
        w.competition,
        new Date(w.timestamp).toLocaleString()
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `raffle-winners-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearWinners = () => {
    setSessionWinners([]);
  };

  const handleSpinComplete = async (winner: Participant) => {
    setIsSpinning(false);
    setCurrentWinner(winner);

    await incrementRaffleCount();

    setSessionWinners((prev) => [
      {
        firstName: winner.firstName,
        lastName: winner.lastName,
        ticketNumber: winner.ticketNumber,
        competition: selectedCompetition!.name,
        timestamp: Date.now(),
      },
      ...prev,
    ]);

    // Confetti animation
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

    // Auto-clear winner after delay
    setTimeout(() => {
      setCurrentWinner(null);
    }, 5000);
  };

  // Keyboard shortcuts handlers
  const keyboardHandlers = {
    onSpin: () => {
      // Trigger spin button click in SpinnerControls
      const spinButton = document.querySelector('[data-spin-button]') as HTMLButtonElement;
      if (spinButton && !spinButton.disabled) {
        spinButton.click();
      }
    },
    onReset: handleReset,
    onRevealWinner: () => {
      // Future enhancement: reveal winner without auto-clear
    },
    onNewSession: handleNewSession,
    onExportWinners: handleExportWinners,
    onClearWinners: handleClearWinners,
    onOpenCompetitionSelector: () => {
      const selector = document.querySelector('[data-competition-selector]') as HTMLButtonElement;
      if (selector) {
        selector.focus();
        selector.click();
      }
    },
    onOpenSettings: () => {
      // Future enhancement: open settings modal
    },
    onCloseModal: () => {
      setIsHelpVisible(false);
    },
    onShowHelp: () => {
      setIsHelpVisible(true);
    },
  };

  const keyboardState = {
    isHelpVisible,
    canSpin: !!selectedCompetition && !isSpinning,
    canRevealWinner: !!currentWinner,
    hasActiveModal: isHelpVisible,
  };

  useKeyboardShortcuts(keyboardHandlers, keyboardState);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Branding Header */}
        {hasBranding() && theme.branding && (
          <div className="w-full h-32 relative overflow-hidden bg-card border-b border-border">
            {(selectedCompetition?.bannerImage || theme.branding.bannerImage) && (
              <img 
                src={selectedCompetition?.bannerImage || theme.branding.bannerImage} 
                alt={selectedCompetition?.bannerImage ? `${selectedCompetition.name} Banner` : "Company Banner"} 
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            
            {(theme.branding.logoImage || theme.branding.companyName) && (
              <div className={`absolute inset-0 flex items-center px-6 ${
                theme.branding.logoPosition === 'left' ? 'justify-start' :
                theme.branding.logoPosition === 'right' ? 'justify-end' : 'justify-center'
              }`}>
                <div className="flex items-center gap-3 bg-black/30 backdrop-blur-sm rounded-lg px-4 py-2">
                  {theme.branding.logoImage && (
                    <img src={theme.branding.logoImage} alt="Company Logo" 
                         className="h-16 w-auto object-contain drop-shadow-lg" />
                  )}
                  {theme.branding.showCompanyName && theme.branding.companyName && (
                    <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                      {theme.branding.companyName}
                    </h1>
                  )}
                </div>
              </div>
            )}
            
            {!selectedCompetition?.bannerImage && !theme.branding.bannerImage && (
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-90" />
            )}
          </div>
        )}

        <div className="max-w-2xl mx-auto space-y-4 p-4">
          <CompetitionSelector
            competitions={competitions}
            selectedCompetition={selectedCompetition}
            onSelectCompetition={(id) => {
              const comp = competitions.find((c) => c.id === id);
              if (comp) selectCompetition(id);
            }}
          />

          {selectedCompetition && (
            <>
              <div className="relative flex justify-center">
                <SlotMachineWheel
                  participants={selectedCompetition.participants}
                  targetTicketNumber={spinTarget}
                  settings={settings}
                  isSpinning={isSpinning}
                  onSpinComplete={handleSpinComplete}
                  onError={(error: string) => {
                    setError(error);
                    setIsSpinning(false);
                  }}
                  theme={{
                    nameColor: theme.spinnerStyle.nameColor,
                    ticketColor: theme.spinnerStyle.ticketColor,
                    backgroundColor: theme.spinnerStyle.backgroundColor,
                    canvasBackground: 'transparent',
                    borderColor: theme.spinnerStyle.borderColor,
                    highlightColor: theme.spinnerStyle.highlightColor,
                    nameSize: theme.spinnerStyle.nameSize,
                    ticketSize: theme.spinnerStyle.ticketSize,
                    fontFamily: theme.spinnerStyle.fontFamily,
                    topShadowOpacity: theme.spinnerStyle.topShadowOpacity,
                    bottomShadowOpacity: theme.spinnerStyle.bottomShadowOpacity,
                    shadowSize: theme.spinnerStyle.shadowSize,
                    shadowColor: theme.spinnerStyle.shadowColor,
                  } as SpinnerTheme}
                />

                {currentWinner && (
                  <WinnerDisplay
                    winner={currentWinner}
                    onNewSession={handleNewSession}
                    onReset={handleReset}
                  />
                )}
              </div>

              <SpinnerControls
                selectedCompetition={selectedCompetition}
                isSpinning={isSpinning}
                onSpin={handleSpin}
                canConductRaffle={canConductRaffle()}
                error={error}
                onError={setError}
              />
            </>
          )}

          {sessionWinners.length > 0 && (
            <Card className="bg-card/80 border-border">
              <CardContent className="p-4">
                <SessionWinners 
                  winners={sessionWinners}
                  onExport={handleExportWinners}
                  onClear={handleClearWinners}
                />
              </CardContent>
            </Card>
          )}
        </div>

        <KeyboardShortcutsHelp
          isOpen={isHelpVisible}
          onClose={() => setIsHelpVisible(false)}
        />
      </div>
    </TooltipProvider>
  );
}

export function SidePanel() {
  return (
    <ThemeProvider>
      <AuthGuard>
        <CompetitionProvider>
          <SettingsProvider>
            <SidePanelContent />
          </SettingsProvider>
        </CompetitionProvider>
      </AuthGuard>
    </ThemeProvider>
  );
}
