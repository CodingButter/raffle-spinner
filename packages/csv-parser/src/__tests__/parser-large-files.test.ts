/**
 * CSV Parser Large File Tests
 * Performance and memory tests for processing large CSV files
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CSVParser } from '../parser';
import { ColumnMapping } from '@raffle-spinner/storage';
import { createMockFile } from './test-helpers';


describe('CSVParser Large File Handling', () => {
  let parser: CSVParser;

  beforeEach(() => {
    parser = new CSVParser();
  });

  function generateCSVContent(rows: number): string {
    const headers = 'FirstName,LastName,TicketNumber,Email,Phone,Address,City,PostCode';
    const lines = [headers];
    
    for (let i = 1; i <= rows; i++) {
      const firstName = `First${i}`;
      const lastName = `Last${i}`;
      const ticket = String(i).padStart(6, '0');
      const email = `user${i}@example.com`;
      const phone = `+44${String(i).padStart(10, '0')}`;
      const address = `${i} Main Street`;
      const city = i % 2 === 0 ? 'London' : 'Manchester';
      const postCode = `SW${(i % 20) + 1} ${i % 9}AB`;
      
      lines.push([firstName, lastName, ticket, email, phone, address, city, postCode].join(','));
    }
    
    return lines.join('\n');
  }

  describe('Performance Requirements', () => {
    it('should process 1,000 rows in under 100ms', async () => {
      const content = generateCSVContent(1000);
      const file = createMockFile([content], 'large.csv', { type: 'text/csv' });
      const mapping: ColumnMapping = {
        firstName: 'FirstName',
        lastName: 'LastName',
        ticketNumber: 'TicketNumber'
      };

      const startTime = performance.now();
      const result = await parser.parse(file, mapping);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100);
      expect(result.participants).toHaveLength(1000);
      expect(result.totalRows).toBe(1000);
      expect(result.skippedRows).toBe(0);
    });

    it('should process 5,000 rows in under 500ms', async () => {
      const content = generateCSVContent(5000);
      const file = createMockFile([content], 'large.csv', { type: 'text/csv' });
      const mapping: ColumnMapping = {
        firstName: 'FirstName',
        lastName: 'LastName',
        ticketNumber: 'TicketNumber'
      };

      const startTime = performance.now();
      const result = await parser.parse(file, mapping);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(500);
      expect(result.participants).toHaveLength(5000);
    });

    it('should process 10,000 rows in under 1 second', async () => {
      const content = generateCSVContent(10000);
      const file = createMockFile([content], 'large.csv', { type: 'text/csv' });
      const mapping: ColumnMapping = {
        firstName: 'FirstName',
        lastName: 'LastName',
        ticketNumber: 'TicketNumber'
      };

      const startTime = performance.now();
      const result = await parser.parse(file, mapping);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(1000);
      expect(result.participants).toHaveLength(10000);
    });
  });

  describe('Large File with Duplicates', () => {
    it('should efficiently detect duplicates in 5,000 rows', async () => {
      const lines = ['FirstName,LastName,TicketNumber'];
      
      // Create 5000 rows with 100 intentional duplicates
      for (let i = 1; i <= 5000; i++) {
        const ticket = i <= 4900 ? String(i).padStart(6, '0') : String(i - 4900).padStart(6, '0');
        lines.push(`First${i},Last${i},${ticket}`);
      }
      
      const content = lines.join('\n');
      const file = createMockFile([content], 'duplicates.csv', { type: 'text/csv' });
      const mapping: ColumnMapping = {
        firstName: 'FirstName',
        lastName: 'LastName',
        ticketNumber: 'TicketNumber'
      };

      const startTime = performance.now();
      const result = await parser.parse(file, mapping);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(500);
      expect(result.participants).toHaveLength(4900);
      expect(result.duplicates).toHaveLength(100);
    });
  });

  describe('Memory Efficiency', () => {
    it('should handle 25,000 rows without memory issues', async () => {
      const content = generateCSVContent(25000);
      const file = createMockFile([content], 'huge.csv', { type: 'text/csv' });
      const mapping: ColumnMapping = {
        firstName: 'FirstName',
        lastName: 'LastName',
        ticketNumber: 'TicketNumber'
      };

      const result = await parser.parse(file, mapping);
      
      expect(result.participants).toHaveLength(25000);
      expect(result.totalRows).toBe(25000);
      
      // Verify data integrity
      expect(result.participants[0].firstName).toBe('First1');
      expect(result.participants[24999].firstName).toBe('First25000');
    });

    it('should process file with many columns efficiently', async () => {
      const headers = Array.from({ length: 50 }, (_, i) => `Column${i}`).join(',');
      const lines = [headers];
      
      // 1000 rows with 50 columns each
      for (let i = 1; i <= 1000; i++) {
        const row = Array.from({ length: 50 }, (_, j) => `Value${i}_${j}`).join(',');
        lines.push(row);
      }
      
      const content = lines.join('\n');
      const file = createMockFile([content], 'wide.csv', { type: 'text/csv' });
      const mapping: ColumnMapping = {
        firstName: 'Column0',
        lastName: 'Column1',
        ticketNumber: 'Column2'
      };

      const startTime = performance.now();
      const result = await parser.parse(file, mapping);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(200);
      expect(result.participants).toHaveLength(1000);
    });
  });

  describe('Mixed Data Quality in Large Files', () => {
    it('should handle 10,000 rows with 20% invalid data', async () => {
      const lines = ['FirstName,LastName,TicketNumber'];
      
      for (let i = 1; i <= 10000; i++) {
        if (i % 5 === 0) {
          // 20% invalid rows (missing data)
          const invalidTypes = [
            ',Last,123',           // Missing first name
            'First,,456',          // Missing last name
            'First,Last,',         // Missing ticket
            ',,',                  // All missing
            '   ,   ,   '          // Whitespace only
          ];
          lines.push(invalidTypes[i % 5]);
        } else {
          lines.push(`First${i},Last${i},${String(i).padStart(6, '0')}`);
        }
      }
      
      const content = lines.join('\n');
      const file = createMockFile([content], 'mixed.csv', { type: 'text/csv' });
      const mapping: ColumnMapping = {
        firstName: 'FirstName',
        lastName: 'LastName',
        ticketNumber: 'TicketNumber'
      };

      const result = await parser.parse(file, mapping);
      
      expect(result.participants).toHaveLength(8000);
      expect(result.skippedRows).toBe(2000);
      expect(result.totalRows).toBe(10000);
    });
  });

  describe('Large Files with Ticket Conversions', () => {
    it('should convert 5,000 non-numeric tickets efficiently', async () => {
      const lines = ['FirstName,LastName,TicketNumber'];
      
      for (let i = 1; i <= 5000; i++) {
        const ticketPrefix = ['ABC', 'DEF', 'GHI', 'JKL', 'MNO'][i % 5];
        const ticket = `${ticketPrefix}${String(i).padStart(5, '0')}`;
        lines.push(`First${i},Last${i},${ticket}`);
      }
      
      const content = lines.join('\n');
      const file = createMockFile([content], 'conversions.csv', { type: 'text/csv' });
      const mapping: ColumnMapping = {
        firstName: 'FirstName',
        lastName: 'LastName',
        ticketNumber: 'TicketNumber'
      };

      const startTime = performance.now();
      const result = await parser.parse(file, mapping);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(500);
      expect(result.participants).toHaveLength(5000);
      expect(result.ticketConversions).toHaveLength(5000);
      
      // Verify conversions
      const firstConversion = result.ticketConversions![0];
      expect(firstConversion.original).toMatch(/^[A-Z]{3}\d{5}$/);
      expect(firstConversion.converted).toMatch(/^\d{5}$/);
    });
  });

  describe('Stress Testing', () => {
    it('should handle rapid successive parsing of medium files', async () => {
      const content = generateCSVContent(1000);
      const file = createMockFile([content], 'medium.csv', { type: 'text/csv' });
      const mapping: ColumnMapping = {
        firstName: 'FirstName',
        lastName: 'LastName',
        ticketNumber: 'TicketNumber'
      };

      const iterations = 10;
      const startTime = performance.now();
      
      const results = await Promise.all(
        Array.from({ length: iterations }, () => parser.parse(file, mapping))
      );
      
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(1000);
      expect(results).toHaveLength(iterations);
      results.forEach(result => {
        expect(result.participants).toHaveLength(1000);
      });
    });

    it('should maintain consistency across multiple large file parses', async () => {
      const content = generateCSVContent(5000);
      const file = createMockFile([content], 'consistent.csv', { type: 'text/csv' });
      const mapping: ColumnMapping = {
        firstName: 'FirstName',
        lastName: 'LastName',
        ticketNumber: 'TicketNumber'
      };

      const result1 = await parser.parse(file, mapping);
      const result2 = await parser.parse(file, mapping);
      
      expect(result1.participants).toHaveLength(5000);
      expect(result2.participants).toHaveLength(5000);
      expect(result1.participants[0]).toEqual(result2.participants[0]);
      expect(result1.participants[4999]).toEqual(result2.participants[4999]);
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle UK raffle export format with 10,000 entries', async () => {
      const lines = ['Title,Forename,Surname,Email,Mobile,Address1,Address2,Town,County,Postcode,TicketNo,PurchaseDate'];
      
      for (let i = 1; i <= 10000; i++) {
        const title = ['Mr', 'Mrs', 'Ms', 'Dr', ''][i % 5];
        const forename = `John${i}`;
        const surname = `Smith${i}`;
        const email = `john.smith${i}@example.co.uk`;
        const mobile = `07${String(i).padStart(9, '0')}`;
        const address1 = `${i} High Street`;
        const address2 = i % 3 === 0 ? `Flat ${i % 10}` : '';
        const town = ['London', 'Birmingham', 'Manchester', 'Leeds', 'Glasgow'][i % 5];
        const county = ['Greater London', 'West Midlands', 'Greater Manchester', 'West Yorkshire', 'Lanarkshire'][i % 5];
        const postcode = `SW${(i % 20) + 1} ${i % 9}AB`;
        const ticketNo = `UK${String(i).padStart(8, '0')}`;
        const purchaseDate = '2025-01-15';
        
        lines.push([title, forename, surname, email, mobile, address1, address2, town, county, postcode, ticketNo, purchaseDate].join(','));
      }
      
      const content = lines.join('\n');
      const file = createMockFile([content], 'uk-raffle.csv', { type: 'text/csv' });
      const mapping: ColumnMapping = {
        firstName: 'Forename',
        lastName: 'Surname',
        ticketNumber: 'TicketNo'
      };

      const startTime = performance.now();
      const result = await parser.parse(file, mapping);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(1000);
      expect(result.participants).toHaveLength(10000);
      expect(result.ticketConversions).toHaveLength(10000); // UK prefix should be removed
      
      // Verify correct parsing
      expect(result.participants[0].firstName).toBe('John1');
      expect(result.participants[0].lastName).toBe('Smith1');
      expect(result.participants[0].ticketNumber).toBe('00000001');
    });
  });
});