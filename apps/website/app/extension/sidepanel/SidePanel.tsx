/**
 * Side Panel Component (Architecture Demo)
 * 
 * Simplified version demonstrating the architecture
 * Full implementation pending component creation
 */

'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { CompetitionProvider } from '@/contexts/CompetitionContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, RotateCcw } from 'lucide-react';

// Dynamic import for future Canvas component
const SlotMachineWheel = dynamic(
  () => import('@raffle-spinner/spinners').then(mod => mod.SlotMachineWheel),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[400px] bg-muted rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading spinner...</p>
        </div>
      </div>
    )
  }
);

function SidePanelContent() {
  const [isSpinning, setIsSpinning] = useState(false);

  const handleSpin = () => {
    setIsSpinning(true);
    // Simulate spin
    setTimeout(() => {
      setIsSpinning(false);
    }, 3000);
  };

  const handleReset = () => {
    setIsSpinning(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto space-y-4 p-4">
        <Card>
          <CardHeader>
            <CardTitle>Raffle Spinner</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-8 bg-muted rounded-lg">
              <p className="text-lg font-medium mb-2">Spinner Component</p>
              <p className="text-sm text-muted-foreground">
                SlotMachine spinner will render here
              </p>
            </div>

            <div className="flex gap-2 justify-center">
              <Button
                onClick={handleSpin}
                disabled={isSpinning}
                size="lg"
              >
                <Play className="mr-2 h-4 w-4" />
                {isSpinning ? 'Spinning...' : 'Spin'}
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                size="lg"
                disabled={!isSpinning}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>Architecture demo - full features coming soon</p>
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
            <SidePanelContent />
          </SettingsProvider>
        </CompetitionProvider>
      </AuthGuard>
    </ThemeProvider>
  );
}