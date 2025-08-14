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

export interface ColumnMapper {
  detectHeaders(headers: string[]): {
    firstName: string | null;
    lastName: string | null;
    fullName: string | null;
    ticketNumber: string | null;
  };
}

export interface ValidationError {
  row: number;
  reason: string;
}
