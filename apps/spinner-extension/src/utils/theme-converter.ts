/**
 * Theme Converter Utility
 * 
 * Purpose: Converts theme settings to SpinnerTheme format
 * Extracted from SidePanelWithPersistence.tsx to maintain file size limits
 * 
 * Architecture Decision:
 * - Centralized theme conversion logic
 * - Type-safe transformation
 * - Reusable across spinner components
 */

import type { SpinnerTheme } from '@raffle-spinner/spinners';
import type { ThemeSettings } from '@raffle-spinner/storage';

/**
 * Converts ThemeSettings to SpinnerTheme format
 * Maps context theme properties to spinner-specific theme structure
 */
export function convertToSpinnerTheme(theme: ThemeSettings): SpinnerTheme {
  return {
    nameColor: theme.spinnerStyle.nameColor,
    ticketColor: theme.spinnerStyle.ticketColor,
    backgroundColor: theme.spinnerStyle.backgroundColor,
    canvasBackground: 'transparent', // Always force transparent for overlay support
    borderColor: theme.spinnerStyle.borderColor,
    highlightColor: theme.spinnerStyle.highlightColor,
    nameSize: theme.spinnerStyle.nameSize,
    ticketSize: theme.spinnerStyle.ticketSize,
    fontFamily: theme.spinnerStyle.fontFamily,
    topShadowOpacity: theme.spinnerStyle.topShadowOpacity,
    bottomShadowOpacity: theme.spinnerStyle.bottomShadowOpacity,
    shadowSize: theme.spinnerStyle.shadowSize,
    shadowColor: theme.spinnerStyle.shadowColor,
  } as SpinnerTheme;
}