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
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Trophy, Download, Trash2 } from 'lucide-react';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { helpContent } from '@/lib/help-content';

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
            <InfoTooltip {...helpContent.sessionWinners.overview} iconSize="sm" />
          </CardTitle>
          <div className="flex gap-1">
            {onExport && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    data-export-button
                    onClick={onExport}
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2"
                  >
                    <Download className="h-4 w-4" />
                    <span className="ml-1 text-xs">E</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Export winners (Press E)</p>
                </TooltipContent>
              </Tooltip>
            )}
            {onClear && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    data-clear-button
                    onClick={onClear}
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="ml-1 text-xs">⇧C</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clear all winners (Press Shift+C)</p>
                </TooltipContent>
              </Tooltip>
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
