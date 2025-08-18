/**
 * Side Panel Component with Session Persistence
 *
 * Purpose: Minimal interface for live raffle presentations with session persistence
 * that survives page refreshes and extension reloads.
 *
 * SRS Reference:
 * - FR-2.1: Side Panel Interface
 * - FR-2.2: Winner Selection and Animation
 * - Data Layer: Session persistence across page refreshes
 * 
 * Architecture:
 * - Refactored to maintain <200 line file size limit
 * - Components extracted for single responsibility
 * - Business logic isolated in custom hooks
 */

import { useEffect } from 'react';
import { CompetitionProvider, useCompetitions } from '@/contexts/CompetitionContext';
import { SettingsProvider, useSettings } from '@/contexts/SettingsContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { SessionWinners } from '@/components/sidepanel/SessionWinners';
import { BrandingHeader } from '@/components/sidepanel/BrandingHeader';
import { CompetitionSelector } from '@/components/sidepanel/CompetitionSelector';
import { SpinnerArea } from '@/components/sidepanel/SpinnerArea';
import { Card, CardContent } from '@/components/ui/card';
import { useSessionPersistence } from '@/hooks/useSessionPersistence';
import { useSpinHandler } from '@/hooks/useSpinHandler';

function SidePanelContent() {
  const { competitions, selectedCompetition, selectCompetition } = useCompetitions();
  const { settings } = useSettings();
  const { theme } = useTheme();
  const { canConductRaffle, incrementRaffleCount, getRemainingRaffles, hasBranding } = useSubscription();
  
  // Use extracted spin handler hook
  const {
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
  } = useSpinHandler({
    selectedCompetition,
    canConductRaffle,
    getRemainingRaffles,
    incrementRaffleCount,
  });

  // Session persistence hook
  const { saveSession, initializeSession } = useSessionPersistence({
    onSessionRestore: (session) => {
      if (session.selectedCompetitionId) {
        const competition = competitions.find(c => c.id === session.selectedCompetitionId);
        if (competition) {
          selectCompetition(session.selectedCompetitionId);
        }
      }
      setSessionWinners(session.sessionWinners);
      setTicketNumber(session.currentTicketNumber);
    },
    onSessionExpired: () => {
      setSessionWinners([]);
      setTicketNumber('');
    },
    onError: (errorMessage) => {
      console.error('Session persistence error:', errorMessage);
    }
  });

  // Save session state whenever it changes
  useEffect(() => {
    const sessionState = {
      selectedCompetitionId: selectedCompetition?.id,
      sessionWinners,
      currentTicketNumber: ticketNumber,
      isSpinning: false,
      currentWinner: currentWinner ? {
        firstName: currentWinner.firstName,
        lastName: currentWinner.lastName,
        ticketNumber: currentWinner.ticketNumber,
      } : undefined,
      spinTarget,
    };
    saveSession(sessionState);
  }, [selectedCompetition?.id, sessionWinners, ticketNumber, currentWinner, spinTarget, saveSession]);

  // Initialize session on mount
  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  return (
    <div className="min-h-screen bg-background">
      <BrandingHeader 
        competition={selectedCompetition}
        branding={theme.branding}
        hasBranding={hasBranding()}
      />

      <div className="max-w-2xl mx-auto space-y-4 p-4">
        <CompetitionSelector
          competitions={competitions}
          selectedCompetition={selectedCompetition}
          onSelectCompetition={selectCompetition}
        />

        {selectedCompetition && (
          <SpinnerArea
            competition={selectedCompetition}
            settings={settings}
            theme={theme}
            ticketNumber={ticketNumber}
            spinTarget={spinTarget}
            isSpinning={isSpinning}
            currentWinner={currentWinner}
            error={error}
            onTicketChange={setTicketNumber}
            onSpin={handleSpin}
            onSpinComplete={handleSpinComplete}
          />
        )}

        {sessionWinners.length > 0 && (
          <Card className="bg-card/80 border-border">
            <CardContent className="p-4">
              <SessionWinners winners={sessionWinners} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export function SidePanelWithPersistence() {
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