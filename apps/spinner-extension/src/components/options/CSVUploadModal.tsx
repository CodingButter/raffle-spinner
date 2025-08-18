/**
 * CSV Upload Modal Component
 *
 * Purpose: Modal dialog for naming a competition after CSV file selection,
 * providing user confirmation before processing the uploaded data.
 *
 * SRS Reference:
 * - FR-1.1: CSV File Upload Interface
 * - FR-1.6: Competition Management
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CSVUploadModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
  fileName: string;
}

export function CSVUploadModal({ open, onClose, onConfirm, fileName }: CSVUploadModalProps) {
  const [competitionName, setCompetitionName] = useState('');

  const handleConfirm = () => {
    if (competitionName.trim()) {
      onConfirm(competitionName.trim());
      setCompetitionName('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Name Your Competition</DialogTitle>
          <DialogDescription>
            Give your competition a memorable name for easy identification.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              File selected: <strong>{fileName}</strong>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="competition-name">Competition Name</Label>
            <Input
              id="competition-name"
              value={competitionName}
              onChange={(e) => setCompetitionName(e.target.value)}
              placeholder="e.g., Summer Raffle 2025"
              autoFocus
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!competitionName.trim()}>
            Save Competition
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
