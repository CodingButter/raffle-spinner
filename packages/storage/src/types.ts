/**
 * Storage Types
 *
 * Purpose: Type definitions for data models used throughout the application
 * including participants, competitions, settings, and storage data structures.
 *
 * SRS Reference:
 * - Data Layer: Core data model definitions
 * - FR-1.6: Competition Management (Competition, Participant types)
 * - FR-1.7: Spinner Physics Configuration (SpinnerSettings type)
 * - FR-1.4: Column Mapping Interface (ColumnMapping type)
 */

export interface Participant {
  firstName: string;
  lastName: string;
  ticketNumber: string;
}

export interface Competition {
  id: string;
  name: string;
  participants: Participant[];
  createdAt: number;
  updatedAt: number;
}

export interface SpinnerSettings {
  minSpinDuration: number; // in seconds
  decelerationRate: "slow" | "medium" | "fast";
}

export interface ColumnMapping {
  firstName?: string;
  lastName?: string;
  fullName?: string; // Single column containing both first and last name
  ticketNumber: string;
}

export interface SavedMapping {
  id: string;
  name: string;
  mapping: ColumnMapping;
  createdAt: number;
  updatedAt: number;
  usageCount: number; // Track how often this mapping is used
  isDefault?: boolean; // Mark one mapping as default
}

export interface StorageData {
  competitions: Competition[];
  settings: SpinnerSettings;
  columnMapping: ColumnMapping | null; // Keep for backwards compatibility
  savedMappings?: SavedMapping[]; // New: array of saved mappings
  defaultMappingId?: string; // New: ID of the default mapping
}
