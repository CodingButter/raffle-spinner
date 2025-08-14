/**
 * Type definitions for spinner components
 *
 * Central type definitions for all spinner implementations.
 * Provides consistent interfaces for themes, props, and configuration.
 *
 * @module types
 * @category Types
 */

import { Participant, SpinnerSettings } from '@raffle-spinner/storage';

/**
 * Theme configuration for spinner components.
 *
 * Provides comprehensive styling options including colors, typography,
 * and visual effects like shadows. All properties are optional with
 * sensible defaults.
 *
 * @interface SpinnerTheme
 */
export interface SpinnerTheme {
  /** Background color for spinner segments/panels */
  backgroundColor?: string;
  /** Canvas background color (slot machine background) */
  canvasBackground?: string;
  /** Border color for segment edges */
  borderColor?: string;
  /** Highlight color for visual effects */
  highlightColor?: string;
  /** Text color for participant names */
  nameColor?: string;
  /** Text color for ticket numbers */
  ticketColor?: string;
  /** Font family for all text */
  fontFamily?: string;
  /** Font size for names */
  nameSize?: 'small' | 'medium' | 'large' | 'extra-large';
  /** Font size for ticket numbers */
  ticketSize?: 'small' | 'medium' | 'large' | 'extra-large';
  /** Top shadow opacity (0-1) */
  topShadowOpacity?: number;
  /** Bottom shadow opacity (0-1) */
  bottomShadowOpacity?: number;
  /** Shadow size as percentage of viewport (0-50) */
  shadowSize?: number;
  /** Shadow gradient color (defaults to panel background) */
  shadowColor?: string;
}

/**
 * Default theme values for spinners
 */
export const DEFAULT_SPINNER_THEME: SpinnerTheme = {
  backgroundColor: '#1e1f23', // Raisin black - Panel background
  canvasBackground: '#0c0e11', // Night - Canvas background
  borderColor: '#e6b540', // DrawDay Gold - Borders
  highlightColor: '#e6b540', // DrawDay Gold - Highlights
  nameColor: '#fdfeff', // White - Names
  ticketColor: '#e6b540', // DrawDay Gold - Ticket numbers
  fontFamily: 'system-ui, sans-serif',
  nameSize: 'large',
  ticketSize: 'extra-large',
  topShadowOpacity: 0.3,
  bottomShadowOpacity: 0.3,
  shadowSize: 30,
  shadowColor: undefined, // Uses backgroundColor by default
};

/**
 * Base properties shared by all spinner component implementations.
 *
 * Defines the core interface that all spinner variants must support,
 * ensuring consistent behavior across different spinner types.
 *
 * @interface BaseSpinnerProps
 */
export interface BaseSpinnerProps {
  /** List of participants in the raffle */
  participants: Participant[];
  /** Target ticket number to land on */
  targetTicketNumber?: string;
  /** Spinner animation settings */
  settings: SpinnerSettings;
  /** Whether the spinner is currently spinning */
  isSpinning: boolean;
  /** Callback when spin completes */
  onSpinComplete: (winner: Participant) => void;
  /** Callback for errors */
  onError?: (error: string) => void;
  /** Optional theme configuration */
  theme?: SpinnerTheme;
  /** Optional CSS class name */
  className?: string;
}
