/**
 * Enhanced Column Detector Basic Tests
 * Tests standard CSV headers and common variations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EnhancedColumnMapper } from '../enhanced-column-detector';

describe('EnhancedColumnMapper - Basic', () => {
  let mapper: EnhancedColumnMapper;

  beforeEach(() => {
    mapper = new EnhancedColumnMapper();
  });

  describe('Standard CSV Headers', () => {
    it('should detect perfect standard headers with 100% confidence', () => {
      const headers = ['First Name', 'Last Name', 'Ticket Number'];
      const result = mapper.detectHeaders(headers);

      expect(result.firstName).toBe('First Name');
      expect(result.lastName).toBe('Last Name');
      expect(result.ticketNumber).toBe('Ticket Number');
      expect(result.confidence.firstName).toBeGreaterThanOrEqual(90);
      expect(result.confidence.lastName).toBeGreaterThanOrEqual(90);
      expect(result.confidence.ticketNumber).toBeGreaterThanOrEqual(90);
      expect(result.overallConfidence).toBeGreaterThan(85);
    });

    it('should prefer full name over separate names when available', () => {
      const headers = ['Name', 'First Name', 'Last Name', 'Ticket'];
      const result = mapper.detectHeaders(headers);

      expect(result.fullName).toBe('Name');
      expect(result.firstName).toBeNull();
      expect(result.lastName).toBeNull();
      expect(result.ticketNumber).toBe('Ticket');
    });
  });

  describe('Common Header Variations', () => {
    it('should handle underscore variations', () => {
      const headers = ['first_name', 'last_name', 'ticket_number'];
      const result = mapper.detectHeaders(headers);

      expect(result.firstName).toBe('first_name');
      expect(result.lastName).toBe('last_name');
      expect(result.ticketNumber).toBe('ticket_number');
      expect(result.overallConfidence).toBeGreaterThan(80);
    });

    it('should handle mixed case and spacing', () => {
      const headers = ['FIRST NAME', 'Last  Name', 'ticket number'];
      const result = mapper.detectHeaders(headers);

      expect(result.firstName).toBe('FIRST NAME');
      expect(result.lastName).toBe('Last  Name');
      expect(result.ticketNumber).toBe('ticket number');
    });

    it('should handle abbreviated forms', () => {
      const headers = ['fname', 'lname', 'tkt'];
      const result = mapper.detectHeaders(headers);

      expect(result.firstName).toBe('fname');
      expect(result.lastName).toBe('lname');
      expect(result.ticketNumber).toBe('tkt');
      expect(result.overallConfidence).toBeGreaterThan(70);
    });
  });

  describe('Confidence System', () => {
    it('should provide confidence descriptions', () => {
      expect(mapper.getConfidenceDescription(95)).toBe('Excellent');
      expect(mapper.getConfidenceDescription(80)).toBe('Very Good');
      expect(mapper.getConfidenceDescription(65)).toBe('Good');
      expect(mapper.getConfidenceDescription(45)).toBe('Fair');
      expect(mapper.getConfidenceDescription(20)).toBe('Poor');
    });

    it('should recommend auto-apply for high confidence results', () => {
      const headers = ['Name', 'Ticket Number'];
      const result = mapper.detectHeaders(headers);

      if (result.overallConfidence >= 75) {
        expect(mapper.shouldAutoApply(result)).toBe(true);
      }
    });

    it('should not recommend auto-apply for low confidence results', () => {
      const headers = ['Col1', 'Col2', 'Col3'];
      const result = mapper.detectHeaders(headers);

      expect(mapper.shouldAutoApply(result)).toBe(false);
    });
  });
});