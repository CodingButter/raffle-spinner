/**
 * Saved Mapping Selector Component
 * Handles selection of pre-saved column mappings
 */

import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import type { SavedMapping } from '@raffle-spinner/storage';

interface SavedMappingSelectorProps {
  savedMappings: SavedMapping[];
  selectedSavedMappingId: string;
  suggestedMappingId?: string;
  onSelectMapping: (mappingId: string) => void;
}

export function SavedMappingSelector({
  savedMappings,
  selectedSavedMappingId,
  suggestedMappingId,
  onSelectMapping,
}: SavedMappingSelectorProps) {
  if (savedMappings.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="savedMapping">Use Saved Mapping</Label>
      <Select value={selectedSavedMappingId || 'manual'} onValueChange={onSelectMapping}>
        <SelectTrigger id="savedMapping">
          <SelectValue placeholder="Select a saved mapping or configure manually" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="manual">Configure manually</SelectItem>
          {savedMappings.map((saved) => (
            <SelectItem key={saved.id} value={saved.id}>
              {saved.name} {saved.isDefault && '(Default)'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {suggestedMappingId && selectedSavedMappingId === suggestedMappingId && (
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            This mapping was automatically selected based on your default or most recently used
            settings.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
