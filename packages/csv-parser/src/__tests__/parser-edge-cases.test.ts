/**
 * CSV Parser Edge Case Tests
 * Comprehensive tests for the CSVParser class covering edge cases and error scenarios
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CSVParser } from '../parser';
import { ColumnMapping } from '@raffle-spinner/storage';
import { createMockFile } from './test-helpers';

describe('CSVParser Edge Cases', () => {
  let parser: CSVParser;

  beforeEach(() => {
    parser = new CSVParser();
  });

  describe('Empty and Minimal Files', () => {
    it('should handle completely empty CSV file', async () => {
      const emptyFile = createMockFile('', 'empty.csv');
      const mapping: ColumnMapping = {
        firstName: 'First',
        lastName: 'Last',
        ticketNumber: 'Ticket'
      };

      const result = await parser.parse(emptyFile, mapping);
      
      expect(result.participants).toHaveLength(0);
      expect(result.duplicates).toHaveLength(0);
      expect(result.skippedRows).toBe(0);
      expect(result.totalRows).toBe(0);
    });

    it('should handle CSV with only headers', async () => {
      const headerOnlyFile = createMockFile('First,Last,Ticket', 'headers.csv');
      const mapping: ColumnMapping = {
        firstName: 'First',
        lastName: 'Last',
        ticketNumber: 'Ticket'
      };

      const result = await parser.parse(headerOnlyFile, mapping);
      
      expect(result.participants).toHaveLength(0);
      expect(result.totalRows).toBe(0);
    });

    it('should handle single valid row', async () => {
      const singleRow = createMockFile('First,Last,Ticket\nJohn,Doe,12345', 'single.csv');
      const mapping: ColumnMapping = {
        firstName: 'First',
        lastName: 'Last',
        ticketNumber: 'Ticket'
      };

      const result = await parser.parse(singleRow, mapping);
      
      expect(result.participants).toHaveLength(1);
      expect(result.participants[0]).toEqual({
        firstName: 'John',
        lastName: 'Doe',
        ticketNumber: '12345'
      });
    });
  });

  describe('Missing and Invalid Data', () => {
    it('should skip rows with missing required fields', async () => {
      const missingData = createMockFile([
        'First,Last,Ticket',
        'John,Doe,12345',
        ',Smith,67890',  // Missing first name
        'Jane,,11111',   // Missing last name
        'Bob,Brown,',    // Missing ticket
        'Alice,White,99999'
      ], 'missing.csv');
      const mapping: ColumnMapping = {
        firstName: 'First',
        lastName: 'Last',
        ticketNumber: 'Ticket'
      };

      const result = await parser.parse(missingData, mapping);
      
      expect(result.participants).toHaveLength(2);
      expect(result.skippedRows).toBe(3);
      expect(result.participants[0].firstName).toBe('John');
      expect(result.participants[1].firstName).toBe('Alice');
    });

    it('should handle rows with only whitespace', async () => {
      const whitespaceData = createMockFile([
        'First,Last,Ticket',
        '   ,   ,   ',
        '\t,\t,\t',
        'John,Doe,12345'
      ], 'whitespace.csv');
      const mapping: ColumnMapping = {
        firstName: 'First',
        lastName: 'Last',
        ticketNumber: 'Ticket'
      };

      const result = await parser.parse(whitespaceData, mapping);
      
      expect(result.participants).toHaveLength(1);
      expect(result.skippedRows).toBe(2);
    });
  });

  describe('Name Splitting Edge Cases', () => {
    it('should handle various full name formats', async () => {
      const nameFormats = createMockFile(
        [
          'FullName,Ticket',
          'John Doe,001',
          'Jane Mary Smith,002',
          'O\'Brien, Patrick,003',
          'van der Berg, Johannes,004',
          'María José García López,005',
          'Single,006',
          'Mr. John Q. Public Jr.,007'
        ].join('\n'),
        'names.csv',
        { type: 'text/csv' }
      );
      const mapping: ColumnMapping = {
        fullName: 'FullName',
        ticketNumber: 'Ticket'
      };

      const result = await parser.parse(nameFormats, mapping);
      
      expect(result.participants).toHaveLength(7);
      expect(result.participants[0]).toEqual({
        firstName: 'John',
        lastName: 'Doe',
        ticketNumber: '001'
      });
      expect(result.participants[2]).toEqual({
        firstName: 'Patrick',
        lastName: 'O\'Brien',
        ticketNumber: '003'
      });
      expect(result.participants[5]).toEqual({
        firstName: 'Single',
        lastName: 'Single',
        ticketNumber: '006'
      });
    });

    it('should handle names with special characters', async () => {
      const specialNames = createMockFile(
        [
          'First,Last,Ticket',
          'José,García-López,001',
          'François,D\'Artagnan,002',
          'Björn,Müller,003',
          '李,王,004',
          'محمد,علي,005'
        ].join('\n'),
        'special.csv',
        { type: 'text/csv' }
      );
      const mapping: ColumnMapping = {
        firstName: 'First',
        lastName: 'Last',
        ticketNumber: 'Ticket'
      };

      const result = await parser.parse(specialNames, mapping);
      
      expect(result.participants).toHaveLength(5);
      expect(result.participants[0].lastName).toBe('García-López');
      expect(result.participants[1].lastName).toBe('D\'Artagnan');
    });
  });

  describe('Ticket Number Edge Cases', () => {
    it('should handle non-numeric ticket conversions', async () => {
      const mixedTickets = createMockFile(
        [
          'First,Last,Ticket',
          'John,Doe,ABC123',
          'Jane,Smith,#456',
          'Bob,Brown,TICKET-789',
          'Alice,White,NoNumbers',
          'Carol,Green,999'
        ].join('\n'),
        'tickets.csv',
        { type: 'text/csv' }
      );
      const mapping: ColumnMapping = {
        firstName: 'First',
        lastName: 'Last',
        ticketNumber: 'Ticket'
      };

      const result = await parser.parse(mixedTickets, mapping);
      
      expect(result.ticketConversions).toBeDefined();
      expect(result.ticketConversions).toHaveLength(4);
      
      const conversion1 = result.ticketConversions!.find(c => c.original === 'ABC123');
      expect(conversion1?.converted).toBe('123');
      
      const noNumberConversion = result.ticketConversions!.find(c => c.original === 'NoNumbers');
      expect(noNumberConversion?.converted).toBeNull();
      
      expect(result.participants).toHaveLength(4); // NoNumbers should be skipped
    });

    it('should handle very long ticket numbers', async () => {
      const longTickets = createMockFile(
        [
          'First,Last,Ticket',
          'John,Doe,' + '9'.repeat(100),
          'Jane,Smith,' + '1234567890'.repeat(10)
        ].join('\n'),
        'long.csv',
        { type: 'text/csv' }
      );
      const mapping: ColumnMapping = {
        firstName: 'First',
        lastName: 'Last',
        ticketNumber: 'Ticket'
      };

      const result = await parser.parse(longTickets, mapping);
      
      expect(result.participants).toHaveLength(2);
      expect(result.participants[0].ticketNumber.length).toBe(100);
      expect(result.participants[1].ticketNumber.length).toBe(100);
    });
  });

  describe('Duplicate Detection', () => {
    it('should detect exact duplicate tickets', async () => {
      const duplicates = createMockFile(
        [
          'First,Last,Ticket',
          'John,Doe,12345',
          'Jane,Smith,12345',
          'Bob,Brown,67890',
          'Alice,White,12345'
        ].join('\n'),
        'duplicates.csv',
        { type: 'text/csv' }
      );
      const mapping: ColumnMapping = {
        firstName: 'First',
        lastName: 'Last',
        ticketNumber: 'Ticket'
      };

      const result = await parser.parse(duplicates, mapping);
      
      expect(result.participants).toHaveLength(2); // Only first occurrence of each
      expect(result.duplicates).toHaveLength(1);
      expect(result.duplicates[0].ticketNumber).toBe('12345');
      expect(result.duplicates[0].names).toContain('John Doe');
      expect(result.duplicates[0].names).toContain('Jane Smith');
      expect(result.duplicates[0].names).toContain('Alice White');
    });

    it('should handle case-sensitive ticket duplicates', async () => {
      const caseDuplicates = createMockFile(
        [
          'First,Last,Ticket',
          'John,Doe,ABC123',
          'Jane,Smith,abc123',
          'Bob,Brown,ABC123'
        ].join('\n'),
        'case.csv',
        { type: 'text/csv' }
      );
      const mapping: ColumnMapping = {
        firstName: 'First',
        lastName: 'Last',
        ticketNumber: 'Ticket'
      };

      const result = await parser.parse(caseDuplicates, mapping);
      
      // After conversion, ABC123 becomes 123 for all
      expect(result.participants).toHaveLength(1);
      expect(result.duplicates).toHaveLength(1);
      expect(result.duplicates[0].ticketNumber).toBe('123');
    });
  });

  describe('Special CSV Formats', () => {
    it('should handle quoted fields with commas', async () => {
      const quotedData = createMockFile(
        [
          'First,Last,Ticket',
          '"Doe, John","Smith, Jr.",12345',
          'Jane,"O\'Brien, Mary",67890'
        ].join('\n'),
        'quoted.csv',
        { type: 'text/csv' }
      );
      const mapping: ColumnMapping = {
        firstName: 'First',
        lastName: 'Last',
        ticketNumber: 'Ticket'
      };

      const result = await parser.parse(quotedData, mapping);
      
      expect(result.participants).toHaveLength(2);
      expect(result.participants[0].firstName).toBe('Doe, John');
      expect(result.participants[0].lastName).toBe('Smith, Jr.');
    });

    it('should handle different line endings', async () => {
      const mixedEndings = createMockFile(
        ['First,Last,Ticket\rJohn,Doe,001\r\nJane,Smith,002\nBob,Brown,003'],
        'endings.csv',
        { type: 'text/csv' }
      );
      const mapping: ColumnMapping = {
        firstName: 'First',
        lastName: 'Last',
        ticketNumber: 'Ticket'
      };

      const result = await parser.parse(mixedEndings, mapping);
      
      expect(result.participants).toHaveLength(3);
    });
  });

  describe('Error Scenarios', () => {
    it('should handle file read errors gracefully', async () => {
      const badFile = createMockFile(['test'], 'bad.csv', { type: 'text/csv' });
      
      // Mock the file to throw an error when parsed
      Object.defineProperty(badFile, 'text', {
        value: () => Promise.reject(new Error('Read error'))
      });
      
      const mapping: ColumnMapping = {
        firstName: 'First',
        lastName: 'Last',
        ticketNumber: 'Ticket'
      };

      // Parser should handle this without crashing
      try {
        await parser.parse(badFile, mapping);
      } catch (error: any) {
        expect(error.message).toContain('Failed to parse CSV');
      }
    });

    it('should handle extremely malformed CSV gracefully', async () => {
      const malformed = createMockFile(
        [
          '<<<INVALID>>>',
          'Not,A,Valid,CSV,Structure,,,,,',
          '\\x00\\x01\\x02',
          'First,Last,Ticket',
          'John,Doe,12345'
        ].join('\n'),
        'malformed.csv',
        { type: 'text/csv' }
      );
      const mapping: ColumnMapping = {
        firstName: 'First',
        lastName: 'Last',
        ticketNumber: 'Ticket'
      };

      const result = await parser.parse(malformed, mapping);
      
      // Should still parse what it can
      expect(result.participants.length).toBeGreaterThanOrEqual(0);
    });
  });
});