/**
 * CSV Import Hook
 *
 * Purpose: Handles the complete CSV import workflow including file selection,
 * column detection, mapping, duplicate handling, and competition creation.
 *
 * SRS Reference:
 * - FR-1.1: CSV File Upload Interface
 * - FR-1.2: CSV Parser Integration
 * - FR-1.4: Column Mapping Interface
 * - FR-1.5: Data Validation and Error Handling
 */

import { useState, useRef } from 'react';
import { ColumnMapping, Competition } from '@raffle-spinner/storage';
import { useCSVUpload } from './useCSVUpload';

interface UseCSVImportProps {
  addCompetition: (competition: Competition) => Promise<void>;
  columnMapping: ColumnMapping | null;
  updateColumnMapping: (mapping: ColumnMapping) => Promise<void>;
}

export function useCSVImport({
  addCompetition,
  columnMapping,
  updateColumnMapping,
}: UseCSVImportProps) {
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
          fullName: detected.fullName || '',
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

    resetFileInput();
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

  const resetFileInput = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openMapperModal = () => {
    setDetectedHeaders(['First Name', 'Last Name', 'Ticket Number']);
    if (columnMapping) {
      setDetectedMapping(columnMapping);
    }
    setShowMapperModal(true);
  };

  return {
    fileInputRef,
    selectedFile,
    showNameModal,
    showMapperModal,
    showDuplicateModal,
    detectedHeaders,
    detectedMapping,
    duplicates,
    importSummary,
    handleFileSelect,
    handleMappingConfirm,
    handleNameConfirm,
    handleDuplicateProceed,
    setShowNameModal,
    setShowMapperModal,
    setShowDuplicateModal,
    openMapperModal,
  };
}
