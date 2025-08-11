/**
 * Options Page Component (Refactored)
 *
 * Purpose: Simplified main configuration page that delegates functionality
 * to specialized hooks and components.
 *
 * SRS Reference:
 * - FR-1: Options Page Requirements (all sub-requirements)
 */

import { useState } from 'react';
import { CompetitionProvider, useCompetitions } from '@/contexts/CompetitionContext';
import { SettingsProvider, useSettings } from '@/contexts/SettingsContext';
import { useCSVImport } from '@/hooks/useCSVImport';
import { CompetitionManagement } from '@/components/options/CompetitionManagement';
import { CSVUploadModal } from '@/components/options/CSVUploadModal';
import { ColumnMapper } from '@/components/options/ColumnMapper';
import { DuplicateHandler } from '@/components/options/DuplicateHandler';
import { DeleteConfirmDialog } from '@/components/options/DeleteConfirmDialog';
import { TicketConversionDialog } from '@/components/options/TicketConversionDialog';
import { SpinnerSettings } from '@/components/options/SpinnerSettings';
import { SavedMappingsManager } from '@/components/options/SavedMappingsManager';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';
import { Competition } from '@raffle-spinner/storage';

function OptionsContent() {
  const { competitions, addCompetition, deleteCompetition } = useCompetitions();
  const { settings, columnMapping, updateSettings, updateColumnMapping } = useSettings();

  const [competitionToDelete, setCompetitionToDelete] = useState<Competition | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const {
    fileInputRef,
    selectedFile,
    showNameModal,
    showMapperModal,
    showDuplicateModal,
    showConversionModal,
    detectedHeaders,
    detectedMapping,
    duplicates,
    ticketConversions,
    importSummary,
    savedMappings,
    suggestedMappingId,
    handleFileSelect,
    handleMappingConfirm,
    handleNameConfirm,
    handleDuplicateProceed,
    handleConversionProceed,
    setShowNameModal,
    setShowMapperModal,
    setShowDuplicateModal,
    setShowConversionModal,
    openMapperModal,
  } = useCSVImport({
    addCompetition,
    columnMapping,
    updateColumnMapping,
  });

  const handleDeleteClick = (id: string) => {
    const competition = competitions.find((c) => c.id === id);
    if (competition) {
      setCompetitionToDelete(competition);
      setShowDeleteDialog(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (competitionToDelete) {
      await deleteCompetition(competitionToDelete.id);
      setCompetitionToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  const handleDeleteCancel = () => {
    setCompetitionToDelete(null);
    setShowDeleteDialog(false);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Raffle Spinner Configuration</h1>
          <p className="text-muted-foreground mt-2">
            Manage competitions and customize spinner settings
          </p>
        </div>

        {importSummary && (
          <Alert variant={importSummary.success ? 'default' : 'destructive'}>
            {importSummary.success && <CheckCircle className="h-4 w-4" />}
            <AlertDescription>{importSummary.message}</AlertDescription>
          </Alert>
        )}

        <CompetitionManagement
          competitions={competitions}
          columnMapping={columnMapping}
          fileInputRef={fileInputRef}
          onFileSelect={handleFileSelect}
          onDeleteCompetition={handleDeleteClick}
          onOpenMapper={openMapperModal}
        />

        <SpinnerSettings settings={settings} onUpdate={updateSettings} />

        <SavedMappingsManager />

        {/* Modals */}
        <CSVUploadModal
          open={showNameModal}
          onClose={() => setShowNameModal(false)}
          onConfirm={handleNameConfirm}
          fileName={selectedFile?.name || ''}
        />

        <ColumnMapper
          open={showMapperModal}
          onClose={() => setShowMapperModal(false)}
          headers={detectedHeaders}
          detectedMapping={detectedMapping}
          onConfirm={handleMappingConfirm}
          savedMappings={savedMappings}
          suggestedMappingId={suggestedMappingId}
        />

        <DuplicateHandler
          open={showDuplicateModal}
          duplicates={duplicates}
          onProceed={handleDuplicateProceed}
          onCancel={() => setShowDuplicateModal(false)}
        />

        <TicketConversionDialog
          open={showConversionModal}
          conversions={ticketConversions}
          onProceed={handleConversionProceed}
          onCancel={() => setShowConversionModal(false)}
        />

        <DeleteConfirmDialog
          open={showDeleteDialog}
          competition={competitionToDelete}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      </div>
    </div>
  );
}

export function OptionsPage() {
  return (
    <CompetitionProvider>
      <SettingsProvider>
        <OptionsContent />
      </SettingsProvider>
    </CompetitionProvider>
  );
}
