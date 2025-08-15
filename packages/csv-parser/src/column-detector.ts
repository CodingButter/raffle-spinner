/**
 * Intelligent Column Mapper (Legacy Support)
 *
 * Purpose: Backward compatible wrapper around enhanced column detection.
 * Maintains original API while providing enhanced fuzzy matching capabilities.
 *
 * SRS Reference:
 * - FR-1.4: Column Mapping Interface (intelligent column detection)
 * - FR-1.2: CSV Parser Integration (header analysis)
 */

import { ColumnMapper, ColumnDetectionResult } from './types';
import { EnhancedColumnMapper } from './enhanced-column-detector';

/**
 * Legacy IntelligentColumnMapper
 * Provides backward compatibility for existing code
 */
export class IntelligentColumnMapper implements ColumnMapper {
  private enhancedMapper = new EnhancedColumnMapper();

  detectHeaders(headers: string[]): ColumnDetectionResult {
    return this.enhancedMapper.detectHeaders(headers);
  }
}

/**
 * Export enhanced mapper as the primary implementation
 */
export { EnhancedColumnMapper };
