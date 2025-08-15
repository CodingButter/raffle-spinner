/**
 * Winner Display Component
 *
 * Purpose: Shows the current winner with celebration effects and keyboard shortcuts.
 * Extracted from SidePanel for better component separation.
 *
 * SRS Reference:
 * - FR-2.2: Winner Selection and Animation
 * - FR-2.4: Winner Display and Session History
 */

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Sparkles, RotateCcw } from 'lucide-react';
import type { Participant } from '@raffle-spinner/storage';

interface WinnerDisplayProps {
  winner: Participant;
  onNewSession: () => void;
  onReset: () => void;
}

export function WinnerDisplay({ winner, onNewSession, onReset }: WinnerDisplayProps) {
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
          
          {/* Winner Actions */}
          <div className="flex gap-2 mt-6 justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onNewSession}
                  size="sm"
                  variant="secondary"
                  className="bg-gray-900/10 hover:bg-gray-900/20 text-gray-900"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  New Session (N)
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Start new session (Press N)</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onReset}
                  size="sm"
                  variant="secondary"
                  className="bg-gray-900/10 hover:bg-gray-900/20 text-gray-900"
                >
                  Reset (R)
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset spinner (Press R)</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}