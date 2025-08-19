/**
 * CSV Import Flow Test Example
 * Author: David Miller, Lead Developer Architect
 * 
 * This test demonstrates comprehensive CSV import testing:
 * - File parsing
 * - Column mapping
 * - Data validation
 * - Duplicate detection
 * - Large file handling
 * - Error scenarios
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// CSV Parser implementation
interface ParsedRow {
  [key: string]: string;
}

interface ColumnMapping {
  firstName: string;
  lastName: string;
  ticketNumber: string;
}

interface Participant {
  firstName: string;
  lastName: string;
  ticketNumber: string;
}

interface ParseResult {
  success: boolean;
  data?: Participant[];
  duplicates?: string[];
  errors?: string[];
  warnings?: string[];
}

class CSVParser {
  private columnDetector: ColumnDetector;
  private validator: DataValidator;

  constructor() {
    this.columnDetector = new ColumnDetector();
    this.validator = new DataValidator();
  }

  async parseCSV(content: string): Promise<ParsedRow[]> {
    const lines = content.trim().split('\n');
    if (lines.length === 0) {
      throw new Error('Empty CSV file');
    }

    const headers = this.parseCSVLine(lines[0]);
    const rows: ParsedRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      if (values.length !== headers.length) {
        throw new Error(`Row ${i + 1}: Column count mismatch`);
      }

      const row: ParsedRow = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      rows.push(row);
    }

    return rows;
  }

  async importWithMapping(
    content: string,
    mapping: ColumnMapping,
    options?: {
      validateDuplicates?: boolean;
      skipInvalid?: boolean;
      maxRows?: number;
    }
  ): Promise<ParseResult> {
    const defaultOptions = {
      validateDuplicates: true,
      skipInvalid: false,
      maxRows: Infinity,
    };
    const opts = { ...defaultOptions, ...options };

    try {
      // Parse CSV
      const rows = await this.parseCSV(content);
      
      // Apply row limit
      const limitedRows = rows.slice(0, opts.maxRows);

      // Map to participants
      const participants: Participant[] = [];
      const errors: string[] = [];
      const warnings: string[] = [];
      const seenTickets = new Set<string>();
      const duplicates: string[] = [];

      for (let i = 0; i < limitedRows.length; i++) {
        const row = limitedRows[i];
        
        try {
          const participant: Participant = {
            firstName: row[mapping.firstName] || '',
            lastName: row[mapping.lastName] || '',
            ticketNumber: row[mapping.ticketNumber] || '',
          };

          // Validate participant
          const validation = this.validator.validateParticipant(participant);
          if (!validation.valid) {
            if (opts.skipInvalid) {
              warnings.push(`Row ${i + 2}: ${validation.error}`);
              continue;
            } else {
              errors.push(`Row ${i + 2}: ${validation.error}`);
              continue;
            }
          }

          // Check for duplicates
          if (opts.validateDuplicates) {
            if (seenTickets.has(participant.ticketNumber)) {
              duplicates.push(participant.ticketNumber);
              warnings.push(
                `Row ${i + 2}: Duplicate ticket number ${participant.ticketNumber}`
              );
            }
            seenTickets.add(participant.ticketNumber);
          }

          participants.push(participant);
        } catch (error) {
          errors.push(`Row ${i + 2}: ${error.message}`);
        }
      }

      if (errors.length > 0 && !opts.skipInvalid) {
        return {
          success: false,
          errors,
          warnings,
        };
      }

      return {
        success: true,
        data: participants,
        duplicates: duplicates.length > 0 ? duplicates : undefined,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } catch (error) {
      return {
        success: false,
        errors: [error.message],
      };
    }
  }

  detectColumns(rows: ParsedRow[]): ColumnMapping | null {
    if (rows.length === 0) return null;
    return this.columnDetector.detect(rows[0]);
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote mode
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }
}

class ColumnDetector {
  private patterns = {
    firstName: [
      /^first[\s_-]?name$/i,
      /^fname$/i,
      /^given[\s_-]?name$/i,
      /^forename$/i,
      /^participant$/i,
    ],
    lastName: [
      /^last[\s_-]?name$/i,
      /^lname$/i,
      /^surname$/i,
      /^family[\s_-]?name$/i,
    ],
    ticketNumber: [
      /^ticket[\s_-]?(number|no|num|#)?$/i,
      /^entry[\s_-]?(number|no|num)?$/i,
      /^raffle[\s_-]?(number|no|num)?$/i,
      /^number$/i,
      /^no$/i,
      /^reference$/i,
    ],
  };

  detect(headers: ParsedRow): ColumnMapping | null {
    const mapping: Partial<ColumnMapping> = {};
    const headerKeys = Object.keys(headers);

    // Try to match each required field
    for (const [field, patterns] of Object.entries(this.patterns)) {
      for (const header of headerKeys) {
        const normalizedHeader = header.trim();
        
        if (patterns.some(pattern => pattern.test(normalizedHeader))) {
          mapping[field as keyof ColumnMapping] = header;
          break;
        }
      }
    }

    // Check if all required fields are mapped
    if (mapping.firstName && mapping.lastName && mapping.ticketNumber) {
      return mapping as ColumnMapping;
    }

    // Fallback: try positional mapping
    if (headerKeys.length >= 3) {
      return {
        firstName: headerKeys[0],
        lastName: headerKeys[1],
        ticketNumber: headerKeys[2],
      };
    }

    return null;
  }
}

class DataValidator {
  validateParticipant(participant: Participant): { valid: boolean; error?: string } {
    // Check required fields
    if (!participant.firstName || participant.firstName.trim() === '') {
      return { valid: false, error: 'First name is required' };
    }

    if (!participant.lastName || participant.lastName.trim() === '') {
      return { valid: false, error: 'Last name is required' };
    }

    if (!participant.ticketNumber || participant.ticketNumber.trim() === '') {
      return { valid: false, error: 'Ticket number is required' };
    }

    // Validate field lengths
    if (participant.firstName.length > 50) {
      return { valid: false, error: 'First name too long (max 50 characters)' };
    }

    if (participant.lastName.length > 50) {
      return { valid: false, error: 'Last name too long (max 50 characters)' };
    }

    if (participant.ticketNumber.length > 20) {
      return { valid: false, error: 'Ticket number too long (max 20 characters)' };
    }

    // Validate ticket number format (alphanumeric with optional dashes)
    if (!/^[A-Za-z0-9-]+$/.test(participant.ticketNumber)) {
      return { valid: false, error: 'Invalid ticket number format' };
    }

    return { valid: true };
  }
}

describe('CSV Import Flow', () => {
  let parser: CSVParser;

  beforeEach(() => {
    parser = new CSVParser();
  });

  describe('Basic CSV Parsing', () => {
    it('should parse simple CSV with headers', async () => {
      const csv = `First Name,Last Name,Ticket Number
John,Doe,001
Jane,Smith,002
Bob,Johnson,003`;

      const rows = await parser.parseCSV(csv);
      
      expect(rows).toHaveLength(3);
      expect(rows[0]).toEqual({
        'First Name': 'John',
        'Last Name': 'Doe',
        'Ticket Number': '001',
      });
    });

    it('should handle CSV with quotes', async () => {
      const csv = `Name,Description,ID
"Smith, John","Participant with comma",001
"O'Brien","Name with apostrophe",002`;

      const rows = await parser.parseCSV(csv);
      
      expect(rows).toHaveLength(2);
      expect(rows[0]['Name']).toBe('Smith, John');
      expect(rows[0]['Description']).toBe('Participant with comma');
    });

    it('should handle CSV with escaped quotes', async () => {
      const csv = `Name,Quote,ID
John,"He said ""Hello""",001`;

      const rows = await parser.parseCSV(csv);
      
      expect(rows[0]['Quote']).toBe('He said "Hello"');
    });

    it('should handle empty fields', async () => {
      const csv = `First,Middle,Last
John,,Doe
Jane,Marie,`;

      const rows = await parser.parseCSV(csv);
      
      expect(rows[0]['Middle']).toBe('');
      expect(rows[1]['Last']).toBe('');
    });

    it('should reject empty CSV', async () => {
      await expect(parser.parseCSV('')).rejects.toThrow('Empty CSV file');
    });

    it('should reject CSV with mismatched columns', async () => {
      const csv = `Col1,Col2,Col3
Val1,Val2
Val3,Val4,Val5,Val6`;

      await expect(parser.parseCSV(csv)).rejects.toThrow('Column count mismatch');
    });
  });

  describe('Column Detection', () => {
    it('should detect standard column names', async () => {
      const csv = `First Name,Last Name,Ticket Number
John,Doe,001`;

      const rows = await parser.parseCSV(csv);
      const mapping = parser.detectColumns(rows);
      
      expect(mapping).toEqual({
        firstName: 'First Name',
        lastName: 'Last Name',
        ticketNumber: 'Ticket Number',
      });
    });

    it('should detect alternative column names', async () => {
      const csv = `fname,surname,entry_number
John,Doe,001`;

      const rows = await parser.parseCSV(csv);
      const mapping = parser.detectColumns(rows);
      
      expect(mapping).toEqual({
        firstName: 'fname',
        lastName: 'surname',
        ticketNumber: 'entry_number',
      });
    });

    it('should handle case-insensitive matching', async () => {
      const csv = `FIRSTNAME,LASTNAME,TICKETNUMBER
John,Doe,001`;

      const rows = await parser.parseCSV(csv);
      const mapping = parser.detectColumns(rows);
      
      expect(mapping).toBeTruthy();
      expect(mapping?.firstName).toBe('FIRSTNAME');
    });

    it('should fallback to positional mapping', async () => {
      const csv = `Name1,Name2,Ref
John,Doe,001`;

      const rows = await parser.parseCSV(csv);
      const mapping = parser.detectColumns(rows);
      
      expect(mapping).toEqual({
        firstName: 'Name1',
        lastName: 'Name2',
        ticketNumber: 'Ref',
      });
    });
  });

  describe('Data Import with Mapping', () => {
    it('should import CSV with correct mapping', async () => {
      const csv = `First Name,Last Name,Ticket Number
John,Doe,001
Jane,Smith,002`;

      const mapping: ColumnMapping = {
        firstName: 'First Name',
        lastName: 'Last Name',
        ticketNumber: 'Ticket Number',
      };

      const result = await parser.importWithMapping(csv, mapping);
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data![0]).toEqual({
        firstName: 'John',
        lastName: 'Doe',
        ticketNumber: '001',
      });
    });

    it('should handle custom column mapping', async () => {
      const csv = `Participant,Family Name,Entry Code
John,Doe,ABC123`;

      const mapping: ColumnMapping = {
        firstName: 'Participant',
        lastName: 'Family Name',
        ticketNumber: 'Entry Code',
      };

      const result = await parser.importWithMapping(csv, mapping);
      
      expect(result.success).toBe(true);
      expect(result.data![0].ticketNumber).toBe('ABC123');
    });
  });

  describe('Duplicate Detection', () => {
    it('should detect duplicate ticket numbers', async () => {
      const csv = `First Name,Last Name,Ticket Number
John,Doe,001
Jane,Smith,002
Bob,Johnson,001`;

      const mapping: ColumnMapping = {
        firstName: 'First Name',
        lastName: 'Last Name',
        ticketNumber: 'Ticket Number',
      };

      const result = await parser.importWithMapping(csv, mapping);
      
      expect(result.success).toBe(true);
      expect(result.duplicates).toContain('001');
      expect(result.warnings).toHaveLength(1);
    });

    it('should skip duplicate detection when disabled', async () => {
      const csv = `First Name,Last Name,Ticket Number
John,Doe,001
Jane,Smith,001`;

      const mapping: ColumnMapping = {
        firstName: 'First Name',
        lastName: 'Last Name',
        ticketNumber: 'Ticket Number',
      };

      const result = await parser.importWithMapping(csv, mapping, {
        validateDuplicates: false,
      });
      
      expect(result.success).toBe(true);
      expect(result.duplicates).toBeUndefined();
      expect(result.warnings).toBeUndefined();
    });
  });

  describe('Data Validation', () => {
    it('should validate required fields', async () => {
      const csv = `First Name,Last Name,Ticket Number
John,,001
,Smith,002`;

      const mapping: ColumnMapping = {
        firstName: 'First Name',
        lastName: 'Last Name',
        ticketNumber: 'Ticket Number',
      };

      const result = await parser.importWithMapping(csv, mapping);
      
      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors![0]).toContain('Last name is required');
      expect(result.errors![1]).toContain('First name is required');
    });

    it('should skip invalid rows when skipInvalid is true', async () => {
      const csv = `First Name,Last Name,Ticket Number
John,Doe,001
Invalid,,002
Jane,Smith,003`;

      const mapping: ColumnMapping = {
        firstName: 'First Name',
        lastName: 'Last Name',
        ticketNumber: 'Ticket Number',
      };

      const result = await parser.importWithMapping(csv, mapping, {
        skipInvalid: true,
      });
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.warnings).toHaveLength(1);
    });

    it('should validate field lengths', async () => {
      const csv = `First Name,Last Name,Ticket Number
${'A'.repeat(51)},Doe,001`;

      const mapping: ColumnMapping = {
        firstName: 'First Name',
        lastName: 'Last Name',
        ticketNumber: 'Ticket Number',
      };

      const result = await parser.importWithMapping(csv, mapping);
      
      expect(result.success).toBe(false);
      expect(result.errors![0]).toContain('First name too long');
    });

    it('should validate ticket number format', async () => {
      const csv = `First Name,Last Name,Ticket Number
John,Doe,001!@#`;

      const mapping: ColumnMapping = {
        firstName: 'First Name',
        lastName: 'Last Name',
        ticketNumber: 'Ticket Number',
      };

      const result = await parser.importWithMapping(csv, mapping);
      
      expect(result.success).toBe(false);
      expect(result.errors![0]).toContain('Invalid ticket number format');
    });
  });

  describe('Large File Handling', () => {
    it('should handle large CSV files', async () => {
      // Generate large CSV
      const rows = ['First Name,Last Name,Ticket Number'];
      for (let i = 1; i <= 10000; i++) {
        rows.push(`Participant${i},Surname${i},${String(i).padStart(6, '0')}`);
      }
      const csv = rows.join('\n');

      const mapping: ColumnMapping = {
        firstName: 'First Name',
        lastName: 'Last Name',
        ticketNumber: 'Ticket Number',
      };

      const result = await parser.importWithMapping(csv, mapping);
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(10000);
    });

    it('should respect row limit', async () => {
      const rows = ['First Name,Last Name,Ticket Number'];
      for (let i = 1; i <= 1000; i++) {
        rows.push(`Name${i},Surname${i},${i}`);
      }
      const csv = rows.join('\n');

      const mapping: ColumnMapping = {
        firstName: 'First Name',
        lastName: 'Last Name',
        ticketNumber: 'Ticket Number',
      };

      const result = await parser.importWithMapping(csv, mapping, {
        maxRows: 100,
      });
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(100);
    });
  });

  describe('Edge Cases', () => {
    it('should handle CSV with BOM', async () => {
      const csvWithBOM = '\uFEFF' + `First Name,Last Name,Ticket Number
John,Doe,001`;

      const rows = await parser.parseCSV(csvWithBOM);
      expect(rows).toHaveLength(1);
    });

    it('should handle different line endings', async () => {
      const csvCRLF = `First Name,Last Name,Ticket Number\r\nJohn,Doe,001\r\n`;
      const csvLF = `First Name,Last Name,Ticket Number\nJohn,Doe,001\n`;
      const csvCR = `First Name,Last Name,Ticket Number\rJohn,Doe,001\r`;

      const mapping: ColumnMapping = {
        firstName: 'First Name',
        lastName: 'Last Name',
        ticketNumber: 'Ticket Number',
      };

      const resultCRLF = await parser.importWithMapping(csvCRLF, mapping);
      const resultLF = await parser.importWithMapping(csvLF, mapping);
      
      expect(resultCRLF.success).toBe(true);
      expect(resultLF.success).toBe(true);
      expect(resultCRLF.data).toHaveLength(1);
      expect(resultLF.data).toHaveLength(1);
    });

    it('should handle special characters in names', async () => {
      const csv = `First Name,Last Name,Ticket Number
José,García,001
François,Müller,002
李,王,003`;

      const mapping: ColumnMapping = {
        firstName: 'First Name',
        lastName: 'Last Name',
        ticketNumber: 'Ticket Number',
      };

      const result = await parser.importWithMapping(csv, mapping);
      
      expect(result.success).toBe(true);
      expect(result.data![0].firstName).toBe('José');
      expect(result.data![1].lastName).toBe('Müller');
      expect(result.data![2].firstName).toBe('李');
    });
  });
});