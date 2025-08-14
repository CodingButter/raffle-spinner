/**
 * Side Panel Component (Clean Audience View)
 *
 * Purpose: Minimal interface for live raffle presentations, optimized for
 * audience viewing without instructions or unnecessary UI elements.
 *
 * SRS Reference:
 * - FR-2.1: Side Panel Interface
 * - FR-2.2: Winner Selection and Animation
 */

import { useState, useRef } from 'react';
import { CompetitionProvider, useCompetitions } from '@/contexts/CompetitionContext';
import { SettingsProvider, useSettings } from '@/contexts/SettingsContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { SlotMachineWheel } from '@raffle-spinner/spinners';
import type { SpinnerTheme } from '@raffle-spinner/spinners';
import { SessionWinners, Winner } from '@/components/sidepanel/SessionWinners';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { normalizeTicketNumber } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, AlertCircle } from 'lucide-react';
import { Participant } from '@raffle-spinner/storage';
import confetti from 'canvas-confetti';

function SidePanelContent() {
  const { competitions, selectedCompetition, selectCompetition } = useCompetitions();
  const { settings } = useSettings();
  const { theme } = useTheme();
  const [ticketNumber, setTicketNumber] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [sessionWinners, setSessionWinners] = useState<Winner[]>([]);
  const [currentWinner, setCurrentWinner] = useState<Participant | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSpin = () => {
    setError(null);

    if (!selectedCompetition) {
      setError('Please select a competition first');
      return;
    }

    if (!ticketNumber) {
      setError('Please enter a ticket number');
      return;
    }

    // Use shared utility for ticket normalization
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
  };

  const confettiRef = useRef<boolean>(false);

  const handleSpinComplete = (winner: Participant) => {
    setIsSpinning(false);
    setCurrentWinner(winner);

    // Add to session winners
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

    // Trigger confetti animation with guard against double-firing
    if (!confettiRef.current) {
      confettiRef.current = true;
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Reset the guard after animation
      setTimeout(() => {
        confettiRef.current = false;
      }, 1000);
    }

    // Clear the ticket input for next spin
    setTimeout(() => {
      setTicketNumber('');
      setCurrentWinner(null);
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto space-y-4 p-4">
        {/* Competition Selector - Minimal UI */}
        <div className="flex gap-2">
          <Select
            value={selectedCompetition?.id || ''}
            onValueChange={(id) => {
              const comp = competitions.find((c) => c.id === id);
              if (comp) selectCompetition(id);
            }}
          >
            <SelectTrigger className="bg-card border-border text-card-foreground">
              <SelectValue placeholder="Select Competition" />
            </SelectTrigger>
            <SelectContent>
              {competitions.map((comp) => (
                <SelectItem key={comp.id} value={comp.id}>
                  {comp.name} ({comp.participants.length})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Main Spinner Area */}
        {selectedCompetition && (
          <>
            {/* Spinner Container with relative positioning for winner overlay */}
            <div className="relative flex justify-center">
              <SlotMachineWheel
                participants={selectedCompetition.participants}
                targetTicketNumber={ticketNumber}
                settings={settings}
                isSpinning={isSpinning}
                onSpinComplete={handleSpinComplete}
                onError={(error) => {
                  setError(error);
                  setIsSpinning(false);
                }}
                theme={
                  {
                    nameColor: theme.spinnerStyle.nameColor,
                    ticketColor: theme.spinnerStyle.ticketColor,
                    backgroundColor: theme.spinnerStyle.backgroundColor,
                    canvasBackground: 'transparent', // Force transparent background
                    borderColor: theme.spinnerStyle.borderColor,
                    highlightColor: theme.spinnerStyle.highlightColor,
                    nameSize: theme.spinnerStyle.nameSize,
                    ticketSize: theme.spinnerStyle.ticketSize,
                    fontFamily: theme.spinnerStyle.fontFamily,
                    topShadowOpacity: theme.spinnerStyle.topShadowOpacity,
                    bottomShadowOpacity: theme.spinnerStyle.bottomShadowOpacity,
                    shadowSize: theme.spinnerStyle.shadowSize,
                    shadowColor: theme.spinnerStyle.shadowColor,
                  } as SpinnerTheme
                }
              />

              {/* Winner Display - Absolute positioned overlay */}
              {currentWinner && (
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-4 z-10 animate-winner-reveal">
                  <Card className="bg-gradient-to-r from-brand-gold/95 to-brand-gold/90 border-brand-gold animate-winner-glow shadow-2xl">
                    <CardContent className="p-8">
                      <div className="flex items-center gap-4">
                        <Sparkles className="h-12 w-12 text-gray-900 animate-pulse flex-shrink-0" />
                        <div className="flex-1 text-center">
                          <p className="text-4xl font-bold text-gray-900 leading-tight">
                            🎉 {currentWinner.firstName} {currentWinner.lastName}
                          </p>
                          <p className="text-2xl font-semibold text-gray-800 mt-2">
                            Ticket #{currentWinner.ticketNumber}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Spin Controls */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter ticket number"
                  value={ticketNumber}
                  onChange={(e) => setTicketNumber(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !isSpinning && handleSpin()}
                  disabled={isSpinning}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
                <Button
                  onClick={handleSpin}
                  disabled={isSpinning || !ticketNumber}
                  size="lg"
                  className="min-w-[120px]"
                >
                  {isSpinning ? 'Spinning...' : 'Spin'}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </>
        )}

        {/* Session Winners */}
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
