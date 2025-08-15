/**
 * Fuzzy Matcher Basic Tests
 * Tests core functionality of fuzzy matching algorithms
 */

import { describe, it, expect } from 'vitest';
import {
  levenshteinDistance,
  calculateSimilarity,
  normalizeHeader,
  calculateConfidence,
} from '../fuzzy-matcher';

describe('Fuzzy Matcher - Basics', () => {
  describe('levenshteinDistance', () => {
    it('should calculate correct distance for identical strings', () => {
      expect(levenshteinDistance('hello', 'hello')).toBe(0);
    });

    it('should calculate correct distance for completely different strings', () => {
      expect(levenshteinDistance('cat', 'dog')).toBe(3);
    });

    it('should handle single character differences', () => {
      expect(levenshteinDistance('cat', 'bat')).toBe(1);
      expect(levenshteinDistance('hello', 'hallo')).toBe(1);
    });

    it('should handle insertions and deletions', () => {
      expect(levenshteinDistance('hello', 'helo')).toBe(1);
      expect(levenshteinDistance('helo', 'hello')).toBe(1);
    });

    it('should handle empty strings', () => {
      expect(levenshteinDistance('', '')).toBe(0);
      expect(levenshteinDistance('hello', '')).toBe(5);
      expect(levenshteinDistance('', 'world')).toBe(5);
    });
  });

  describe('calculateSimilarity', () => {
    it('should return 1.0 for identical strings', () => {
      expect(calculateSimilarity('hello', 'hello')).toBe(1.0);
    });

    it('should return 0.0 for completely different strings of same length', () => {
      expect(calculateSimilarity('abc', 'xyz')).toBe(0.0);
    });

    it('should calculate reasonable similarity for similar strings', () => {
      const similarity = calculateSimilarity('first name', 'firstname');
      expect(similarity).toBeGreaterThan(0.8);
    });

    it('should handle empty strings', () => {
      expect(calculateSimilarity('', '')).toBe(1.0);
    });
  });

  describe('normalizeHeader', () => {
    it('should convert to lowercase and trim', () => {
      expect(normalizeHeader('  First Name  ')).toBe('first name');
    });

    it('should replace underscores and dashes with spaces', () => {
      expect(normalizeHeader('first_name')).toBe('first name');
      expect(normalizeHeader('first-name')).toBe('first name');
    });

    it('should collapse multiple spaces', () => {
      expect(normalizeHeader('first   name')).toBe('first name');
    });

    it('should remove special characters', () => {
      expect(normalizeHeader('first@name!')).toBe('first name');
    });

    it('should handle complex combinations', () => {
      expect(normalizeHeader('  First_Name@123  ')).toBe('first name 123');
    });
  });

  describe('calculateConfidence', () => {
    it('should return 100 for exact matches', () => {
      expect(calculateConfidence('test', 'test', true, false, 0.9)).toBe(100);
    });

    it('should return high confidence for substring matches', () => {
      const confidence = calculateConfidence('test', 'test', false, true, 0.9);
      expect(confidence).toBeGreaterThanOrEqual(85);
    });

    it('should return lower confidence for pure fuzzy matches', () => {
      const confidence = calculateConfidence('test', 'tset', false, false, 0.8);
      expect(confidence).toBeLessThan(85);
      expect(confidence).toBeGreaterThan(0);
    });
  });
});