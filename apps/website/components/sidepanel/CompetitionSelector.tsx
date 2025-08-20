'use client';

/**
 * Competition Selector Component (Website Integration)
 */

import { Competition } from '@raffle-spinner/storage';
import { Select } from '@drawday/ui';

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
    <div className="w-full">
      <select
        data-competition-selector
        value={selectedCompetition?.id || ''}
        onChange={(e) => onSelectCompetition(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select a competition</option>
        {competitions.map((competition) => (
          <option key={competition.id} value={competition.id}>
            {competition.name} ({competition.participants.length} participants)
          </option>
        ))}
      </select>
    </div>
  );
}
