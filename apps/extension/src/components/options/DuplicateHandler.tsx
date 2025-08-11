/**
 * Duplicate Handler Component
 *
 * Purpose: Modal dialog for handling duplicate ticket numbers found in CSV uploads,
 * allowing users to proceed with first occurrence only or cancel the upload.
 *
 * SRS Reference:
 * - FR-1.5: Data Validation and Error Handling
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { helpContent } from '@/lib/help-content';

interface DuplicateHandlerProps {
  open: boolean;
  duplicates: Array<{ ticketNumber: string; names: string[] }>;
  onProceed: () => void;
  onCancel: () => void;
}

export function DuplicateHandler({ open, duplicates, onProceed, onCancel }: DuplicateHandlerProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Duplicate Ticket Numbers Found
            <InfoTooltip {...helpContent.ticketHandling.duplicates} />
          </DialogTitle>
          <DialogDescription>
            We found duplicate ticket numbers in your CSV file. Only the first occurrence of each
            duplicate will be kept if you proceed.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-64 overflow-y-auto space-y-2">
          {duplicates.map((dup) => (
            <Alert key={dup.ticketNumber} className="py-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Ticket #{dup.ticketNumber}</strong>
                <ul className="mt-1 ml-4 text-xs">
                  {dup.names.map((name, idx) => (
                    <li key={idx}>{name}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel Upload
          </Button>
          <Button onClick={onProceed} variant="destructive">
            Proceed (Keep First Only)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
