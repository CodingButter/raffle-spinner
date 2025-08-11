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

import { useState } from 'react';
import { CompetitionProvider, useCompetitions } from '@/contexts/CompetitionContext';
import { SettingsProvider, useSettings } from '@/contexts/SettingsContext';
import { SlotMachineWheel } from '@/components/sidepanel/SlotMachineWheel';
import { SessionWinners, Winner } from '@/components/sidepanel/SessionWinners';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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

    // Normalize ticket numbers for comparison (remove leading zeros, trim whitespace)
    const normalizeTicket = (ticket: string) => ticket.trim().replace(/^0+/, '') || '0';
    const normalizedInput = normalizeTicket(ticketNumber);

    const participant = selectedCompetition.participants.find(
      (p) => normalizeTicket(p.ticketNumber) === normalizedInput || p.ticketNumber === ticketNumber // Also check exact match
    );

    if (!participant) {
      setError('Ticket number not found in this competition');
      return;
    }

    setIsSpinning(true);
    setCurrentWinner(null);
  };

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

    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    // Clear the ticket input for next spin
    setTimeout(() => {
      setTicketNumber('');
      setCurrentWinner(null);
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Competition Selector - Minimal UI */}
        <div className="flex gap-2">
          <Select
            value={selectedCompetition?.id || ''}
            onValueChange={(id) => {
              const comp = competitions.find((c) => c.id === id);
              if (comp) selectCompetition(id);
            }}
          >
            <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
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
              <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-8 w-8 text-yellow-500 animate-pulse" />
                    <div className="flex-1">
                      <p className="text-2xl font-bold text-white">
                        🎉 {currentWinner.firstName} {currentWinner.lastName}
                      </p>
                      <p className="text-lg text-gray-300">Ticket #{currentWinner.ticketNumber}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Spin Controls */}
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter ticket number"
                value={ticketNumber}
                onChange={(e) => setTicketNumber(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isSpinning && handleSpin()}
                disabled={isSpinning}
                className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
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

            {error && (
              <Alert variant="destructive" className="bg-red-900/20 border-red-500/50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </>
        )}

        {/* Session Winners */}
        {sessionWinners.length > 0 && (
          <Card className="bg-gray-800/30 border-gray-700">
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
    <CompetitionProvider>
      <SettingsProvider>
        <SidePanelContent />
      </SettingsProvider>
    </CompetitionProvider>
  );
}
