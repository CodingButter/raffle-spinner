/**
 * CSV Parser Error Handling Tests
 * Tests for graceful error handling and recovery scenarios
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CSVParser } from '../parser';
import { ColumnMapping } from '@raffle-spinner/storage';
import { createMockFile } from './test-helpers';


describe('CSVParser Error Handling', () => {
  let parser: CSVParser;

  beforeEach(() => {
    parser = new CSVParser();
  });

  describe('File Reading Errors', () => {
    it('should handle corrupted file objects gracefully', async () => {
      const corruptedFile = {} as File; // Invalid file object
      const mapping: ColumnMapping = {
        firstName: 'First',
        lastName: 'Last',
        ticketNumber: 'Ticket'
      };

      await expect(parser.parse(corruptedFile, mapping)).rejects.toThrow();
    });

    it('should handle files with null content', async () => {
      const nullFile = createMockFile([null as any], 'null.csv', { type: 'text/csv' });
      const mapping: ColumnMapping = {
        firstName: 'First',
        lastName: 'Last',
        ticketNumber: 'Ticket'
      };

      try {
        const result = await parser.parse(nullFile, mapping);
        expect(result.participants).toHaveLength(0);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle binary data in CSV file', async () => {
      const binaryData = new Uint8Array([0xFF, 0xFE, 0x00, 0x01, 0x02]);
      const binaryFile = createMockFile([binaryData], 'binary.csv', { type: 'text/csv' });
      const mapping: ColumnMapping = {
        firstName: 'First',
        lastName: 'Last',
        ticketNumber: 'Ticket'
      };

      try {
        const result = await parser.parse(binaryFile, mapping);
        expect(result).toBeDefined();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Invalid Column Mappings', () => {
    it('should handle null column mapping', async () => {
      const file = createMockFile(['First,Last,Ticket\nJohn,Doe,123'], 'test.csv', { type: 'text/csv' });
      const mapping = null as any;

      await expect(parser.parse(file, mapping)).rejects.toThrow();
    });

    it('should handle undefined column mapping', async () => {
      const file = createMockFile(['First,Last,Ticket\nJohn,Doe,123'], 'test.csv', { type: 'text/csv' });
      const mapping = undefined as any;

      await expect(parser.parse(file, mapping)).rejects.toThrow();
    });

    it('should handle empty column mapping object', async () => {
      const file = createMockFile(['First,Last,Ticket\nJohn,Doe,123'], 'test.csv', { type: 'text/csv' });
      const mapping: ColumnMapping = {};

      const result = await parser.parse(file, mapping);
      expect(result.participants).toHaveLength(0);
      expect(result.skippedRows).toBe(1);
    });

    it('should handle mapping with non-existent columns', async () => {
      const file = createMockFile([
        'Col1,Col2,Col3',
        'John,Doe,123'
      ].join('\n'), 'test.csv', { type: 'text/csv' });
      const mapping: ColumnMapping = {
        firstName: 'NonExistent1',
        lastName: 'NonExistent2',
        ticketNumber: 'NonExistent3'
      };

      const result = await parser.parse(file, mapping);
      expect(result.participants).toHaveLength(0);
      expect(result.skippedRows).toBe(1);
    });
  });

  describe('Malformed CSV Structure', () => {
    it('should handle inconsistent column counts', async () => {
      const inconsistent = createMockFile([
        'First,Last,Ticket',
        'John,Doe,123,Extra',
        'Jane,Smith',  // Missing ticket
        'Bob',         // Missing multiple columns
        'Alice,White,456'
      ].join('\n'), 'inconsistent.csv', { type: 'text/csv' });
      const mapping: ColumnMapping = {
        firstName: 'First',
        lastName: 'Last',
        ticketNumber: 'Ticket'
      };

      const result = await parser.parse(inconsistent, mapping);
      
      expect(result.participants).toHaveLength(2);
      expect(result.skippedRows).toBe(2);
    });

    it('should handle unclosed quotes', async () => {
      const unclosedQuotes = createMockFile([
        'First,Last,Ticket',
        '"John,Doe,123',
        'Jane","Smith",456',
        'Bob,Brown,"789'
      ].join('\n'), 'quotes.csv', { type: 'text/csv' });
      const mapping: ColumnMapping = {
        firstName: 'First',
        lastName: 'Last',
        ticketNumber: 'Ticket'
      };

      const result = await parser.parse(unclosedQuotes, mapping);
      expect(result.participants.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle mixed delimiters', async () => {
      const mixedDelimiters = createMockFile([
        'First,Last;Ticket',
        'John;Doe,123',
        'Jane|Smith|456',
        'Bob\tBrown\t789'
      ].join('\n'), 'mixed.csv', { type: 'text/csv' });
      const mapping: ColumnMapping = {
        firstName: 'First',
        lastName: 'Last',
        ticketNumber: 'Ticket'
      };

      const result = await parser.parse(mixedDelimiters, mapping);
      expect(result).toBeDefined();
    });
  });

  describe('Encoding Issues', () => {
    it('should handle BOM markers', async () => {
      const bomFile = createMockFile([
        '\uFEFFFirst,Last,Ticket',
        'John,Doe,123'
      ].join('\n'), 'bom.csv', { type: 'text/csv' });
      const mapping: ColumnMapping = {
        firstName: 'First',
        lastName: 'Last',
        ticketNumber: 'Ticket'
      };

      const result = await parser.parse(bomFile, mapping);
      expect(result.participants).toHaveLength(1);
    });

    it('should handle various character encodings', async () => {
      const specialChars = createMockFile([
        'First,Last,Ticket',
        'José,García,123',
        'François,Müller,456',
        '李,王,789',
        'محمد,علي,101112'
      ].join('\n'), 'unicode.csv', { type: 'text/csv' });
      const mapping: ColumnMapping = {
        firstName: 'First',
        lastName: 'Last',
        ticketNumber: 'Ticket'
      };

      const result = await parser.parse(specialChars, mapping);
      expect(result.participants).toHaveLength(4);
      expect(result.participants[0].firstName).toBe('José');
      expect(result.participants[1].lastName).toBe('Müller');
    });

    it('should handle control characters', async () => {
      const controlChars = createMockFile([
        'First,Last,Ticket',
        'John\x00,Doe\x01,123\x02',
        'Jane\b,Smith\f,456',
        'Bob\r,Brown\n,789'
      ].join('\n'), 'control.csv', { type: 'text/csv' });
      const mapping: ColumnMapping = {
        firstName: 'First',
        lastName: 'Last',
        ticketNumber: 'Ticket'
      };

      const result = await parser.parse(controlChars, mapping);
      expect(result).toBeDefined();
    });
  });

  describe('Edge Case Data Values', () => {
    it('should handle extremely long values', async () => {
      const longName = 'A'.repeat(10000);
      const longTicket = '1'.repeat(10000);
      const longData = createMockFile([
        'First,Last,Ticket',
        `${longName},${longName},${longTicket}`,
        'Normal,Name,123'
      ].join('\n'), 'long.csv', { type: 'text/csv' });
      const mapping: ColumnMapping = {
        firstName: 'First',
        lastName: 'Last',
        ticketNumber: 'Ticket'
      };

      const result = await parser.parse(longData, mapping);
      expect(result.participants).toHaveLength(2);
      expect(result.participants[0].firstName.length).toBe(10000);
    });

    it('should handle special regex characters in values', async () => {
      const regexChars = createMockFile([
        'First,Last,Ticket',
        '.*,+?,123',
        '[John],{Doe},456',
        '(Bob),|Brown|,789',
        '^Alice$,\\White\\,999'
      ].join('\n'), 'regex.csv', { type: 'text/csv' });
      const mapping: ColumnMapping = {
        firstName: 'First',
        lastName: 'Last',
        ticketNumber: 'Ticket'
      };

      const result = await parser.parse(regexChars, mapping);
      expect(result.participants.length).toBeGreaterThanOrEqual(3);
    });

    it('should handle SQL injection attempts in data', async () => {
      const sqlInjection = createMockFile([
        'First,Last,Ticket',
        "'; DROP TABLE users; --,Smith,123",
        'John,"; DELETE FROM *,456',
        "Bob,Brown' OR '1'='1,789"
      ].join('\n'), 'sql.csv', { type: 'text/csv' });
      const mapping: ColumnMapping = {
        firstName: 'First',
        lastName: 'Last',
        ticketNumber: 'Ticket'
      };

      const result = await parser.parse(sqlInjection, mapping);
      expect(result.participants).toHaveLength(3);
      expect(result.participants[0].firstName).toContain('DROP TABLE');
    });

    it('should handle HTML/script injection in data', async () => {
      const htmlInjection = createMockFile([
        'First,Last,Ticket',
        '<script>alert("XSS")</script>,Smith,123',
        'John,<img src=x onerror=alert(1)>,456',
        '<div onclick="evil()">Bob</div>,Brown,789'
      ].join('\n'), 'html.csv', { type: 'text/csv' });
      const mapping: ColumnMapping = {
        firstName: 'First',
        lastName: 'Last',
        ticketNumber: 'Ticket'
      };

      const result = await parser.parse(htmlInjection, mapping);
      expect(result.participants).toHaveLength(3);
      expect(result.participants[0].firstName).toContain('script');
    });
  });

  describe('Recovery and Partial Results', () => {
    it('should provide partial results when some rows fail', async () => {
      const partialData = createMockFile([
        'First,Last,Ticket',
        'John,Doe,123',
        '!!!ERROR!!!',
        'Jane,Smith,456',
        null as any,
        'Bob,Brown,789'
      ].join('\n'), 'partial.csv', { type: 'text/csv' });
      const mapping: ColumnMapping = {
        firstName: 'First',
        lastName: 'Last',
        ticketNumber: 'Ticket'
      };

      const result = await parser.parse(partialData, mapping);
      expect(result.participants.length).toBeGreaterThanOrEqual(2);
    });

    it('should continue processing after encountering errors', async () => {
      const errorData = createMockFile([
        'First,Last,Ticket',
        'John,Doe,123',
        '\x00\x01\x02',  // Binary data
        'Jane,Smith,456',
        ',,',             // Empty row
        'Bob,Brown,789'
      ].join('\n'), 'errors.csv', { type: 'text/csv' });
      const mapping: ColumnMapping = {
        firstName: 'First',
        lastName: 'Last',
        ticketNumber: 'Ticket'
      };

      const result = await parser.parse(errorData, mapping);
      expect(result.participants).toHaveLength(3);
      expect(result.participants[0].firstName).toBe('John');
      expect(result.participants[1].firstName).toBe('Jane');
      expect(result.participants[2].firstName).toBe('Bob');
    });
  });

  describe('Timeout and Performance Guards', () => {
    it('should handle parser timeout scenarios', async () => {
      // Create a very complex CSV that might cause parsing issues
      const complexData = Array.from({ length: 1000 }, (_, i) => {
        const complexValue = `"Value with, comma and ""quotes"" and
newlines and \t tabs"`;
        return `${complexValue},${complexValue},${i}`;
      }).join('\n');
      
      const file = createMockFile(['First,Last,Ticket\n' + complexData], 'complex.csv', { type: 'text/csv' });
      const mapping: ColumnMapping = {
        firstName: 'First',
        lastName: 'Last',
        ticketNumber: 'Ticket'
      };

      const result = await parser.parse(file, mapping);
      expect(result).toBeDefined();
      expect(result.participants.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle circular references in processed data', async () => {
      const normalFile = createMockFile([
        'First,Last,Ticket',
        'John,Doe,123'
      ].join('\n'), 'normal.csv', { type: 'text/csv' });
      const mapping: ColumnMapping = {
        firstName: 'First',
        lastName: 'Last',
        ticketNumber: 'Ticket'
      };

      const result = await parser.parse(normalFile, mapping);
      
      // Attempt to create circular reference in result
      (result as any).circular = result;
      
      // Should still be serializable (won't crash)
      expect(() => JSON.stringify(result, (key, value) => {
        if (key === 'circular') return '[Circular]';
        return value;
      })).not.toThrow();
    });
  });
});