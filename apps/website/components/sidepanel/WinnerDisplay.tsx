'use client';

/**
 * Winner Display Component (Website Integration)
 */

import { Participant } from '@raffle-spinner/storage';
import { Card, CardContent, Button } from '@drawday/ui';
import { Trophy, RotateCcw, Sparkles } from 'lucide-react';

interface WinnerDisplayProps {
  winner: Participant;
  onNewSession: () => void;
  onReset: () => void;
}

export function WinnerDisplay({ winner, onNewSession, onReset }: WinnerDisplayProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
      <Card className="mx-4 max-w-md w-full">
        <CardContent className="p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <Trophy className="h-20 w-20 text-yellow-500" />
              <Sparkles className="h-8 w-8 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold">🎉 Winner! 🎉</h2>
            <p className="text-xl font-semibold">
              {winner.firstName} {winner.lastName}
            </p>
            <p className="text-lg text-muted-foreground">Ticket #{winner.ticketNumber}</p>
          </div>

          <div className="flex gap-3 justify-center">
            <Button onClick={onReset} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Spin Again
            </Button>
            <Button onClick={onNewSession}>New Session</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
