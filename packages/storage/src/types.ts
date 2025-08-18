/**
 * Storage Types
 *
 * Purpose: Re-export type definitions from the centralized types package
 * to maintain backwards compatibility and provide storage-specific exports.
 *
 * SRS Reference:
 * - Data Layer: Core data model definitions
 * - FR-1.6: Competition Management (Competition, Participant types)
 * - FR-1.7: Spinner Physics Configuration (SpinnerSettings type)
 * - FR-1.4: Column Mapping Interface (ColumnMapping type)
 */

// Re-export all types from the shared types package
export type {
  // Core Domain Types
  Participant,
  Competition,

  // Configuration Types
  SpinnerSettings,
  SpinnerSettings as Settings, // Alias for backward compatibility
  ColumnMapping,
  SavedMapping,

  // Theme & Styling Types
  SpinnerType,
  TextSize,
  LogoPosition,
  ThemeColors,
  SpinnerStyle,
  BrandingSettings,
  ThemeSettings,
  ColorScheme,

  // Session Types
  SessionWinner,
  SpinnerSession,

  // Storage Types
  StorageData,

  // Subscription Types
  SubscriptionTier,
  SubscriptionLimits,
  UserSubscription,

  // Utility Types
  DeepPartial,
  ArrayElement,
  RequireKeys,
  OptionalKeys,
} from '@drawday/types';
