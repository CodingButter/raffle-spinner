/**
 * Delete Confirmation Dialog Component
 *
 * Purpose: Modal dialog to confirm deletion of competitions with clear
 * messaging and cancel/confirm actions.
 *
 * SRS Reference:
 * - FR-1.6: Competition Management (deletion with confirmation)
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Competition } from '@raffle-spinner/storage';

interface DeleteConfirmDialogProps {
  open: boolean;
  competition: Competition | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({
  open,
  competition,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  if (!competition) return null;

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Competition?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Are you sure you want to delete <strong>{competition.name}</strong>?
            </p>
            <p className="text-sm">
              This will permanently remove {competition.participants.length} participants from this
              competition. This action cannot be undone.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete Competition
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
