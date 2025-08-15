/**
 * Competition Selector Component
 *
 * Purpose: Competition selection dropdown with keyboard shortcut indicators.
 * Extracted from SidePanel for better separation of concerns.
 *
 * SRS Reference:
 * - FR-2.1: Side Panel Interface
 * - FR-1.6: Competition Management
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { Competition } from '@raffle-spinner/storage';

interface CompetitionSelectorProps {
  competitions: Competition[];
  selectedCompetition: Competition | null;
  onSelectCompetition: (id: string) => void;
}

export function CompetitionSelector({
  competitions,
  selectedCompetition,
  onSelectCompetition,
}: CompetitionSelectorProps) {
  return (
    <div className="flex gap-2">
      <div className="flex-1 relative">
        <Tooltip>
          <TooltipTrigger asChild>
            <Select
              value={selectedCompetition?.id || ''}
              onValueChange={onSelectCompetition}
            >
              <SelectTrigger 
                data-competition-selector
                className="bg-card border-border text-card-foreground"
              >
                <SelectValue placeholder="Select Competition" />
              </SelectTrigger>
              <SelectContent>
                {competitions.map((comp) => (
                  <SelectItem key={comp.id} value={comp.id}>
                    {comp.name} ({comp.participants.length})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </TooltipTrigger>
          <TooltipContent>
            <p>Select competition (Press C to focus)</p>
          </TooltipContent>
        </Tooltip>
        <div className="absolute right-10 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
          C
        </div>
      </div>
    </div>
  );
}