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
import { SlotMachineWheel } from '@/components/sidepanel/SlotMachineWheel';
import { SessionWinners, Winner } from '@/components/sidepanel/SessionWinners';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
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
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { helpContent } from '@/lib/help-content';
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

  // Determine which banner to show
  const bannerImage = selectedCompetition?.bannerImage || theme.branding.bannerImage;

  return (
    <div className="min-h-screen bg-background">
      {/* Branding Header */}
      {(bannerImage || theme.branding.logoImage) && (
        <div className="relative">
          {/* Banner */}
          {bannerImage && (
            <div className="w-full h-48 overflow-hidden">
              <img src={bannerImage} alt="Event Banner" className="w-full h-full object-cover" />
            </div>
          )}

          {/* Logo and Company Name - Centered in banner */}
          {theme.branding.logoImage && (
            <div
              className={`${bannerImage ? 'absolute inset-0' : 'relative py-8'} flex items-center px-4 ${
                theme.branding.logoPosition === 'center'
                  ? 'justify-center'
                  : theme.branding.logoPosition === 'right'
                    ? 'justify-end'
                    : 'justify-start'
              }`}
            >
              <div className="flex items-center gap-3 bg-background/70 backdrop-blur-md px-6 py-3 rounded-lg shadow-lg border border-white/10">
                <img src={theme.branding.logoImage} alt="Company Logo" className="h-16 w-auto" />
                {theme.branding.showCompanyName && theme.branding.companyName && (
                  <span className="text-2xl font-bold">{theme.branding.companyName}</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

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
            />

            {/* Winner Display */}
            {currentWinner && (
              <Card className="bg-gradient-to-r from-brand-gold/20 to-brand-gold/10 border-brand-gold winner-glow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-8 w-8 text-brand-gold animate-pulse" />
                    <div className="flex-1">
                      <p className="text-2xl font-bold text-brand-gold">
                        🎉 {currentWinner.firstName} {currentWinner.lastName}
                      </p>
                      <p className="text-lg text-brand-pink">
                        Ticket #{currentWinner.ticketNumber}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Spin Controls */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-sm text-muted-foreground">Ticket Entry</Label>
                <InfoTooltip {...helpContent.sidePanel.ticketEntry} iconSize="sm" />
              </div>
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
      <CompetitionProvider>
        <SettingsProvider>
          <SidePanelContent />
        </SettingsProvider>
      </CompetitionProvider>
    </ThemeProvider>
  );
}
