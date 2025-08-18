/**
 * CSV Parser
 *
 * Purpose: Main CSV parsing engine that processes uploaded files, validates data,
 * handles duplicates, and converts CSV rows into participant objects.
 *
 * SRS Reference:
 * - FR-1.2: CSV Parser Integration (main parsing logic)
 * - FR-1.3: File Format Validation (CSV structure validation)
 * - FR-1.5: Data Validation and Error Handling (participant validation, duplicate handling)
 */

import Papa from 'papaparse';
import { Participant, ColumnMapping } from '@raffle-spinner/storage';
import { ParseResult } from './types';

export class CSVParser {
  parse(file: File, mapping: ColumnMapping): Promise<ParseResult> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const processed = this.processData(results.data as Record<string, string>[], mapping);
          resolve(processed);
        },
        error: (error) => {
          reject(new Error(`Failed to parse CSV: ${error.message}`));
        },
      });
    });
  }

  private processData(rows: Record<string, string>[], mapping: ColumnMapping): ParseResult {
    const participants: Participant[] = [];
    const ticketMap = new Map<string, string[]>();
    const ticketConversions: ParseResult['ticketConversions'] = [];
    let skippedRows = 0;

    for (const row of rows) {
      const participant = this.extractParticipant(row, mapping);

      if (!participant) {
        skippedRows++;
        continue;
      }

      // Check if ticket needs conversion
      const originalTicket = participant.ticketNumber;
      const isNumeric = /^\d+$/.test(originalTicket);

      if (!isNumeric) {
        // Extract numeric portion
        const numericTicket = originalTicket.replace(/\D/g, '');

        if (numericTicket.length === 0) {
          // No numeric portion, skip this entry
          ticketConversions.push({
            original: originalTicket,
            converted: null,
            firstName: participant.firstName,
            lastName: participant.lastName,
          });
          skippedRows++;
          continue;
        }

        // Record the conversion
        ticketConversions.push({
          original: originalTicket,
          converted: numericTicket,
          firstName: participant.firstName,
          lastName: participant.lastName,
        });

        // Use the converted ticket
        participant.ticketNumber = numericTicket;
      }

      // Track duplicates
      const fullName = `${participant.firstName} ${participant.lastName}`;
      if (ticketMap.has(participant.ticketNumber)) {
        ticketMap.get(participant.ticketNumber)!.push(fullName);
      } else {
        ticketMap.set(participant.ticketNumber, [fullName]);
        participants.push(participant);
      }
    }

    // Find duplicates
    const duplicates = Array.from(ticketMap.entries())
      .filter(([_, names]) => names.length > 1)
      .map(([ticketNumber, names]) => ({ ticketNumber, names }));

    return {
      participants,
      duplicates,
      skippedRows,
      totalRows: rows.length,
      ticketConversions: ticketConversions.length > 0 ? ticketConversions : undefined,
    };
  }

  private extractParticipant(
    row: Record<string, string>,
    mapping: ColumnMapping
  ): Participant | null {
    let firstName: string | undefined;
    let lastName: string | undefined;

    // Check if we're using a full name column or separate columns
    if (mapping.fullName) {
      const fullName = row[mapping.fullName]?.trim();
      if (!fullName) return null;

      // Split the full name intelligently
      const nameParts = this.splitFullName(fullName);
      firstName = nameParts.firstName;
      lastName = nameParts.lastName;
    } else {
      // Use separate first and last name columns
      firstName = row[mapping.firstName || '']?.trim();
      lastName = row[mapping.lastName || '']?.trim();
    }

    const ticketNumber = row[mapping.ticketNumber]?.trim();

    // Skip if any required field is missing
    if (!firstName || !lastName || !ticketNumber) {
      return null;
    }

    return {
      firstName,
      lastName,
      ticketNumber,
    };
  }

  private splitFullName(fullName: string): {
    firstName: string;
    lastName: string;
  } {
    const trimmed = fullName.trim();

    // Handle various name formats
    // Format: "Last, First" or "Last,First"
    if (trimmed.includes(',')) {
      const parts = trimmed.split(',').map((p) => p.trim());
      if (parts.length >= 2) {
        return {
          firstName: parts[1],
          lastName: parts[0],
        };
      }
    }

    // Format: "First Last" or "First Middle Last" etc.
    const parts = trimmed.split(/\s+/);

    if (parts.length === 1) {
      // Only one word, use it as both first and last name
      return {
        firstName: parts[0],
        lastName: parts[0],
      };
    } else if (parts.length === 2) {
      // Standard "First Last" format
      return {
        firstName: parts[0],
        lastName: parts[1],
      };
    } else {
      // Multiple words: treat first word as first name, rest as last name
      // This handles "First Middle Last" -> "First" "Middle Last"
      return {
        firstName: parts[0],
        lastName: parts.slice(1).join(' '),
      };
    }
  }
}
