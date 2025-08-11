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
  bannerImage?: string; // Base64 encoded image for this specific competition
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

// Spinner type options
export type SpinnerType = "slotMachine" | "wheel" | "cards";

// Theme customization
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  winner: string;
  winnerGlow: string;
}

export interface SpinnerStyle {
  type: SpinnerType;
  nameSize: "small" | "medium" | "large" | "extra-large";
  ticketSize: "small" | "medium" | "large" | "extra-large";
  nameColor: string;
  ticketColor: string;
  backgroundColor: string;
  borderColor: string;
  highlightColor: string;
  fontFamily?: string;
}

export interface BrandingSettings {
  logoImage?: string; // Base64 encoded logo
  logoPosition: "left" | "center" | "right";
  bannerImage?: string; // Base64 encoded default banner
  companyName?: string;
  showCompanyName: boolean;
}

export interface ThemeSettings {
  colors: ThemeColors;
  spinnerStyle: SpinnerStyle;
  branding: BrandingSettings;
  customCSS?: string; // Advanced users can add custom CSS
}

export interface StorageData {
  competitions: Competition[];
  settings: SpinnerSettings;
  columnMapping: ColumnMapping | null; // Keep for backwards compatibility
  savedMappings?: SavedMapping[]; // New: array of saved mappings
  defaultMappingId?: string; // New: ID of the default mapping
  theme?: ThemeSettings; // New: theme customization
}
