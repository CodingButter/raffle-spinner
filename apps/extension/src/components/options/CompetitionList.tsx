/**
 * Competition List Component
 *
 * Purpose: Displays list of imported competitions with participant counts,
 * creation dates, and deletion functionality for competition management.
 *
 * SRS Reference:
 * - FR-1.6: Competition Management
 */

import { Competition } from '@raffle-spinner/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Users } from 'lucide-react';

interface CompetitionListProps {
  competitions: Competition[];
  onDelete: (id: string) => void;
}

export function CompetitionList({ competitions, onDelete }: CompetitionListProps) {
  if (competitions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            No competitions yet. Upload a CSV file to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {competitions.map((competition) => (
        <Card key={competition.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-lg">{competition.name}</CardTitle>
              <CardDescription>{competition.participants.length} participants</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(competition.id)}
              className="text-destructive hover:text-destructive/90"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Created: {new Date(competition.createdAt).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
