'use client';

/**
 * Session Winners Component (Website Integration)
 *
 * Purpose: Displays a historical list of winners selected during the current
 * session, adapted for website integration without extension-specific dependencies.
 */

import { Card, CardContent, CardHeader, CardTitle, Button } from '@drawday/ui';
import { Trophy, Download, Trash2 } from 'lucide-react';

export interface Winner {
  firstName: string;
  lastName: string;
  ticketNumber: string;
  competition: string;
  timestamp: number;
}

interface SessionWinnersProps {
  winners: Winner[];
  onExport?: () => void;
  onClear?: () => void;
}

export function SessionWinners({ winners, onExport, onClear }: SessionWinnersProps) {
  if (winners.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Session Winners
          </CardTitle>
          <div className="flex gap-1">
            {onExport && (
              <Button
                data-export-button
                onClick={onExport}
                size="sm"
                variant="ghost"
                className="h-8 px-2"
                title="Export winners (Press E)"
              >
                <Download className="h-4 w-4" />
                <span className="ml-1 text-xs">E</span>
              </Button>
            )}
            {onClear && (
              <Button
                data-clear-button
                onClick={onClear}
                size="sm"
                variant="ghost"
                className="h-8 px-2"
                title="Clear all winners (Press Shift+C)"
              >
                <Trash2 className="h-4 w-4" />
                <span className="ml-1 text-xs">⇧C</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-48 overflow-y-auto">
          {winners.map((winner) => (
            <div
              key={`${winner.ticketNumber}-${winner.timestamp}`}
              className="flex justify-between items-center p-3 bg-muted rounded-lg"
            >
              <div>
                <p className="font-medium">
                  {winner.firstName} {winner.lastName}
                </p>
                <p className="text-sm text-muted-foreground">Ticket #{winner.ticketNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{winner.competition}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(winner.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
