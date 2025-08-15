/**
 * CSV Parser Types
 *
 * Purpose: Type definitions for CSV parsing operations including parse results,
 * column mapping interfaces, and validation error structures.
 *
 * SRS Reference:
 * - FR-1.2: CSV Parser Integration (ParseResult interface)
 * - FR-1.4: Column Mapping Interface (ColumnMapper interface)
 * - FR-1.5: Data Validation and Error Handling (ValidationError interface)
 */

import { Participant } from '@raffle-spinner/storage';

export interface ParseResult {
  participants: Participant[];
  duplicates: Array<{
    ticketNumber: string;
    names: string[];
  }>;
  skippedRows: number;
  totalRows: number;
  ticketConversions?: Array<{
    original: string;
    converted: string | null;
    firstName: string;
    lastName: string;
  }>;
}

export interface ColumnDetectionResult {
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  ticketNumber: string | null;
  confidence: {
    firstName: number;
    lastName: number;
    fullName: number;
    ticketNumber: number;
  };
  overallConfidence: number;
}

export interface ColumnMapper {
  detectHeaders(headers: string[]): ColumnDetectionResult;
}

export interface ValidationError {
  row: number;
  reason: string;
}
