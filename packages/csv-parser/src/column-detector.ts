/**
 * Intelligent Column Mapper
 *
 * Purpose: Automatic detection of CSV column headers using pattern matching
 * to identify first name, last name, and ticket number columns intelligently.
 *
 * SRS Reference:
 * - FR-1.4: Column Mapping Interface (intelligent column detection)
 * - FR-1.2: CSV Parser Integration (header analysis)
 */

import { ColumnMapper } from './types';

const FIRST_NAME_PATTERNS = [
  'first name',
  'firstname',
  'fname',
  'first_name',
  'given name',
  'givenname',
  'given_name',
  'first',
];

const LAST_NAME_PATTERNS = [
  'last name',
  'lastname',
  'lname',
  'last_name',
  'surname',
  'family name',
  'familyname',
  'family_name',
  'last',
];

const FULL_NAME_PATTERNS = [
  'name',
  'full name',
  'fullname',
  'full_name',
  'participant name',
  'participantname',
  'participant_name',
  'customer name',
  'customername',
  'customer_name',
  'entrant name',
  'entrantname',
  'entrant_name',
];

const TICKET_PATTERNS = [
  'ticket',
  'ticket number',
  'ticketnumber',
  'ticket_number',
  'number',
  'raffle',
  'raffle number',
  'id',
  'entry',
];

export class IntelligentColumnMapper implements ColumnMapper {
  detectHeaders(headers: string[]) {
    const normalized = headers.map((h) => h.toLowerCase().trim());

    // First try to find a full name column
    const fullName = this.findMatch(normalized, FULL_NAME_PATTERNS, headers);

    // If we found a full name column, use it. Otherwise, look for separate first/last columns
    if (fullName) {
      return {
        firstName: null,
        lastName: null,
        fullName: fullName,
        ticketNumber: this.findMatch(normalized, TICKET_PATTERNS, headers),
      };
    }

    return {
      firstName: this.findMatch(normalized, FIRST_NAME_PATTERNS, headers),
      lastName: this.findMatch(normalized, LAST_NAME_PATTERNS, headers),
      fullName: null,
      ticketNumber: this.findMatch(normalized, TICKET_PATTERNS, headers),
    };
  }

  private findMatch(normalized: string[], patterns: string[], original: string[]): string | null {
    for (let i = 0; i < normalized.length; i++) {
      const header = normalized[i];
      for (const pattern of patterns) {
        if (header === pattern || header.includes(pattern.replace(' ', ''))) {
          return original[i];
        }
      }
    }
    return null;
  }
}
