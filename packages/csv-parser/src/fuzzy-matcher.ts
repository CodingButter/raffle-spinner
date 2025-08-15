/**
 * Fuzzy Matching Utility
 *
 * Purpose: Provides string similarity matching algorithms for intelligent
 * CSV column header detection using Levenshtein distance and normalized scoring.
 *
 * SRS Reference:
 * - FR-1.4: Column Mapping Interface (fuzzy matching for headers)
 * - Performance Requirements: <200 lines, efficient string comparison
 */

export interface FuzzyMatchResult {
  pattern: string;
  score: number;
  confidence: number;
}

/**
 * Calculate Levenshtein distance between two strings
 * Uses dynamic programming for optimal efficiency
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;

  // Create matrix for dynamic programming
  const matrix: number[][] = Array(len2 + 1)
    .fill(null)
    .map(() => Array(len1 + 1).fill(0));

  // Initialize first row and column
  for (let i = 0; i <= len1; i++) matrix[0][i] = i;
  for (let j = 0; j <= len2; j++) matrix[j][0] = j;

  // Fill the matrix
  for (let j = 1; j <= len2; j++) {
    for (let i = 1; i <= len1; i++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j - 1][i] + 1, // deletion
        matrix[j][i - 1] + 1, // insertion
        matrix[j - 1][i - 1] + cost // substitution
      );
    }
  }

  return matrix[len2][len1];
}

/**
 * Calculate similarity score between two strings (0-1, higher is better)
 * Normalizes Levenshtein distance to a 0-1 scale
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1.0;

  const distance = levenshteinDistance(str1, str2);
  return 1 - distance / maxLen;
}

/**
 * Find the best fuzzy match for a header against a list of patterns
 * Returns the best match with confidence score
 */
function checkExactMatch(header: string, pattern: string): FuzzyMatchResult | null {
  if (header === pattern) {
    return { pattern, score: 1.0, confidence: 100 };
  }
  return null;
}

function checkSubstringMatch(header: string, pattern: string): FuzzyMatchResult | null {
  if (header.includes(pattern) || pattern.includes(header)) {
    const lengthRatio = Math.min(pattern.length, header.length) / 
                        Math.max(pattern.length, header.length);
    const score = Math.max(lengthRatio, 0.85);
    const confidence = Math.round(score * 95);
    return { pattern, score, confidence };
  }
  return null;
}

function checkFuzzyMatch(header: string, pattern: string, minConfidence: number): FuzzyMatchResult | null {
  const similarity = calculateSimilarity(header, pattern);
  const confidence = Math.round(similarity * 85);
  
  if (similarity >= minConfidence / 100) {
    return { pattern, score: similarity, confidence };
  }
  return null;
}

export function findBestMatch(
  header: string,
  patterns: string[],
  minConfidence: number = 0.6
): FuzzyMatchResult | null {
  const normalizedHeader = normalizeHeader(header);
  let bestMatch: FuzzyMatchResult | null = null;

  for (const pattern of patterns) {
    const normalizedPattern = normalizeHeader(pattern);
    
    // Check for exact match first (highest confidence)
    const exactMatch = checkExactMatch(normalizedHeader, normalizedPattern);
    if (exactMatch) return { ...exactMatch, pattern };

    // Check for substring match (high confidence)
    const substringMatch = checkSubstringMatch(normalizedHeader, normalizedPattern);
    if (substringMatch) {
      if (!bestMatch || substringMatch.score > bestMatch.score) {
        bestMatch = { ...substringMatch, pattern };
      }
      continue;
    }

    // Fuzzy matching with Levenshtein distance
    const fuzzyMatch = checkFuzzyMatch(normalizedHeader, normalizedPattern, minConfidence);
    if (fuzzyMatch && (!bestMatch || fuzzyMatch.score > bestMatch.score)) {
      bestMatch = { ...fuzzyMatch, pattern };
    }
  }

  return bestMatch && bestMatch.confidence >= Math.round(minConfidence) ? bestMatch : null;
}

/**
 * Normalize header for consistent comparison
 * Handles common variations in CSV headers
 */
export function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .trim()
    .replace(/[_-]/g, ' ')      // Convert underscores and dashes to spaces
    .replace(/[^\w\s]/g, ' ')   // Replace special characters with spaces
    .replace(/\s+/g, ' ')       // Collapse multiple spaces
    .trim();
}

/**
 * Calculate confidence score based on multiple factors
 * Combines exact match, substring match, and fuzzy matching
 */
export function calculateConfidence(
  _header: string,
  _pattern: string,
  exactMatch: boolean = false,
  substringMatch: boolean = false,
  fuzzyScore: number = 0
): number {
  if (exactMatch) return 100;
  if (substringMatch) return Math.max(85, Math.round(fuzzyScore * 100));
  return Math.round(fuzzyScore * 80); // Lower confidence for pure fuzzy matches
}