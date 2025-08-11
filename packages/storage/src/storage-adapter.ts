/**
 * Storage Adapter Interface
 *
 * Purpose: Abstract interface defining storage operations for competitions,
 * settings, and column mappings with async persistence methods.
 *
 * SRS Reference:
 * - Data Layer: Storage abstraction layer architecture
 * - FR-1.6: Competition Management (persistence operations)
 * - FR-1.7: Spinner Physics Configuration (settings persistence)
 * - FR-1.4: Column Mapping Interface (mapping persistence)
 */

import { Competition, SpinnerSettings, ColumnMapping } from "./types";

export interface StorageAdapter {
  getCompetitions(): Promise<Competition[]>;
  getCompetition(id: string): Promise<Competition | null>;
  saveCompetition(competition: Competition): Promise<void>;
  deleteCompetition(id: string): Promise<void>;

  getSettings(): Promise<SpinnerSettings>;
  saveSettings(settings: SpinnerSettings): Promise<void>;

  getColumnMapping(): Promise<ColumnMapping | null>;
  saveColumnMapping(mapping: ColumnMapping): Promise<void>;

  clear(): Promise<void>;
}
