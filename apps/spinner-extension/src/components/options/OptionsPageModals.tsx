/**
 * OptionsPage modal components
 * Extracted from OptionsPage.tsx to improve file size and separation of concerns
 */

import { Competition, ColumnMapping, SavedMapping } from '@raffle-spinner/storage';
import { CSVUploadModal } from './CSVUploadModal';
import { ColumnMapper } from './ColumnMapper';
import { DuplicateHandler } from './DuplicateHandler';
import { TicketConversionDialog } from './TicketConversionDialog';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';

interface OptionsPageModalsProps {
  // CSV Upload Modal
  showNameModal: boolean;
  selectedFile: File | null;
  onNameModalClose: () => void;
  onNameConfirm: (name: string) => void;
  
  // Column Mapper Modal
  showMapperModal: boolean;
  detectedHeaders: string[];
  detectedMapping: Partial<ColumnMapping>;
  savedMappings: SavedMapping[];
  suggestedMappingId: string | null | undefined;
  onMapperModalClose: () => void;
  onMappingConfirm: (mapping: ColumnMapping, saveName?: string) => void;
  
  // Duplicate Handler Modal
  showDuplicateModal: boolean;
  duplicates: Array<{ ticketNumber: string; names: string[] }>;
  onDuplicateProceed: () => void;
  onDuplicateCancel: () => void;
  
  // Ticket Conversion Modal
  showConversionModal: boolean;
  ticketConversions: Array<{
    original: string;
    converted: string | null;
    firstName: string;
    lastName: string;
  }>;
  onConversionProceed: () => void;
  onConversionCancel: () => void;
  
  // Delete Confirmation Modal
  showDeleteDialog: boolean;
  competitionToDelete: Competition | null;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
}

export function OptionsPageModals({
  showNameModal,
  selectedFile,
  onNameModalClose,
  onNameConfirm,
  showMapperModal,
  detectedHeaders,
  detectedMapping,
  savedMappings,
  suggestedMappingId,
  onMapperModalClose,
  onMappingConfirm,
  showDuplicateModal,
  duplicates,
  onDuplicateProceed,
  onDuplicateCancel,
  showConversionModal,
  ticketConversions,
  onConversionProceed,
  onConversionCancel,
  showDeleteDialog,
  competitionToDelete,
  onDeleteConfirm,
  onDeleteCancel,
}: OptionsPageModalsProps) {
  return (
    <>
      <CSVUploadModal
        open={showNameModal}
        onClose={onNameModalClose}
        onConfirm={onNameConfirm}
        fileName={selectedFile?.name || ''}
      />

      <ColumnMapper
        open={showMapperModal}
        onClose={onMapperModalClose}
        headers={detectedHeaders}
        detectedMapping={detectedMapping}
        onConfirm={onMappingConfirm}
        savedMappings={savedMappings}
        suggestedMappingId={suggestedMappingId || undefined}
      />

      <DuplicateHandler
        open={showDuplicateModal}
        duplicates={duplicates}
        onProceed={onDuplicateProceed}
        onCancel={onDuplicateCancel}
      />

      <TicketConversionDialog
        open={showConversionModal}
        conversions={ticketConversions}
        onProceed={onConversionProceed}
        onCancel={onConversionCancel}
      />

      <DeleteConfirmDialog
        open={showDeleteDialog}
        competition={competitionToDelete}
        onConfirm={onDeleteConfirm}
        onCancel={onDeleteCancel}
      />
    </>
  );
}