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
import { ColumnMapping } from '@raffle-spinner/storage';

interface ColumnMapperProps {
  open: boolean;
  onClose: () => void;
  headers: string[];
  detectedMapping: Partial<ColumnMapping>;
  onConfirm: (mapping: ColumnMapping) => void;
}

export function ColumnMapper({
  open,
  onClose,
  headers,
  detectedMapping,
  onConfirm,
}: ColumnMapperProps) {
  const [mapping, setMapping] = React.useState<Partial<ColumnMapping>>(detectedMapping);

  React.useEffect(() => {
    setMapping(detectedMapping);
  }, [detectedMapping]);

  const handleConfirm = () => {
    if (mapping.firstName && mapping.lastName && mapping.ticketNumber) {
      onConfirm(mapping as ColumnMapping);
    }
  };

  const isValid = mapping.firstName && mapping.lastName && mapping.ticketNumber;

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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!isValid}>
            Confirm Mapping
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
