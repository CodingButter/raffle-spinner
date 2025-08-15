/**
 * Fuzzy Matcher Pattern Tests
 * Tests pattern matching and real-world header variations
 */

import { describe, it, expect } from 'vitest';
import { findBestMatch } from '../fuzzy-matcher';

describe('Fuzzy Matcher - Patterns', () => {
  describe('findBestMatch', () => {
    const patterns = ['first name', 'last name', 'ticket number'];

    it('should find exact matches with 100% confidence', () => {
      const result = findBestMatch('first name', patterns);
      expect(result).toEqual({
        pattern: 'first name',
        score: 1.0,
        confidence: 100,
      });
    });

    it('should find substring matches with high confidence', () => {
      const result = findBestMatch('firstname', patterns);
      expect(result).not.toBeNull();
      expect(result!.pattern).toBe('first name');
      expect(result!.confidence).toBeGreaterThan(75);
    });

    it('should handle variations with underscores', () => {
      const result = findBestMatch('first_name', patterns);
      expect(result).not.toBeNull();
      expect(result!.pattern).toBe('first name');
      expect(result!.confidence).toBeGreaterThan(90);
    });

    it('should handle typos with fuzzy matching', () => {
      const result = findBestMatch('frist name', patterns);
      expect(result).not.toBeNull();
      expect(result!.pattern).toBe('first name');
      expect(result!.confidence).toBeGreaterThan(60);
    });

    it('should return null for low confidence matches', () => {
      const result = findBestMatch('completely different', patterns, 70);
      expect(result).toBeNull();
    });

    it('should respect minimum confidence threshold', () => {
      const result = findBestMatch('xyz', patterns, 90);
      expect(result).toBeNull();
    });
  });

  describe('real-world header variations', () => {
    const firstNamePatterns = [
      'first name',
      'firstname',
      'fname',
      'first_name',
      'given name',
    ];

    it('should match common first name variations', () => {
      const testHeaders = [
        'First Name',
        'FirstName',
        'first_name',
        'FIRST NAME',
        'fname',
        'F Name',
        'Given Name',
        'frist name',
      ];

      testHeaders.forEach((header) => {
        const result = findBestMatch(header, firstNamePatterns, 60);
        expect(result).not.toBeNull();
        expect(result!.confidence).toBeGreaterThan(60);
      });
    });

    const ticketPatterns = [
      'ticket',
      'ticket number',
      'number',
      'entry',
      'id',
      'tkt',
    ];

    it('should match ticket number variations', () => {
      const testHeaders = [
        'Ticket',
        'Ticket Number',
        'ticket_number',
        'TICKET#',
        'entry',
        'Entry Number',
        'ID',
        'Number',
        'tkt',
        'ticket no',
      ];

      testHeaders.forEach((header) => {
        const result = findBestMatch(header, ticketPatterns, 60);
        expect(result).not.toBeNull();
        expect(result!.confidence).toBeGreaterThan(60);
      });
    });
  });

  describe('performance tests', () => {
    it('should handle large pattern lists efficiently', () => {
      const largePatternList = Array.from({ length: 100 }, (_, i) => `pattern${i}`);
      const startTime = Date.now();
      
      findBestMatch('pattern50', largePatternList);
      
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(100);
    });
  });
});