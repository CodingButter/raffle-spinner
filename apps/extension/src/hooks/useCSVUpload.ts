/**
 * useCSVUpload Hook
 *
 * Purpose: Custom React hook for handling CSV file uploads including column detection,
 * data parsing, validation, duplicate handling, and competition creation.
 *
 * SRS Reference:
 * - FR-1.1: CSV File Upload Interface
 * - FR-1.2: CSV Parser Integration
 * - FR-1.3: File Format Validation
 * - FR-1.4: Column Mapping Interface (detection)
 * - FR-1.5: Data Validation and Error Handling
 */

import { useState } from 'react';
import { CSVParser, IntelligentColumnMapper } from '@raffle-spinner/csv-parser';
import { Competition, ColumnMapping } from '@raffle-spinner/storage';

interface UseCSVUploadResult {
  upload: (file: File, competitionName: string, mapping: ColumnMapping) => Promise<UploadResult>;
  detectColumns: (file: File) => Promise<DetectedColumns>;
  uploading: boolean;
  error: string | null;
}

interface UploadResult {
  competition: Competition;
  duplicates: Array<{ ticketNumber: string; names: string[] }>;
  skippedRows: number;
  totalRows: number;
}

interface DetectedColumns {
  headers: string[];
  detected: {
    firstName: string | null;
    lastName: string | null;
    fullName: string | null;
    ticketNumber: string | null;
  };
}

export function useCSVUpload(): UseCSVUploadResult {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detectColumns = async (file: File): Promise<DetectedColumns> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        if (lines.length === 0) {
          reject(new Error('Empty file'));
          return;
        }

        const headers = lines[0].split(',').map((h) => h.trim());
        const mapper = new IntelligentColumnMapper();
        const detected = mapper.detectHeaders(headers);

        resolve({ headers, detected });
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const upload = async (
    file: File,
    competitionName: string,
    mapping: ColumnMapping
  ): Promise<UploadResult> => {
    setUploading(true);
    setError(null);

    try {
      const parser = new CSVParser();
      const result = await parser.parse(file, mapping);

      const competition: Competition = {
        id: `comp_${Date.now()}`,
        name: competitionName,
        participants: result.participants,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      return {
        competition,
        duplicates: result.duplicates,
        skippedRows: result.skippedRows,
        totalRows: result.totalRows,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setError(message);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return {
    upload,
    detectColumns,
    uploading,
    error,
  };
}
