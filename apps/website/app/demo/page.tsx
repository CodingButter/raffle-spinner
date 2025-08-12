'use client';

import { useState } from 'react';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@raffle-spinner/ui';
import { Play, RotateCcw, Trophy } from 'lucide-react';

const DEMO_PARTICIPANTS = [
  { firstName: 'John', lastName: 'Smith', ticketNumber: '001' },
  { firstName: 'Sarah', lastName: 'Johnson', ticketNumber: '002' },
  { firstName: 'Michael', lastName: 'Williams', ticketNumber: '003' },
  { firstName: 'Emma', lastName: 'Brown', ticketNumber: '004' },
  { firstName: 'James', lastName: 'Davis', ticketNumber: '005' },
  { firstName: 'Olivia', lastName: 'Miller', ticketNumber: '006' },
  { firstName: 'William', lastName: 'Wilson', ticketNumber: '007' },
  { firstName: 'Sophia', lastName: 'Moore', ticketNumber: '008' },
  { firstName: 'Alexander', lastName: 'Taylor', ticketNumber: '009' },
  { firstName: 'Mia', lastName: 'Anderson', ticketNumber: '010' },
];

export default function DemoPage() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<typeof DEMO_PARTICIPANTS[0] | null>(null);
  const [spinHistory, setSpinHistory] = useState<typeof DEMO_PARTICIPANTS[0][]>([]);

  const handleSpin = () => {
    setIsSpinning(true);
    setWinner(null);

    // Simulate spin duration
    setTimeout(() => {
      const availableParticipants = DEMO_PARTICIPANTS.filter(
        p => !spinHistory.some(h => h.ticketNumber === p.ticketNumber)
      );
      
      if (availableParticipants.length === 0) {
        setIsSpinning(false);
        return;
      }

      const randomWinner = availableParticipants[Math.floor(Math.random() * availableParticipants.length)];
      setWinner(randomWinner);
      setSpinHistory([...spinHistory, randomWinner]);
      setIsSpinning(false);
    }, 3000);
  };

  const handleReset = () => {
    setWinner(null);
    setSpinHistory([]);
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Live Demo</h1>
          <p className="text-xl text-muted-foreground">
            Experience the excitement of the Raffle Winner Spinner
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Spinner Visualization */}
          <Card>
            <CardHeader>
              <CardTitle>Spinner Wheel</CardTitle>
              <CardDescription>Click spin to select a winner</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Simplified wheel visualization */}
                <div className="aspect-square rounded-full bg-gradient-to-br from-brand-blue via-brand-pink to-brand-gold relative overflow-hidden">
                  <div className={`absolute inset-0 flex items-center justify-center ${isSpinning ? 'animate-spin' : ''}`}>
                    <div className="text-white text-center">
                      {isSpinning ? (
                        <div>
                          <div className="text-2xl font-bold mb-2">Spinning...</div>
                          <div className="text-sm opacity-75">Selecting winner</div>
                        </div>
                      ) : winner ? (
                        <div>
                          <Trophy className="w-16 h-16 mx-auto mb-4" />
                          <div className="text-2xl font-bold">Winner!</div>
                          <div className="text-xl mt-2">
                            {winner.firstName} {winner.lastName}
                          </div>
                          <div className="text-lg opacity-75">
                            Ticket #{winner.ticketNumber}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-2xl font-bold">Ready to Spin</div>
                          <div className="text-sm opacity-75 mt-2">
                            {DEMO_PARTICIPANTS.length - spinHistory.length} participants remaining
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pointer */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2">
                  <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[30px] border-b-brand-red"></div>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <Button 
                  onClick={handleSpin} 
                  disabled={isSpinning || spinHistory.length === DEMO_PARTICIPANTS.length}
                  className="flex-1"
                  size="lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {isSpinning ? 'Spinning...' : 'Spin'}
                </Button>
                <Button 
                  onClick={handleReset}
                  variant="outline"
                  size="lg"
                  disabled={isSpinning}
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Participants and History */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Participants</CardTitle>
                <CardDescription>Demo competition with {DEMO_PARTICIPANTS.length} entries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-[300px] overflow-y-auto space-y-2">
                  {DEMO_PARTICIPANTS.map((participant) => {
                    const hasWon = spinHistory.some(h => h.ticketNumber === participant.ticketNumber);
                    return (
                      <div 
                        key={participant.ticketNumber}
                        className={`flex items-center justify-between p-2 rounded ${
                          hasWon ? 'bg-green-100 dark:bg-green-900/20' : 'bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-mono">#{participant.ticketNumber}</span>
                          <span className="text-sm">
                            {participant.firstName} {participant.lastName}
                          </span>
                        </div>
                        {hasWon && (
                          <Trophy className="w-4 h-4 text-brand-gold" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Spin History</CardTitle>
                <CardDescription>Winners from this session</CardDescription>
              </CardHeader>
              <CardContent>
                {spinHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No spins yet</p>
                ) : (
                  <div className="space-y-2">
                    {spinHistory.map((winner, index) => (
                      <div 
                        key={`${winner.ticketNumber}-${index}`}
                        className="flex items-center justify-between p-2 rounded bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold">#{index + 1}</span>
                          <span className="text-sm">
                            {winner.firstName} {winner.lastName} (#{winner.ticketNumber})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Feature Callout */}
        <Card className="mt-8 bg-gradient-to-r from-brand-blue/10 to-brand-pink/10">
          <CardContent className="py-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">This is Just a Simulation</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                The actual Chrome extension provides a full-featured slot machine wheel with smooth 60 FPS animations,
                CSV import, multiple competitions, and much more!
              </p>
              <Button size="lg" asChild>
                <a 
                  href="https://chrome.google.com/webstore" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Get the Full Extension
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}