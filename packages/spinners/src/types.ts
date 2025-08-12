/**
 * Type definitions for spinner components
 *
 * These types are used across all spinner implementations
 * to ensure consistency and type safety.
 */

import { Participant, SpinnerSettings } from "@raffle-spinner/storage";

/**
 * Theme configuration for spinner components
 * Can be extended for specific spinner types
 */
export interface SpinnerTheme {
  /** Background color for spinner segments */
  backgroundColor?: string;
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
  nameSize?: "small" | "medium" | "large" | "extra-large";
  /** Font size for ticket numbers */
  ticketSize?: "small" | "medium" | "large" | "extra-large";
}

/**
 * Default theme values for spinners
 */
export const DEFAULT_SPINNER_THEME: SpinnerTheme = {
  backgroundColor: "#007bff",
  borderColor: "#dee2e6",
  highlightColor: "#ffd700",
  nameColor: "#ffffff",
  ticketColor: "#ffd700",
  fontFamily: "system-ui, sans-serif",
  nameSize: "medium",
  ticketSize: "large",
};

/**
 * Common props for all spinner components
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
