/**
 * Column Detector Tests
 * Tests the legacy wrapper and integration with enhanced column detector
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { IntelligentColumnMapper, EnhancedColumnMapper } from '../column-detector';

describe('Column Detector - Legacy Wrapper', () => {
  describe('IntelligentColumnMapper', () => {
    let mapper: IntelligentColumnMapper;

    beforeEach(() => {
      mapper = new IntelligentColumnMapper();
    });

    it('should instantiate correctly', () => {
      expect(mapper).toBeInstanceOf(IntelligentColumnMapper);
      expect(mapper.detectHeaders).toBeDefined();
    });

    it('should delegate to EnhancedColumnMapper', () => {
      const headers = ['First Name', 'Last Name', 'Ticket Number'];
      const result = mapper.detectHeaders(headers);

      expect(result).toBeDefined();
      expect(result.firstName).toBe('First Name');
      expect(result.lastName).toBe('Last Name');
      expect(result.ticketNumber).toBe('Ticket Number');
    });

    it('should maintain backward compatibility with original API', () => {
      const headers = ['Name', 'Entry'];
      const result = mapper.detectHeaders(headers);

      expect(result).toHaveProperty('firstName');
      expect(result).toHaveProperty('lastName');
      expect(result).toHaveProperty('fullName');
      expect(result).toHaveProperty('ticketNumber');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('overallConfidence');
    });

    it('should handle empty headers array', () => {
      const result = mapper.detectHeaders([]);
      
      expect(result.firstName).toBeNull();
      expect(result.lastName).toBeNull();
      expect(result.fullName).toBeNull();
      expect(result.ticketNumber).toBeNull();
      expect(result.overallConfidence).toBe(0);
    });

    it('should return same results as EnhancedColumnMapper', () => {
      const enhancedMapper = new EnhancedColumnMapper();
      const headers = ['firstname', 'lastname', 'ticket'];
      
      const legacyResult = mapper.detectHeaders(headers);
      const enhancedResult = enhancedMapper.detectHeaders(headers);
      
      expect(legacyResult).toEqual(enhancedResult);
    });
  });

  describe('Export verification', () => {
    it('should export EnhancedColumnMapper', () => {
      expect(EnhancedColumnMapper).toBeDefined();
      const mapper = new EnhancedColumnMapper();
      expect(mapper).toBeInstanceOf(EnhancedColumnMapper);
    });

    it('should have consistent method signatures', () => {
      const intelligent = new IntelligentColumnMapper();
      const enhanced = new EnhancedColumnMapper();
      
      expect(typeof intelligent.detectHeaders).toBe('function');
      expect(typeof enhanced.detectHeaders).toBe('function');
      expect(intelligent.detectHeaders.length).toBe(enhanced.detectHeaders.length);
    });
  });

  describe('Integration scenarios', () => {
    let mapper: IntelligentColumnMapper;

    beforeEach(() => {
      mapper = new IntelligentColumnMapper();
    });

    it('should handle real-world CSV headers', () => {
      const csvHeaders = [
        'Customer Name',
        'Email Address',
        'Phone Number',
        'Ticket #',
        'Purchase Date'
      ];
      
      const result = mapper.detectHeaders(csvHeaders);
      expect(result.fullName).toBe('Customer Name');
      expect(result.ticketNumber).toBe('Ticket #');
    });

    it('should handle Excel export headers', () => {
      const excelHeaders = [
        'A',
        'B',
        'First_Name',
        'Last_Name',
        'Entry_Number'
      ];
      
      const result = mapper.detectHeaders(excelHeaders);
      expect(result.firstName).toBe('First_Name');
      expect(result.lastName).toBe('Last_Name');
      expect(result.ticketNumber).toBe('Entry_Number');
    });

    it('should handle database export headers', () => {
      const dbHeaders = [
        'user_first_name',
        'user_last_name',
        'raffle_ticket_id'
      ];
      
      const result = mapper.detectHeaders(dbHeaders);
      expect(result.firstName).toBe('user_first_name');
      expect(result.lastName).toBe('user_last_name');
      expect(result.ticketNumber).toBe('raffle_ticket_id');
    });

    it('should handle mixed quality headers', () => {
      const mixedHeaders = [
        'Col1',
        'frist name',  // typo
        'LASTNAME',
        'tkt',
        'Extra Column'
      ];
      
      const result = mapper.detectHeaders(mixedHeaders);
      expect(result.firstName).toBe('frist name');
      expect(result.lastName).toBe('LASTNAME');
      expect(result.ticketNumber).toBe('tkt');
      expect(result.overallConfidence).toBeGreaterThan(50);
    });
  });

  describe('Type safety', () => {
    it('should return properly typed results', () => {
      const mapper = new IntelligentColumnMapper();
      const result = mapper.detectHeaders(['Name', 'Number']);
      
      // Check types at runtime
      expect(typeof result.firstName === 'string' || result.firstName === null).toBe(true);
      expect(typeof result.lastName === 'string' || result.lastName === null).toBe(true);
      expect(typeof result.fullName === 'string' || result.fullName === null).toBe(true);
      expect(typeof result.ticketNumber === 'string' || result.ticketNumber === null).toBe(true);
      expect(typeof result.overallConfidence).toBe('number');
      expect(typeof result.confidence).toBe('object');
    });
  });
});