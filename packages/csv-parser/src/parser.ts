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

import Papa from "papaparse";
import { Participant, ColumnMapping } from "@raffle-spinner/storage";
import { ParseResult } from "./types";

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

  private processData(
    rows: Record<string, string>[],
    mapping: ColumnMapping,
  ): ParseResult {
    const participants: Participant[] = [];
    const ticketMap = new Map<string, string[]>();
    let skippedRows = 0;

    for (const row of rows) {
      const participant = this.extractParticipant(row, mapping);

      if (!participant) {
        skippedRows++;
        continue;
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
    };
  }

  private extractParticipant(
    row: Record<string, string>,
    mapping: ColumnMapping,
  ): Participant | null {
    const firstName = row[mapping.firstName]?.trim();
    const lastName = row[mapping.lastName]?.trim();
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
}
