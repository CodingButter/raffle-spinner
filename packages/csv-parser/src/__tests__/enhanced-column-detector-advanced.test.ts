/**
 * Enhanced Column Detector Advanced Tests
 * Tests edge cases, international variations, and real-world scenarios
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EnhancedColumnMapper } from '../enhanced-column-detector';

describe('EnhancedColumnMapper - Advanced', () => {
  let mapper: EnhancedColumnMapper;

  beforeEach(() => {
    mapper = new EnhancedColumnMapper();
  });

  describe('International Variations', () => {
    it('should handle Spanish variations', () => {
      const headers = ['nombre', 'apellido', 'número'];
      const result = mapper.detectHeaders(headers);

      expect(result.firstName).toBe('nombre');
      expect(result.lastName).toBe('apellido');
      expect(result.ticketNumber).toBe('número');
    });

    it('should handle French variations', () => {
      const headers = ['prénom', 'nom de famille', 'billet'];
      const result = mapper.detectHeaders(headers);

      expect(result.firstName).toBe('prénom');
      expect(result.lastName).toBe('nom de famille');
      expect(result.ticketNumber).toBe('billet');
    });
  });

  describe('Typos and Misspellings', () => {
    it('should handle common typos with reasonable confidence', () => {
      const headers = ['frist name', 'last nam', 'tiket number'];
      const result = mapper.detectHeaders(headers);

      expect(result.firstName).toBe('frist name');
      expect(result.lastName).toBe('last nam');
      expect(result.ticketNumber).toBe('tiket number');
      
      expect(result.confidence.firstName).toBeGreaterThan(60);
      expect(result.confidence.lastName).toBeGreaterThan(60);
      expect(result.confidence.ticketNumber).toBeGreaterThan(60);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty header list', () => {
      const result = mapper.detectHeaders([]);
      
      expect(result.firstName).toBeNull();
      expect(result.lastName).toBeNull();
      expect(result.fullName).toBeNull();
      expect(result.ticketNumber).toBeNull();
      expect(result.overallConfidence).toBe(0);
    });

    it('should handle headers with special characters', () => {
      const headers = ['First Name!!', 'Last Name@#', 'Ticket #123'];
      const result = mapper.detectHeaders(headers);

      expect(result.firstName).toBe('First Name!!');
      expect(result.lastName).toBe('Last Name@#');
      expect(result.ticketNumber).toBe('Ticket #123');
    });

    it('should not match unrelated headers', () => {
      const headers = ['Email', 'Phone', 'Address'];
      const result = mapper.detectHeaders(headers);

      expect(result.firstName).toBeNull();
      expect(result.lastName).toBeNull();
      expect(result.fullName).toBeNull();
      expect(result.ticketNumber).toBeNull();
    });
  });

  describe('Performance Requirements', () => {
    it('should handle large header lists efficiently', () => {
      const largeHeaders = Array.from({ length: 50 }, (_, i) => `Column ${i}`);
      largeHeaders.push('First Name', 'Last Name', 'Ticket Number');

      const startTime = Date.now();
      const result = mapper.detectHeaders(largeHeaders);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100);
      expect(result.firstName).toBe('First Name');
      expect(result.lastName).toBe('Last Name');
      expect(result.ticketNumber).toBe('Ticket Number');
    });
  });
});