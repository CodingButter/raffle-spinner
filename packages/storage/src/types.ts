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
  firstName: string;
  lastName: string;
  ticketNumber: string;
}

export interface StorageData {
  competitions: Competition[];
  settings: SpinnerSettings;
  columnMapping: ColumnMapping | null;
}
