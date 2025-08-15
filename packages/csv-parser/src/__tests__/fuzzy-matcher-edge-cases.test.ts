/**
 * Fuzzy Matcher Edge Cases Tests
 * Tests boundary conditions, error handling, and extreme inputs
 */

import { describe, it, expect } from 'vitest';
import {
  levenshteinDistance,
  calculateSimilarity,
  normalizeHeader,
  findBestMatch,
  calculateConfidence,
} from '../fuzzy-matcher';

describe('Fuzzy Matcher - Edge Cases', () => {
  describe('levenshteinDistance edge cases', () => {
    it('should handle very long strings efficiently', () => {
      const longStr1 = 'a'.repeat(1000);
      const longStr2 = 'a'.repeat(999) + 'b';
      const distance = levenshteinDistance(longStr1, longStr2);
      expect(distance).toBe(1);
    });

    it('should handle Unicode characters correctly', () => {
      expect(levenshteinDistance('café', 'cafe')).toBe(1);
      expect(levenshteinDistance('こんにちは', 'こんにちは')).toBe(0);
      expect(levenshteinDistance('🔥', '💧')).toBe(1);
    });

    it('should handle strings with only whitespace', () => {
      expect(levenshteinDistance('   ', '   ')).toBe(0);
      expect(levenshteinDistance('   ', '  ')).toBe(1);
      expect(levenshteinDistance('\t\n', '\t\n')).toBe(0);
    });

    it('should handle null bytes and control characters', () => {
      expect(levenshteinDistance('test\x00', 'test')).toBe(1);
      expect(levenshteinDistance('test\n', 'test\r')).toBe(1);
    });
  });

  describe('calculateSimilarity edge cases', () => {
    it('should handle extreme length differences', () => {
      const similarity = calculateSimilarity('a', 'a'.repeat(100));
      expect(similarity).toBeLessThan(0.1);
      expect(similarity).toBeGreaterThan(0);
    });

    it('should handle special characters in similarity', () => {
      const sim1 = calculateSimilarity('test@#$', 'test@#$');
      expect(sim1).toBe(1.0);
      
      const sim2 = calculateSimilarity('test!!!', 'test???');
      expect(sim2).toBeGreaterThan(0.5);
    });

    it('should handle repeated characters', () => {
      const similarity = calculateSimilarity('aaaa', 'aaa');
      expect(similarity).toBe(0.75);
    });
  });

  describe('normalizeHeader edge cases', () => {
    it('should handle headers with only special characters', () => {
      expect(normalizeHeader('@#$%^&*()')).toBe('');
      expect(normalizeHeader('___---___')).toBe('');
    });

    it('should handle mixed scripts and languages', () => {
      expect(normalizeHeader('Name名前')).toBe('name');
      expect(normalizeHeader('Test123测试')).toBe('test123');
    });

    it('should handle excessive whitespace', () => {
      const input = '  \t\n  First   \t\t  Name  \n\n  ';
      expect(normalizeHeader(input)).toBe('first name');
    });

    it('should handle HTML/XML entities', () => {
      expect(normalizeHeader('First&nbsp;Name')).toBe('first nbsp name');
      expect(normalizeHeader('<Name>')).toBe('name');
    });

    it('should handle numbers and alphanumeric combinations', () => {
      expect(normalizeHeader('field123abc')).toBe('field123abc');
      expect(normalizeHeader('123 456 789')).toBe('123 456 789');
    });
  });

  describe('findBestMatch edge cases', () => {
    it('should handle empty pattern array', () => {
      const result = findBestMatch('test', []);
      expect(result).toBeNull();
    });

    it('should handle patterns with empty strings', () => {
      const patterns = ['', 'first name', ''];
      const result = findBestMatch('first name', patterns);
      expect(result).not.toBeNull();
      expect(result!.pattern).toBe('first name');
    });

    it('should handle very similar patterns correctly', () => {
      const patterns = ['firstname', 'first name', 'first_name'];
      const result = findBestMatch('first name', patterns);
      expect(result!.pattern).toBe('first name');
      expect(result!.confidence).toBe(100);
    });

    it('should handle patterns with different confidence thresholds', () => {
      const patterns = ['completely', 'different', 'words'];
      const result95 = findBestMatch('test', patterns, 95);
      expect(result95).toBeNull();
      
      const result10 = findBestMatch('test', patterns, 10);
      expect(result10).not.toBeNull();
    });

    it('should prioritize exact matches over fuzzy matches', () => {
      const patterns = ['test1', 'test2', 'test'];
      const result = findBestMatch('test', patterns);
      expect(result!.pattern).toBe('test');
      expect(result!.confidence).toBe(100);
    });

    it('should handle case-insensitive matching correctly', () => {
      const patterns = ['FIRSTNAME', 'LastName', 'TiCkEt'];
      const result = findBestMatch('firstname', patterns);
      expect(result).not.toBeNull();
      expect(result!.pattern).toBe('FIRSTNAME');
    });
  });

  describe('calculateConfidence edge cases', () => {
    it('should handle all false parameters', () => {
      const confidence = calculateConfidence('test', 'test', false, false, 0);
      expect(confidence).toBe(0);
    });

    it('should handle fuzzy score edge values', () => {
      expect(calculateConfidence('test', 'test', false, false, 1.0)).toBe(80);
      expect(calculateConfidence('test', 'test', false, false, 0.5)).toBe(40);
      expect(calculateConfidence('test', 'test', false, false, 0.0)).toBe(0);
    });

    it('should prioritize exact match over other parameters', () => {
      const confidence = calculateConfidence('test', 'test', true, true, 0.5);
      expect(confidence).toBe(100);
    });

    it('should handle substring match with various fuzzy scores', () => {
      const conf1 = calculateConfidence('test', 'test', false, true, 0.9);
      const conf2 = calculateConfidence('test', 'test', false, true, 0.5);
      expect(conf1).toBeGreaterThanOrEqual(85);
      expect(conf2).toBeGreaterThanOrEqual(85);
    });
  });

  describe('Performance boundaries', () => {
    it('should handle 100+ patterns efficiently', () => {
      const patterns = Array.from({ length: 100 }, (_, i) => `pattern_${i}`);
      patterns.push('first name');
      
      const startTime = Date.now();
      const result = findBestMatch('first name', patterns);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(50);
      expect(result!.pattern).toBe('first name');
    });

    it('should handle very long header names', () => {
      const longHeader = 'this_is_a_very_long_header_name_that_might_appear_in_real_csv_files';
      const patterns = ['short', longHeader, 'another'];
      
      const result = findBestMatch(longHeader, patterns);
      expect(result!.pattern).toBe(longHeader);
      expect(result!.confidence).toBe(100);
    });
  });

  describe('Special character handling', () => {
    it('should handle CSV-specific characters', () => {
      const patterns = ['name,first', 'name"quoted"', 'name\ttab'];
      const normalized = patterns.map(p => normalizeHeader(p));
      
      expect(normalized[0]).toBe('name first');
      expect(normalized[1]).toBe('name quoted');
      expect(normalized[2]).toBe('name tab');
    });

    it('should handle mathematical symbols', () => {
      const result = findBestMatch('value+1', ['value 1', 'value-1', 'value+1'], 60);
      expect(result).not.toBeNull();
    });
  });
});