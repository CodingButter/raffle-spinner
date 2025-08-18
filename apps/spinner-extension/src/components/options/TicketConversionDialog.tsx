/**
 * Ticket Conversion Dialog Component
 *
 * Purpose: Shows a preview of non-numeric ticket conversions and allows
 * the user to proceed or cancel the import.
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
import { AlertCircle, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { helpContent } from '@/lib/help-content';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export interface TicketConversion {
  original: string;
  converted: string | null;
  firstName: string;
  lastName: string;
}

interface TicketConversionDialogProps {
  open: boolean;
  conversions: TicketConversion[];
  onProceed: () => void;
  onCancel: () => void;
}

export function TicketConversionDialog({
  open,
  conversions,
  onProceed,
  onCancel,
}: TicketConversionDialogProps) {
  const invalidTickets = conversions.filter((c) => !c.converted);
  const validConversions = conversions.filter((c) => c.converted);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Non-Numeric Ticket Numbers Detected
            <InfoTooltip {...helpContent.ticketHandling.nonNumeric} />
          </DialogTitle>
          <DialogDescription>
            We found ticket numbers containing letters or special characters. We only support
            numeric tickets and will extract the numeric portion where possible.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {invalidTickets.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>{invalidTickets.length} ticket(s) cannot be converted</strong> because they
                contain no numeric characters. These entries will be skipped.
              </AlertDescription>
            </Alert>
          )}

          {validConversions.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">
                The following tickets will be converted to numeric format:
              </p>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Original Ticket</TableHead>
                      <TableHead></TableHead>
                      <TableHead>Converted Ticket</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validConversions.slice(0, 10).map((conversion, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {conversion.firstName} {conversion.lastName}
                        </TableCell>
                        <TableCell className="font-mono">{conversion.original}</TableCell>
                        <TableCell>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </TableCell>
                        <TableCell className="font-mono font-semibold text-green-600">
                          {conversion.converted}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {validConversions.length > 10 && (
                <p className="text-sm text-muted-foreground">
                  ... and {validConversions.length - 10} more conversions
                </p>
              )}
            </div>
          )}

          <div className="bg-muted border rounded-lg p-3">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Examples of conversion:</strong>
              <br />• {'"ABC123"'} → {'"123"'}
              <br />• {'"T-456-X"'} → {'"456"'}
              <br />• {'"00789"'} → {'"789"'}
              <br />• {'"TICKET"'} → (skipped - no numbers)
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel Import
          </Button>
          <Button onClick={onProceed} disabled={validConversions.length === 0}>
            Proceed with {validConversions.length} Valid Entries
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
