/**
 * Save Mapping Option Component
 * Allows user to save the current mapping configuration
 */

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

interface SaveMappingOptionProps {
  shouldSaveMapping: boolean;
  mappingName: string;
  selectedSavedMappingId: string;
  onSaveToggle: (checked: boolean) => void;
  onNameChange: (name: string) => void;
}

export function SaveMappingOption({
  shouldSaveMapping,
  mappingName,
  selectedSavedMappingId,
  onSaveToggle,
  onNameChange,
}: SaveMappingOptionProps) {
  return (
    <div className="space-y-2 pt-4 border-t">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="saveMapping"
          checked={shouldSaveMapping}
          onCheckedChange={(checked) => onSaveToggle(checked as boolean)}
          disabled={!!selectedSavedMappingId}
        />
        <Label htmlFor="saveMapping" className="font-normal cursor-pointer">
          Save this mapping for future use
        </Label>
      </div>
      {shouldSaveMapping && (
        <Input
          placeholder="Enter a name for this mapping (e.g., 'Standard Format')"
          value={mappingName}
          onChange={(e) => onNameChange(e.target.value)}
        />
      )}
    </div>
  );
}
