/**
 * Demo Page - Interactive Raffle Spinner Demonstration
 *
 * Showcases the actual slot machine spinner functionality with sample data
 */

'use client';

import { useState } from 'react';
import { SlotMachineWheel } from '@raffle-spinner/spinners';
import type { Participant, SpinnerSettings } from '@raffle-spinner/storage';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@raffle-spinner/ui';
import { Input, Label } from '@raffle-spinner/ui';
import confetti from 'canvas-confetti';
import { Play, RotateCcw, Shuffle } from 'lucide-react';

// Generate sample participants
function generateSampleParticipants(count: number): Participant[] {
  const firstNames = [
    'Alice',
    'Bob',
    'Charlie',
    'Diana',
    'Edward',
    'Fiona',
    'George',
    'Hannah',
    'Ian',
    'Julia',
  ];
  const lastNames = [
    'Smith',
    'Johnson',
    'Williams',
    'Brown',
    'Jones',
    'Miller',
    'Davis',
    'Garcia',
    'Rodriguez',
    'Wilson',
  ];

  const participants: Participant[] = [];
  for (let i = 1; i <= count; i++) {
    participants.push({
      firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
      lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
      ticketNumber: i.toString().padStart(3, '0'),
    });
  }
  return participants;
}

// Default spinner settings
const DEFAULT_SETTINGS: SpinnerSettings = {
  minSpinDuration: 3,
  decelerationRate: 'medium',
};

export default function DemoPage() {
  const [participants, setParticipants] = useState<Participant[]>(() =>
    generateSampleParticipants(100)
  );
  const [ticketNumber, setTicketNumber] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentWinner, setCurrentWinner] = useState<Participant | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [participantCount, setParticipantCount] = useState('100');
  const [sessionWinners, setSessionWinners] = useState<
    Array<{
      participant: Participant;
      timestamp: number;
    }>
  >([]);

  const handleSpin = () => {
    setError(null);

    if (!ticketNumber) {
      setError('Please enter a ticket number');
      return;
    }

    // Normalize the input - remove leading zeros for comparison, or pad if needed
    const normalizedInput = ticketNumber.trim();

    // Debug log
    console.log('Looking for ticket:', normalizedInput);
    console.log(
      'Available tickets:',
      participants.slice(0, 5).map((p) => p.ticketNumber)
    );

    const participant = participants.find((p) => {
      // Compare both with padding and without
      return (
        p.ticketNumber === normalizedInput ||
        p.ticketNumber === normalizedInput.padStart(3, '0') ||
        p.ticketNumber.replace(/^0+/, '') === normalizedInput.replace(/^0+/, '')
      );
    });

    if (!participant) {
      setError(
        `Ticket number not found. Try: ${participants[0]?.ticketNumber} or ${participants[1]?.ticketNumber}`
      );
      return;
    }

    setIsSpinning(true);
    setCurrentWinner(null);
  };

  const handleSpinComplete = (winner: Participant) => {
    setIsSpinning(false);
    setCurrentWinner(winner);

    // Add to session winners
    setSessionWinners((prev) =>
      [
        {
          participant: winner,
          timestamp: Date.now(),
        },
        ...prev,
      ].slice(0, 10)
    ); // Keep last 10 winners

    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    // Clear input after 3 seconds
    setTimeout(() => {
      setTicketNumber('');
      setCurrentWinner(null);
    }, 3000);
  };

  const handleGenerateNew = () => {
    const count = parseInt(participantCount) || 100;
    if (count < 1 || count > 5000) {
      setError('Please enter a number between 1 and 5000');
      return;
    }
    setParticipants(generateSampleParticipants(count));
    setTicketNumber('');
    setCurrentWinner(null);
    setError(null);
  };

  const handleRandomSpin = () => {
    if (participants.length === 0) return;
    const randomIndex = Math.floor(Math.random() * participants.length);
    setTicketNumber(participants[randomIndex].ticketNumber);
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Live Demo</h1>
          <p className="text-xl text-muted-foreground">
            Experience the actual slot machine spinner used in the extension
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Controls Section */}
          <div className="lg:col-span-1 space-y-4">
            {/* Data Generation Card */}
            <Card>
              <CardHeader>
                <CardTitle>Sample Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="count">Number of Participants</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="count"
                      type="number"
                      value={participantCount}
                      onChange={(e) => setParticipantCount(e.target.value)}
                      min="1"
                      max="5000"
                      placeholder="100"
                    />
                    <Button onClick={handleGenerateNew} variant="secondary" size="sm">
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Current: {participants.length} participants
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Spin Controls Card */}
            <Card>
              <CardHeader>
                <CardTitle>Spin Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="ticket">Ticket Number</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="ticket"
                      type="text"
                      value={ticketNumber}
                      onChange={(e) => setTicketNumber(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !isSpinning && handleSpin()}
                      placeholder="e.g., 001"
                      disabled={isSpinning}
                    />
                    <Button
                      onClick={handleRandomSpin}
                      variant="outline"
                      size="sm"
                      disabled={isSpinning || participants.length === 0}
                      title="Pick random ticket"
                    >
                      <Shuffle className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Valid range: 001 -{' '}
                    {participants[participants.length - 1]?.ticketNumber || '100'}
                  </p>
                </div>

                <Button
                  onClick={handleSpin}
                  disabled={isSpinning || !ticketNumber}
                  className="w-full"
                  size="lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {isSpinning ? 'Spinning...' : 'Spin to Win!'}
                </Button>

                {error && <div className="text-destructive text-sm">{error}</div>}
              </CardContent>
            </Card>

            {/* Sample Participants */}
            <Card>
              <CardHeader>
                <CardTitle>Sample Participants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {participants.slice(0, 10).map((p) => (
                    <div
                      key={p.ticketNumber}
                      className="flex justify-between text-xs p-1 hover:bg-muted rounded cursor-pointer"
                      onClick={() => setTicketNumber(p.ticketNumber)}
                    >
                      <span>
                        {p.firstName} {p.lastName}
                      </span>
                      <span className="font-mono text-muted-foreground">#{p.ticketNumber}</span>
                    </div>
                  ))}
                  {participants.length > 10 && (
                    <p className="text-xs text-muted-foreground pt-2">
                      ... and {participants.length - 10} more
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Session Winners Card */}
            {sessionWinners.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Winners</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {sessionWinners.map((winner, idx) => (
                      <div key={winner.timestamp} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {winner.participant.firstName} {winner.participant.lastName}
                        </span>
                        <span className="font-mono">#{winner.participant.ticketNumber}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Spinner Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-8">
                {/* Winner Display */}
                {currentWinner && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-brand-gold/20 to-brand-gold/10 border border-brand-gold rounded-lg">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-brand-gold">🎉 Winner! 🎉</p>
                      <p className="text-xl mt-2">
                        {currentWinner.firstName} {currentWinner.lastName}
                      </p>
                      <p className="text-lg text-muted-foreground">
                        Ticket #{currentWinner.ticketNumber}
                      </p>
                    </div>
                  </div>
                )}

                {/* Spinner Component */}
                <div className="flex justify-center">
                  <SlotMachineWheel
                    participants={participants}
                    targetTicketNumber={ticketNumber}
                    settings={DEFAULT_SETTINGS}
                    isSpinning={isSpinning}
                    onSpinComplete={handleSpinComplete}
                    onError={(error) => {
                      setError(error);
                      setIsSpinning(false);
                    }}
                    theme={{
                      nameColor: '#ffffff',
                      ticketColor: '#fbbf24',
                      backgroundColor: '#1f2937',
                      borderColor: '#fbbf24',
                      highlightColor: '#ec4899',
                      nameSize: 'large',
                      ticketSize: 'extra-large',
                      fontFamily: 'system-ui',
                    }}
                  />
                </div>

                {/* Instructions */}
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">How to Use:</h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Generate sample participants (default: 100)</li>
                    <li>Enter a ticket number or click the shuffle icon for random</li>
                    <li>Click "Spin to Win!" to start the animation</li>
                    <li>Watch as the wheel spins and lands on the winner</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-brand-blue/10 to-brand-blue/5">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">🎯 Performance Optimized</h3>
              <p className="text-sm text-muted-foreground">
                Handles 5000+ participants at 60fps using intelligent subset swapping
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-brand-pink/10 to-brand-pink/5">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">🎨 Customizable Theme</h3>
              <p className="text-sm text-muted-foreground">
                Fully customizable colors, fonts, and sizes to match your brand
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-brand-gold/10 to-brand-gold/5">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">🎰 Slot Machine Style</h3>
              <p className="text-sm text-muted-foreground">
                Engaging slot machine animation with smooth physics-based motion
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <Card className="mt-8 bg-gradient-to-r from-brand-blue/20 to-brand-pink/20">
          <CardContent className="py-12">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Ready for the Full Experience?</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Install the Chrome extension to get CSV import, competition management, winner
                tracking, custom branding, and much more!
              </p>
              <Button size="lg" asChild>
                <a
                  href="https://chrome.google.com/webstore"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get the Chrome Extension
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
