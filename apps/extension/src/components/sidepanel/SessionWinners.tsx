/**
 * Session Winners Component
 *
 * Purpose: Displays a historical list of winners selected during the current
 * session, showing names, ticket numbers, competitions, and timestamps.
 *
 * SRS Reference:
 * - FR-2.4: Winner Display and Session History
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

export interface Winner {
  firstName: string;
  lastName: string;
  ticketNumber: string;
  competition: string;
  timestamp: number;
}

interface SessionWinnersProps {
  winners: Winner[];
}

export function SessionWinners({ winners }: SessionWinnersProps) {
  if (winners.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Session Winners
        </CardTitle>
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
