/**
 * Malformed Data Tests
 * Tests handling of corrupted, invalid, and edge-case CSV data
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EnhancedColumnMapper } from '../enhanced-column-detector';
import { findBestMatch, normalizeHeader } from '../fuzzy-matcher';

describe('Malformed Data Handling', () => {
  let mapper: EnhancedColumnMapper;

  beforeEach(() => {
    mapper = new EnhancedColumnMapper();
  });

  describe('Invalid Header Types', () => {
    it('should handle null values in headers array', () => {
      const headers = ['Name', null as any, 'Ticket'];
      const result = mapper.detectHeaders(headers);
      
      expect(result.fullName).toBe('Name');
      expect(result.ticketNumber).toBe('Ticket');
      expect(() => mapper.detectHeaders(headers)).not.toThrow();
    });

    it('should handle undefined values in headers array', () => {
      const headers = [undefined as any, 'First Name', undefined as any, 'Last Name'];
      const result = mapper.detectHeaders(headers);
      
      expect(result.firstName).toBe('First Name');
      expect(result.lastName).toBe('Last Name');
    });

    it('should handle number values in headers', () => {
      const headers = [123 as any, 'Name', 456 as any, 'Ticket'];
      const result = mapper.detectHeaders(headers);
      
      expect(result.fullName).toBe('Name');
      expect(result.ticketNumber).toBe('Ticket');
    });

    it('should handle object values in headers', () => {
      const headers = [{ key: 'value' } as any, 'First Name', ['array'] as any];
      const result = mapper.detectHeaders(headers);
      
      expect(result.firstName).toBe('First Name');
      expect(() => mapper.detectHeaders(headers)).not.toThrow();
    });

    it('should handle boolean values in headers', () => {
      const headers = [true as any, 'Name', false as any, 'Number'];
      const result = mapper.detectHeaders(headers);
      
      expect(result.fullName).toBe('Name');
      expect(result.ticketNumber).toBe('Number');
    });
  });

  describe('Corrupted String Headers', () => {
    it('should handle headers with control characters', () => {
      const headers = ['Name\x00\x01\x02', 'Ticket\r\n\t', 'Test\b\f'];
      const result = mapper.detectHeaders(headers);
      
      expect(result).toBeDefined();
      expect(() => mapper.detectHeaders(headers)).not.toThrow();
    });

    it('should handle headers with invalid UTF-8 sequences', () => {
      const headers = ['Name\uFFFD', 'Ticket\uD800', 'Test'];
      const result = mapper.detectHeaders(headers);
      
      expect(result).toBeDefined();
      expect(() => mapper.detectHeaders(headers)).not.toThrow();
    });

    it('should handle headers with excessive special characters', () => {
      const headers = [
        '!@#$%^&*()_+-=[]{}|;:,.<>?',
        '```~~~```',
        '///\\\\///',
        'First Name'
      ];
      
      const result = mapper.detectHeaders(headers);
      expect(result.firstName).toBe('First Name');
    });

    it('should handle headers with HTML/XML content', () => {
      const headers = [
        '<div>First Name</div>',
        '<script>alert("test")</script>',
        '&lt;Last Name&gt;',
        'Ticket&nbsp;Number'
      ];
      
      const result = mapper.detectHeaders(headers);
      expect(result).toBeDefined();
      expect(() => mapper.detectHeaders(headers)).not.toThrow();
    });

    it('should handle headers with SQL injection attempts', () => {
      const headers = [
        "First'; DROP TABLE users; --",
        'Last Name OR 1=1',
        'Ticket UNION SELECT * FROM',
        'Normal Header'
      ];
      
      const result = mapper.detectHeaders(headers);
      expect(result).toBeDefined();
      expect(() => mapper.detectHeaders(headers)).not.toThrow();
    });
  });

  describe('Empty and Whitespace Headers', () => {
    it('should handle completely empty headers array', () => {
      const result = mapper.detectHeaders([]);
      
      expect(result.firstName).toBeNull();
      expect(result.lastName).toBeNull();
      expect(result.fullName).toBeNull();
      expect(result.ticketNumber).toBeNull();
      expect(result.overallConfidence).toBe(0);
    });

    it('should handle headers with only empty strings', () => {
      const headers = ['', '', '', ''];
      const result = mapper.detectHeaders(headers);
      
      expect(result.firstName).toBeNull();
      expect(result.lastName).toBeNull();
      expect(result.fullName).toBeNull();
      expect(result.ticketNumber).toBeNull();
    });

    it('should handle headers with only whitespace', () => {
      const headers = ['   ', '\t', '\n', '\r\n'];
      const result = mapper.detectHeaders(headers);
      
      expect(result.firstName).toBeNull();
      expect(result.lastName).toBeNull();
      expect(result.fullName).toBeNull();
      expect(result.ticketNumber).toBeNull();
    });

    it('should handle mixed empty and valid headers', () => {
      const headers = ['', 'First Name', '   ', 'Last Name', '', 'Ticket'];
      const result = mapper.detectHeaders(headers);
      
      expect(result.firstName).toBe('First Name');
      expect(result.lastName).toBe('Last Name');
      expect(result.ticketNumber).toBe('Ticket');
    });
  });

  describe('Extreme Size Headers', () => {
    it('should handle extremely long header names', () => {
      const longHeader = 'First_' + 'Name_'.repeat(1000);
      const headers = [longHeader, 'Last Name', 'Ticket'];
      
      const result = mapper.detectHeaders(headers);
      expect(result.lastName).toBe('Last Name');
      expect(result.ticketNumber).toBe('Ticket');
      expect(() => mapper.detectHeaders(headers)).not.toThrow();
    });

    it('should handle headers with single characters', () => {
      const headers = ['F', 'L', 'T', 'N'];
      const result = mapper.detectHeaders(headers);
      
      // Should match some abbreviated forms
      expect(result).toBeDefined();
      expect(result.overallConfidence).toBeGreaterThanOrEqual(0);
    });

    it('should handle very large number of headers', () => {
      const headers = Array.from({ length: 10000 }, (_, i) => `Col${i}`);
      headers[5000] = 'First Name';
      headers[5001] = 'Last Name';
      headers[5002] = 'Ticket Number';
      
      const result = mapper.detectHeaders(headers);
      expect(result.firstName).toBe('First Name');
      expect(result.lastName).toBe('Last Name');
      expect(result.ticketNumber).toBe('Ticket Number');
    });
  });

  describe('Unicode and International Characters', () => {
    it('should handle emoji in headers', () => {
      const headers = ['😀 Name', 'Ticket 🎫', '👤 Person', 'Number 🔢'];
      const result = mapper.detectHeaders(headers);
      
      expect(result).toBeDefined();
      expect(() => mapper.detectHeaders(headers)).not.toThrow();
    });

    it('should handle RTL (Right-to-Left) text', () => {
      const headers = ['שם פרטי', 'اسم', 'نام', 'First Name'];
      const result = mapper.detectHeaders(headers);
      
      expect(result.firstName).toBe('First Name');
      expect(() => mapper.detectHeaders(headers)).not.toThrow();
    });

    it('should handle mixed scripts', () => {
      const headers = ['名First', 'LastИмя', 'Ticket番号', 'Normal'];
      const result = mapper.detectHeaders(headers);
      
      expect(result).toBeDefined();
      expect(() => mapper.detectHeaders(headers)).not.toThrow();
    });

    it('should handle zero-width characters', () => {
      const headers = [
        'First\u200BName',  // Zero-width space
        'Last\u200CName',   // Zero-width non-joiner
        'Ticket\uFEFF'      // Zero-width no-break space
      ];
      
      const result = mapper.detectHeaders(headers);
      expect(result).toBeDefined();
      expect(() => mapper.detectHeaders(headers)).not.toThrow();
    });
  });

  describe('CSV-Specific Edge Cases', () => {
    it('should handle quoted headers', () => {
      const headers = ['"First Name"', "'Last Name'", '`Ticket Number`'];
      const result = mapper.detectHeaders(headers);
      
      expect(result).toBeDefined();
      // Quotes should be handled in normalization
    });

    it('should handle headers with line breaks', () => {
      const headers = ['First\nName', 'Last\rName', 'Ticket\r\nNumber'];
      const result = mapper.detectHeaders(headers);
      
      expect(result).toBeDefined();
      expect(() => mapper.detectHeaders(headers)).not.toThrow();
    });

    it('should handle headers with CSV delimiters', () => {
      const headers = ['First,Name', 'Last;Name', 'Ticket|Number', 'Test\tName'];
      const result = mapper.detectHeaders(headers);
      
      expect(result).toBeDefined();
      expect(() => mapper.detectHeaders(headers)).not.toThrow();
    });

    it('should handle BOM (Byte Order Mark) characters', () => {
      const headers = ['\uFEFFFirst Name', 'Last Name\uFEFF', 'Ticket'];
      const result = mapper.detectHeaders(headers);
      
      expect(result).toBeDefined();
      expect(result.ticketNumber).toBe('Ticket');
    });
  });

  describe('Fuzzy Matcher Resilience', () => {
    it('should not crash on null pattern', () => {
      const result = findBestMatch('test', [null as any, 'valid', undefined as any]);
      expect(result).toBeDefined();
    });

    it('should handle empty pattern arrays gracefully', () => {
      const result = findBestMatch('test', []);
      expect(result).toBeNull();
    });

    it('should handle patterns with only special characters', () => {
      const patterns = ['@#$%', '!!!', '***', 'first name'];
      const result = findBestMatch('firstname', patterns);
      
      expect(result).not.toBeNull();
      expect(result!.pattern).toBe('first name');
    });

    it('should normalize extremely malformed headers', () => {
      const malformed = '   ___First---Name!!!   @#$   ';
      const normalized = normalizeHeader(malformed);
      
      expect(normalized).toBe('first name');
    });
  });

  describe('Recovery from Errors', () => {
    it('should provide partial results when some matching fails', () => {
      const headers = ['First Name', null as any, undefined as any, '', 'Ticket'];
      const result = mapper.detectHeaders(headers);
      
      expect(result.firstName).toBe('First Name');
      expect(result.ticketNumber).toBe('Ticket');
      expect(result.lastName).toBeNull();
      expect(result.overallConfidence).toBeGreaterThan(0);
    });

    it('should handle circular references in objects', () => {
      const circular: any = { name: 'test' };
      circular.self = circular;
      
      const headers = [circular, 'First Name', 'Ticket'];
      const result = mapper.detectHeaders(headers);
      
      expect(result.firstName).toBe('First Name');
      expect(result.ticketNumber).toBe('Ticket');
    });

    it('should handle Symbol values', () => {
      const headers = [Symbol('test') as any, 'Name', Symbol.for('ticket') as any];
      const result = mapper.detectHeaders(headers);
      
      expect(result.fullName).toBe('Name');
      expect(() => mapper.detectHeaders(headers)).not.toThrow();
    });
  });
});