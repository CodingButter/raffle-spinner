/**
 * Options Page Component
 *
 * Purpose: Main configuration page for the Raffle Spinner extension that handles
 * competition management, CSV uploads, column mapping, and spinner settings.
 *
 * SRS Reference:
 * - FR-1.1: CSV File Upload Interface
 * - FR-1.2: CSV Parser Integration
 * - FR-1.3: File Format Validation
 * - FR-1.4: Column Mapping Interface
 * - FR-1.5: Data Validation and Error Handling
 * - FR-1.6: Competition Management
 * - FR-1.7: Spinner Physics Configuration
 */

import { useState, useRef } from 'react';
import { CompetitionProvider, useCompetitions } from '@/contexts/CompetitionContext';
import { SettingsProvider, useSettings } from '@/contexts/SettingsContext';
import { useCSVUpload } from '@/hooks/useCSVUpload';
import { CompetitionList } from '@/components/options/CompetitionList';
import { CSVUploadModal } from '@/components/options/CSVUploadModal';
import { ColumnMapper } from '@/components/options/ColumnMapper';
import { DuplicateHandler } from '@/components/options/DuplicateHandler';
import { SpinnerSettings } from '@/components/options/SpinnerSettings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, CheckCircle, Settings } from 'lucide-react';
import { ColumnMapping } from '@raffle-spinner/storage';

function OptionsContent() {
  const { competitions, addCompetition, deleteCompetition } = useCompetitions();
  const { settings, columnMapping, updateSettings, updateColumnMapping } = useSettings();
  const { upload, detectColumns } = useCSVUpload();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showMapperModal, setShowMapperModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>([]);
  const [detectedMapping, setDetectedMapping] = useState<Partial<ColumnMapping>>({});
  const [duplicates, setDuplicates] = useState<Array<{ ticketNumber: string; names: string[] }>>(
    []
  );
  const [competitionName, setCompetitionName] = useState('');
  const [importSummary, setImportSummary] = useState<{ success: boolean; message: string } | null>(
    null
  );
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setImportSummary(null);

    try {
      const { headers, detected } = await detectColumns(file);
      setDetectedHeaders(headers);

      if (!columnMapping) {
        setDetectedMapping({
          firstName: detected.firstName || '',
          lastName: detected.lastName || '',
          ticketNumber: detected.ticketNumber || '',
        });
        setShowMapperModal(true);
      } else {
        setShowNameModal(true);
      }
    } catch (error) {
      console.error('Failed to detect columns:', error);
    }
  };

  const handleMappingConfirm = async (mapping: ColumnMapping) => {
    await updateColumnMapping(mapping);
    setShowMapperModal(false);
    setShowNameModal(true);
  };

  const handleNameConfirm = async (name: string) => {
    setCompetitionName(name);
    setShowNameModal(false);

    if (!selectedFile || !columnMapping) return;

    try {
      const result = await upload(selectedFile, name, columnMapping);

      if (result.duplicates.length > 0) {
        setDuplicates(result.duplicates);
        setShowDuplicateModal(true);
      } else {
        await addCompetition(result.competition);
        setImportSummary({
          success: true,
          message: `Success! ${result.competition.participants.length} participants imported. ${
            result.skippedRows > 0
              ? `${result.skippedRows} rows were skipped due to missing data.`
              : ''
          }`,
        });
      }
    } catch (error) {
      setImportSummary({
        success: false,
        message: 'Failed to import CSV. Please check the file format.',
      });
    }

    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDuplicateProceed = async () => {
    setShowDuplicateModal(false);

    if (!selectedFile || !columnMapping || !competitionName) return;

    try {
      const result = await upload(selectedFile, competitionName, columnMapping);
      await addCompetition(result.competition);
      setImportSummary({
        success: true,
        message: `Success! ${result.competition.participants.length} participants imported. ${
          result.duplicates.length
        } duplicate ticket numbers were found (only first occurrence kept). ${
          result.skippedRows > 0
            ? `${result.skippedRows} rows were skipped due to missing data.`
            : ''
        }`,
      });
    } catch (error) {
      setImportSummary({
        success: false,
        message: 'Failed to import CSV.',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirmDelete === id) {
      await deleteCompetition(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
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
            {importSummary.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertDescription>{importSummary.message}</AlertDescription>
            )}
            {importSummary.success && <AlertDescription>{importSummary.message}</AlertDescription>}
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Competition Management</CardTitle>
            <CardDescription>
              Upload CSV files to create competitions for your raffles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button onClick={() => fileInputRef.current?.click()} className="gap-2">
                <Upload className="h-4 w-4" />
                Upload New Competition
              </Button>
              {columnMapping && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setDetectedHeaders(['First Name', 'Last Name', 'Ticket Number']);
                    setDetectedMapping(columnMapping);
                    setShowMapperModal(true);
                  }}
                  className="gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Configure Column Mapping
                </Button>
              )}
            </div>

            <CompetitionList competitions={competitions} onDelete={handleDelete} />
          </CardContent>
        </Card>

        <SpinnerSettings settings={settings} onUpdate={updateSettings} />

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
        />

        <DuplicateHandler
          open={showDuplicateModal}
          duplicates={duplicates}
          onProceed={handleDuplicateProceed}
          onCancel={() => setShowDuplicateModal(false)}
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
