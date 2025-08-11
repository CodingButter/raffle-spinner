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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ColumnMapping, SavedMapping, storage } from '@raffle-spinner/storage';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

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
  const [mapping, setMapping] = React.useState<Partial<ColumnMapping>>(detectedMapping);
  const [useFullName, setUseFullName] = React.useState<boolean>(
    !!detectedMapping.fullName || (!detectedMapping.firstName && !detectedMapping.lastName)
  );
  const [shouldSaveMapping, setShouldSaveMapping] = React.useState(false);
  const [mappingName, setMappingName] = React.useState('');
  const [selectedSavedMappingId, setSelectedSavedMappingId] = React.useState<string>('');

  React.useEffect(() => {
    // If we have a suggested mapping, use it
    if (suggestedMappingId && savedMappings.length > 0) {
      const suggested = savedMappings.find((m) => m.id === suggestedMappingId);
      if (suggested) {
        setMapping(suggested.mapping);
        setUseFullName(!!suggested.mapping.fullName);
        setSelectedSavedMappingId(suggestedMappingId);
        return;
      }
    }

    // Otherwise use detected mapping
    setMapping(detectedMapping);
    setUseFullName(
      !!detectedMapping.fullName || (!detectedMapping.firstName && !detectedMapping.lastName)
    );
  }, [detectedMapping, suggestedMappingId, savedMappings]);

  const handleConfirm = async () => {
    const finalMapping = useFullName
      ? { fullName: mapping.fullName, ticketNumber: mapping.ticketNumber }
      : {
          firstName: mapping.firstName,
          lastName: mapping.lastName,
          ticketNumber: mapping.ticketNumber,
        };

    if (
      (useFullName && finalMapping.fullName && finalMapping.ticketNumber) ||
      (!useFullName && finalMapping.firstName && finalMapping.lastName && finalMapping.ticketNumber)
    ) {
      let savedMapping: SavedMapping | undefined;

      if (shouldSaveMapping && mappingName.trim()) {
        savedMapping = {
          id: `mapping-${Date.now()}`,
          name: mappingName.trim(),
          mapping: finalMapping as ColumnMapping,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          usageCount: 1,
          isDefault: false,
        };
        await storage.saveSavedMapping(savedMapping);
      } else if (selectedSavedMappingId) {
        // Increment usage count of existing mapping
        const existing = savedMappings.find((m) => m.id === selectedSavedMappingId);
        if (existing) {
          await storage.saveSavedMapping({
            ...existing,
            usageCount: existing.usageCount + 1,
          });
        }
      }

      onConfirm(finalMapping as ColumnMapping, savedMapping);
    }
  };

  const handleSelectSavedMapping = (mappingId: string) => {
    if (mappingId === 'manual') {
      // Reset to manual configuration
      setSelectedSavedMappingId('');
      setShouldSaveMapping(false);
      // Keep current mapping or use detected
      setMapping(detectedMapping);
      setUseFullName(
        !!detectedMapping.fullName || (!detectedMapping.firstName && !detectedMapping.lastName)
      );
    } else {
      const saved = savedMappings.find((m) => m.id === mappingId);
      if (saved) {
        setMapping(saved.mapping);
        setUseFullName(!!saved.mapping.fullName);
        setSelectedSavedMappingId(mappingId);
        setShouldSaveMapping(false);
      }
    }
  };

  const isValid = useFullName
    ? mapping.fullName && mapping.ticketNumber
    : mapping.firstName && mapping.lastName && mapping.ticketNumber;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Map CSV Columns</DialogTitle>
          <DialogDescription>
            Select which columns in your CSV correspond to the required fields.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Saved Mappings Selector */}
          {savedMappings.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="savedMapping">Use Saved Mapping</Label>
              <Select
                value={selectedSavedMappingId || 'manual'}
                onValueChange={handleSelectSavedMapping}
              >
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
                    This mapping was automatically selected based on your default or most recently
                    used settings.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
          {/* Toggle between full name and separate name columns */}
          <div className="flex items-center space-x-2 pb-2 border-b">
            <input
              type="radio"
              id="separateNames"
              name="nameFormat"
              checked={!useFullName}
              onChange={() => {
                setUseFullName(false);
                setMapping({ ...mapping, fullName: undefined });
              }}
              className="h-4 w-4"
            />
            <Label htmlFor="separateNames" className="font-normal cursor-pointer">
              Separate first and last name columns
            </Label>
          </div>

          <div className="flex items-center space-x-2 pb-2 border-b">
            <input
              type="radio"
              id="fullName"
              name="nameFormat"
              checked={useFullName}
              onChange={() => {
                setUseFullName(true);
                setMapping({ ...mapping, firstName: undefined, lastName: undefined });
              }}
              className="h-4 w-4"
            />
            <Label htmlFor="fullName" className="font-normal cursor-pointer">
              Single column with full names
            </Label>
          </div>

          {/* Show appropriate fields based on selection */}
          {useFullName ? (
            <div className="space-y-2">
              <Label htmlFor="fullNameColumn">Full Name Column</Label>
              <Select
                value={mapping.fullName || ''}
                onValueChange={(value) => setMapping({ ...mapping, fullName: value })}
              >
                <SelectTrigger id="fullNameColumn">
                  <SelectValue placeholder="Select a column" />
                </SelectTrigger>
                <SelectContent>
                  {headers.map((header) => (
                    <SelectItem key={header} value={header}>
                      {header}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Names will be automatically split. Supports &quot;First Last&quot;, &quot;Last,
                First&quot;, and multi-word names.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name Column</Label>
                <Select
                  value={mapping.firstName || ''}
                  onValueChange={(value) => setMapping({ ...mapping, firstName: value })}
                >
                  <SelectTrigger id="firstName">
                    <SelectValue placeholder="Select a column" />
                  </SelectTrigger>
                  <SelectContent>
                    {headers.map((header) => (
                      <SelectItem key={header} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name Column</Label>
                <Select
                  value={mapping.lastName || ''}
                  onValueChange={(value) => setMapping({ ...mapping, lastName: value })}
                >
                  <SelectTrigger id="lastName">
                    <SelectValue placeholder="Select a column" />
                  </SelectTrigger>
                  <SelectContent>
                    {headers.map((header) => (
                      <SelectItem key={header} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="ticketNumber">Ticket Number Column</Label>
            <Select
              value={mapping.ticketNumber || ''}
              onValueChange={(value) => setMapping({ ...mapping, ticketNumber: value })}
            >
              <SelectTrigger id="ticketNumber">
                <SelectValue placeholder="Select a column" />
              </SelectTrigger>
              <SelectContent>
                {headers.map((header) => (
                  <SelectItem key={header} value={header}>
                    {header}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Save Mapping Option */}
          <div className="space-y-2 pt-4 border-t">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="saveMapping"
                checked={shouldSaveMapping}
                onCheckedChange={(checked) => setShouldSaveMapping(checked as boolean)}
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
                onChange={(e) => setMappingName(e.target.value)}
              />
            )}
          </div>
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
