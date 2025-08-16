/**
 * Column Mapper Component
 *
 * Purpose: Modal interface for mapping CSV column headers to required data fields
 * (First Name, Last Name, Ticket Number) with auto-detection and manual override.
 *
 * SRS Reference:
 * - FR-1.4: Column Mapping Interface
 * - FR-1.5: Data Validation and Error Handling
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ColumnMapping, SavedMapping } from '@raffle-spinner/storage';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { helpContent } from '@/lib/help-content';
import { SavedMappingSelector } from './column-mapper/SavedMappingSelector';
import { NameFormatSelector } from './column-mapper/NameFormatSelector';
import { ColumnSelectors } from './column-mapper/ColumnSelectors';
import { SaveMappingOption } from './column-mapper/SaveMappingOption';
import { useColumnMapperLogic } from './column-mapper/useColumnMapperLogic';

interface ColumnMapperProps {
  open: boolean;
  onClose: () => void;
  headers: string[];
  detectedMapping: Partial<ColumnMapping>;
  onConfirm: (mapping: ColumnMapping, saveMapping?: SavedMapping) => void;
  savedMappings?: SavedMapping[];
  suggestedMappingId?: string;
}

export function ColumnMapper({
  open,
  onClose,
  headers,
  detectedMapping,
  onConfirm,
  savedMappings = [],
  suggestedMappingId,
}: ColumnMapperProps) {
  const {
    mapping,
    useFullName,
    shouldSaveMapping,
    mappingName,
    selectedSavedMappingId,
    isValid,
    setMapping,
    setShouldSaveMapping,
    setMappingName,
    handleSelectSavedMapping,
    handleConfirm,
    handleFormatChange,
  } = useColumnMapperLogic({
    detectedMapping,
    savedMappings,
    suggestedMappingId,
    onConfirm,
  });

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Map CSV Columns
            <InfoTooltip {...helpContent.columnMapping.overview} />
          </DialogTitle>
          <DialogDescription>
            Select which columns in your CSV correspond to the required fields.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <SavedMappingSelector
            savedMappings={savedMappings}
            selectedSavedMappingId={selectedSavedMappingId}
            suggestedMappingId={suggestedMappingId}
            onSelectMapping={handleSelectSavedMapping}
          />

          <NameFormatSelector useFullName={useFullName} onFormatChange={handleFormatChange} />

          <ColumnSelectors
            headers={headers}
            mapping={mapping}
            useFullName={useFullName}
            onMappingChange={setMapping}
          />

          <SaveMappingOption
            shouldSaveMapping={shouldSaveMapping}
            mappingName={mappingName}
            selectedSavedMappingId={selectedSavedMappingId}
            onSaveToggle={setShouldSaveMapping}
            onNameChange={setMappingName}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isValid || (shouldSaveMapping && !mappingName.trim())}
          >
            Confirm Mapping
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
