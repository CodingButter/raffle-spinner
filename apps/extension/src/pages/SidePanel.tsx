/**
 * Side Panel Component
 *
 * Purpose: Interactive side panel interface for conducting raffle spins, selecting
 * competitions, entering ticket numbers, and displaying winners with animations.
 *
 * SRS Reference:
 * - FR-2.1: Side Panel Interface
 * - FR-2.2: Winner Selection and Animation
 * - FR-2.3: Ticket Number Input and Validation
 * - FR-2.4: Winner Display and Session History
 */

import { useState } from 'react';
import { CompetitionProvider, useCompetitions } from '@/contexts/CompetitionContext';
import { SettingsProvider, useSettings } from '@/contexts/SettingsContext';
import { SlotMachineWheel } from '@/components/sidepanel/SlotMachineWheel';
import { SessionWinners, Winner } from '@/components/sidepanel/SessionWinners';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

    setSessionWinners((prev) => [
      ...prev,
      {
        ...winner,
        competition: selectedCompetition!.name,
        timestamp: Date.now(),
      },
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
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-xl mx-auto space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Raffle Winner Spinner</CardTitle>
            <CardDescription>
              Select a competition and enter the winning ticket number
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="competition">Competition</Label>
              <Select
                value={selectedCompetition?.id || ''}
                onValueChange={(id) => {
                  const comp = competitions.find((c) => c.id === id);
                  if (comp) selectCompetition(id);
                }}
              >
                <SelectTrigger id="competition">
                  <SelectValue placeholder="Select a competition" />
                </SelectTrigger>
                <SelectContent>
                  {competitions.map((comp) => (
                    <SelectItem key={comp.id} value={comp.id}>
                      {comp.name} ({comp.participants.length} participants)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCompetition && (
              <div className="space-y-4">
                <SlotMachineWheel
                  participants={selectedCompetition.participants}
                  targetTicketNumber={ticketNumber}
                  settings={settings}
                  isSpinning={isSpinning}
                  onSpinComplete={handleSpinComplete}
                />

                {currentWinner && (
                  <Alert className="border-green-500 bg-green-50">
                    <Sparkles className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-900 font-semibold text-lg">
                      Winner: {currentWinner.firstName} {currentWinner.lastName} - Ticket #
                      {currentWinner.ticketNumber}
                    </AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="ticket">Enter Winning Ticket Number</Label>
                  <Input
                    id="ticket"
                    type="text"
                    value={ticketNumber}
                    onChange={(e) => setTicketNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter ticket number"
                    disabled={isSpinning}
                  />
                </div>

                <Button
                  onClick={handleSpin}
                  disabled={!ticketNumber || isSpinning}
                  className="w-full"
                  size="lg"
                >
                  {isSpinning ? 'Spinning...' : 'Spin to Reveal Winner'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <SessionWinners winners={sessionWinners} />
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
