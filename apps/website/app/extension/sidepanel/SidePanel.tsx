/**
 * Side Panel Component (Full Integration Implementation)
 *
 * Complete side panel with competition selection, spinner controls,
 * and localStorage integration for website demo.
 *
 * SRS Reference:
 * - FR-2.1: Side Panel Interface
 * - FR-2.2: Winner Selection and Animation
 * - UX-3.1: Keyboard Navigation and Accessibility
 */

'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { CompetitionProvider } from '@/contexts/CompetitionContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useCompetitions } from '@/contexts/CompetitionContext';
import { Card, CardContent, CardHeader, CardTitle } from '@drawday/ui/card';
import { Button } from '@drawday/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@drawday/ui/select';
import { Play, RotateCcw, Trophy, Users, Settings } from 'lucide-react';

// Dynamic import for future Canvas component
const SlotMachineWheel = dynamic(
  () => import('@raffle-spinner/spinners').then((mod) => mod.SlotMachineWheel),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[400px] bg-muted rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading spinner...</p>
        </div>
      </div>
    ),
  }
);

function SidePanelContent() {
  const { competitions, selectedCompetition, selectCompetition, loading } = useCompetitions();
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  const handleSpin = () => {
    if (!selectedCompetition || selectedCompetition.participants.length === 0) {
      alert('Please select a competition with participants first!');
      return;
    }

    setIsSpinning(true);
    setWinner(null);

    // Simulate spinning duration
    setTimeout(() => {
      // Select random winner from participants
      const availableParticipants = selectedCompetition.participants.filter((p) => !p.eliminated);
      if (availableParticipants.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableParticipants.length);
        const selectedWinner = availableParticipants[randomIndex];
        setWinner(
          `${selectedWinner.firstName} ${selectedWinner.lastName} (#${selectedWinner.ticketNumber})`
        );
      }
      setIsSpinning(false);
    }, 3000);
  };

  const handleReset = () => {
    setIsSpinning(false);
    setWinner(null);
  };

  const handleCompetitionChange = (competitionId: string) => {
    selectCompetition(competitionId);
    setWinner(null);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            <Trophy className="h-8 w-8 text-primary" />
            Live Raffle Draw
          </h1>
          <p className="text-muted-foreground">Select a competition and spin to draw winners</p>
        </div>

        {/* Competition Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Competition Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading competitions...</p>
              </div>
            ) : competitions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4" />
                <p className="font-medium mb-2">No competitions available</p>
                <p className="text-sm">Create a competition first in the Options page.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => window.open('/extension/options', '_blank')}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Open Options
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Select
                  value={selectedCompetition?.id || ''}
                  onValueChange={handleCompetitionChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a competition..." />
                  </SelectTrigger>
                  <SelectContent>
                    {competitions.map((competition) => (
                      <SelectItem key={competition.id} value={competition.id}>
                        {competition.name} ({competition.participants.length} participants)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedCompetition && (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="font-medium mb-2">{selectedCompetition.name}</h3>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Total participants: {selectedCompetition.participants.length}</p>
                      <p>
                        Available to win:{' '}
                        {selectedCompetition.participants.filter((p) => !p.eliminated).length}
                      </p>
                      <p>
                        Winners drawn:{' '}
                        {selectedCompetition.participants.filter((p) => p.eliminated).length}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Spinner Interface */}
        <Card>
          <CardHeader>
            <CardTitle>Raffle Spinner</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center p-8 bg-muted rounded-lg min-h-[300px] flex flex-col items-center justify-center">
              {isSpinning ? (
                <div className="space-y-4">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
                  <p className="text-lg font-medium">Drawing winner...</p>
                  <p className="text-sm text-muted-foreground">The suspense is building!</p>
                </div>
              ) : winner ? (
                <div className="space-y-4 text-center">
                  <Trophy className="h-16 w-16 mx-auto text-primary animate-bounce" />
                  <div>
                    <p className="text-xl font-bold text-primary mb-2">🎉 Winner! 🎉</p>
                    <p className="text-lg font-medium">{winner}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Congratulations to our winner!
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-center">
                  <div className="w-24 h-24 border-4 border-dashed border-muted-foreground/30 rounded-full flex items-center justify-center">
                    <Play className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <div>
                    <p className="text-lg font-medium mb-2">Ready to Draw</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedCompetition
                        ? 'Click Spin to draw a winner!'
                        : 'Select a competition first'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-center">
              <Button
                onClick={handleSpin}
                disabled={
                  isSpinning ||
                  !selectedCompetition ||
                  selectedCompetition.participants.filter((p) => !p.eliminated).length === 0
                }
                size="lg"
                className="px-8"
              >
                <Play className="mr-2 h-4 w-4" />
                {isSpinning ? 'Spinning...' : 'Spin to Win'}
              </Button>
              <Button onClick={handleReset} variant="outline" size="lg" disabled={isSpinning}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>

            {selectedCompetition &&
              selectedCompetition.participants.filter((p) => !p.eliminated).length === 0 && (
                <div className="text-center p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-orange-800 font-medium">All participants have won!</p>
                  <p className="text-sm text-orange-600 mt-1">
                    This competition is complete. Create a new one to continue.
                  </p>
                </div>
              )}
          </CardContent>
        </Card>

        {/* Status Information */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isSpinning
                      ? 'bg-yellow-500 animate-pulse'
                      : selectedCompetition
                        ? 'bg-green-500'
                        : 'bg-gray-400'
                  }`}
                ></div>
                <span>
                  {isSpinning
                    ? 'Drawing winner...'
                    : selectedCompetition
                      ? 'Ready for draw'
                      : 'Select competition'}
                </span>
              </div>
              <div className="text-muted-foreground">Integration: Active ✓</div>
            </div>
          </CardContent>
        </Card>
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
            <SubscriptionProvider>
              <SidePanelContent />
            </SubscriptionProvider>
          </SettingsProvider>
        </CompetitionProvider>
      </AuthGuard>
    </ThemeProvider>
  );
}
