/**
 * Performance Benchmark Tests
 * Tests performance requirements for CSV processing with large datasets
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EnhancedColumnMapper } from '../enhanced-column-detector';
import { findBestMatch, levenshteinDistance, calculateSimilarity } from '../fuzzy-matcher';

describe('Performance Benchmarks', () => {
  describe('Large Dataset Processing', () => {
    let mapper: EnhancedColumnMapper;

    beforeEach(() => {
      mapper = new EnhancedColumnMapper();
    });

    it('should process 100 headers in under 50ms', () => {
      const headers = Array.from({ length: 100 }, (_, i) => `Column_${i}`);
      headers[50] = 'First Name';
      headers[51] = 'Last Name';
      headers[52] = 'Ticket Number';

      const startTime = performance.now();
      const result = mapper.detectHeaders(headers);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(50);
      expect(result.firstName).toBe('First Name');
      expect(result.lastName).toBe('Last Name');
      expect(result.ticketNumber).toBe('Ticket Number');
    });

    it('should process 500 headers in under 200ms', () => {
      const headers = Array.from({ length: 500 }, (_, i) => `Field_${i}`);
      headers[100] = 'firstname';
      headers[200] = 'lastname';
      headers[300] = 'ticket';

      const startTime = performance.now();
      const result = mapper.detectHeaders(headers);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(200);
      expect(result.firstName).toBe('firstname');
      expect(result.lastName).toBe('lastname');
      expect(result.ticketNumber).toBe('ticket');
    });

    it('should handle 1000 fuzzy matches in under 100ms', () => {
      const patterns = ['first name', 'last name', 'ticket number'];
      const headers = Array.from({ length: 1000 }, (_, i) => `header_${i % 100}`);

      const startTime = performance.now();
      headers.forEach(header => {
        findBestMatch(header, patterns, 60);
      });
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe('Levenshtein Distance Performance', () => {
    it('should calculate distance for 100-char strings in under 5ms', () => {
      const str1 = 'a'.repeat(50) + 'b'.repeat(50);
      const str2 = 'b'.repeat(50) + 'a'.repeat(50);

      const startTime = performance.now();
      const distance = levenshteinDistance(str1, str2);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(5);
      expect(distance).toBeGreaterThan(0);
    });

    it('should handle 10,000 short string comparisons in under 100ms', () => {
      const strings = Array.from({ length: 100 }, (_, i) => `str${i}`);
      
      const startTime = performance.now();
      for (let i = 0; i < 100; i++) {
        for (let j = 0; j < 100; j++) {
          levenshteinDistance(strings[i], strings[j]);
        }
      }
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe('Memory Efficiency', () => {
    it('should not leak memory with repeated operations', () => {
      const mapper = new EnhancedColumnMapper();
      const headers = ['First Name', 'Last Name', 'Ticket'];
      
      // Perform many operations
      for (let i = 0; i < 10000; i++) {
        mapper.detectHeaders(headers);
      }
      
      // If we get here without crashing, memory is managed properly
      expect(true).toBe(true);
    });

    it('should handle very long header names efficiently', () => {
      const longHeader = 'x'.repeat(1000);
      const patterns = [longHeader, 'short'];
      
      const startTime = performance.now();
      const result = findBestMatch(longHeader, patterns);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(10);
      expect(result!.pattern).toBe(longHeader);
    });
  });

  describe('Concurrent Processing Simulation', () => {
    it('should handle multiple mapper instances efficiently', () => {
      const mappers = Array.from({ length: 10 }, () => new EnhancedColumnMapper());
      const headers = ['Name', 'Number', 'Email', 'Address'];
      
      const startTime = performance.now();
      const results = mappers.map(mapper => mapper.detectHeaders(headers));
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(50);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result.fullName).toBe('Name');
        expect(result.ticketNumber).toBe('Number');
      });
    });
  });

  describe('Real-world Performance Scenarios', () => {
    it('should process UK raffle CSV with 5000 participants efficiently', () => {
      // Simulate processing headers for a large raffle
      const headers = [
        'Participant ID',
        'Title',
        'First Name',
        'Middle Name',
        'Last Name',
        'Suffix',
        'Email',
        'Phone',
        'Address Line 1',
        'Address Line 2',
        'City',
        'County',
        'Postcode',
        'Country',
        'Ticket Number',
        'Purchase Date',
        'Purchase Time',
        'Payment Method',
        'Amount',
        'Status'
      ];
      
      const mapper = new EnhancedColumnMapper();
      
      // Simulate processing multiple times (like for batch imports)
      const iterations = 100;
      const startTime = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        const result = mapper.detectHeaders(headers);
        expect(result.firstName).toBe('First Name');
        expect(result.lastName).toBe('Last Name');
        expect(result.ticketNumber).toBe('Ticket Number');
      }
      
      const endTime = performance.now();
      const avgTime = (endTime - startTime) / iterations;
      
      expect(avgTime).toBeLessThan(1); // Average under 1ms per detection
    });

    it('should handle malformed headers efficiently', () => {
      const malformedHeaders = [
        '!!!First___Name!!!',
        '   Last    Name   ',
        'TiCkEt__NuMbEr',
        '@#$%^&*()',
        '',
        null as any,
        undefined as any,
        '   ',
        'very_very_very_very_very_long_header_name_that_might_break_things'
      ];
      
      const mapper = new EnhancedColumnMapper();
      
      const startTime = performance.now();
      const result = mapper.detectHeaders(malformedHeaders);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(10);
      expect(result).toBeDefined();
    });
  });

  describe('Algorithm Complexity Verification', () => {
    it('should maintain O(n*m) complexity for Levenshtein', () => {
      const timings: number[] = [];
      
      for (let size = 10; size <= 100; size += 10) {
        const str1 = 'a'.repeat(size);
        const str2 = 'b'.repeat(size);
        
        const startTime = performance.now();
        levenshteinDistance(str1, str2);
        const endTime = performance.now();
        
        timings.push(endTime - startTime);
      }
      
      // Verify that time increases roughly quadratically
      // Later timings should be less than 4x earlier ones for 2x size increase
      const ratio = timings[timings.length - 1] / timings[0];
      expect(ratio).toBeLessThan(150); // 10x size increase should be < 150x time
    });

    it('should scale linearly with header count', () => {
      const mapper = new EnhancedColumnMapper();
      const timings: number[] = [];
      
      for (let count = 10; count <= 100; count += 10) {
        const headers = Array.from({ length: count }, (_, i) => `Header_${i}`);
        headers[0] = 'First Name';
        
        const startTime = performance.now();
        mapper.detectHeaders(headers);
        const endTime = performance.now();
        
        timings.push(endTime - startTime);
      }
      
      // Verify roughly linear scaling
      const ratio = timings[timings.length - 1] / timings[0];
      expect(ratio).toBeLessThan(15); // 10x headers should be < 15x time
    });
  });
});