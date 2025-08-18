/**
 * WinnerOverlay Component
 * 
 * Purpose: Displays animated winner announcement overlay for persistent sessions
 * Extracted from SidePanelWithPersistence.tsx to maintain file size limits
 * 
 * Architecture Decision:
 * - Simplified winner presentation without actions
 * - Used specifically for persistent session context
 * - Clear separation from interactive WinnerDisplay
 */
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import type { Participant } from '@raffle-spinner/storage';

interface WinnerOverlayProps {
  winner: Participant | null;
}

export function WinnerOverlay({ winner }: WinnerOverlayProps) {
  if (!winner) {
    return null;
  }

  return (
    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-4 z-10 animate-winner-reveal">
      <Card className="bg-gradient-to-r from-brand-gold/95 to-brand-gold/90 border-brand-gold animate-winner-glow shadow-2xl">
        <CardContent className="p-8">
          <div className="flex items-center gap-4">
            <Sparkles className="h-12 w-12 text-gray-900 animate-pulse flex-shrink-0" />
            <div className="flex-1 text-center">
              <p className="text-4xl font-bold text-gray-900 leading-tight">
                🎉 {winner.firstName} {winner.lastName}
              </p>
              <p className="text-2xl font-semibold text-gray-800 mt-2">
                Ticket #{winner.ticketNumber}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}