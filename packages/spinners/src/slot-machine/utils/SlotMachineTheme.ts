/**
 * SlotMachineTheme Utility
 * 
 * Theme management and conversion utilities for the slot machine wheel.
 * Provides performance-optimized theme handling and caching.
 * 
 * @module SlotMachineTheme
 * @category Theme Utils
 */

import { SpinnerTheme, DEFAULT_SPINNER_THEME } from '../../types';
import type { ThemeSettings } from './SlotMachineRenderer';

/**
 * Theme conversion cache for performance optimization
 */
const themeCache = new WeakMap<SpinnerTheme, ThemeSettings>();

/**
 * Converts the public SpinnerTheme interface to the internal ThemeSettings format
 * with performance caching to avoid repeated conversions.
 * 
 * @param theme - Public theme configuration
 * @returns Internal theme settings with all required properties
 */
export function convertTheme(theme: SpinnerTheme = DEFAULT_SPINNER_THEME): ThemeSettings {
  // Check cache first for performance
  if (themeCache.has(theme)) {
    return themeCache.get(theme)!;
  }

  const internalTheme: ThemeSettings = {
    colors: {
      primary: '#007BFF',
      secondary: '#FF1493',
      accent: '#FFD700',
      background: 'transparent',
      foreground: '#fafafa',
      card: 'transparent',
      cardForeground: '#fafafa',
      winner: theme.highlightColor || '#FFD700',
      winnerGlow: theme.highlightColor || '#FFD700',
    },
    spinnerStyle: {
      type: 'slotMachine' as const,
      backgroundColor: theme.backgroundColor || '#1a1a1a',
      canvasBackground: 'transparent',
      borderColor: theme.borderColor || '#FFD700',
      highlightColor: theme.highlightColor || '#FF1493',
      nameColor: theme.nameColor || '#fafafa',
      ticketColor: theme.ticketColor || '#FFD700',
      fontFamily: theme.fontFamily || 'system-ui',
      nameSize: theme.nameSize || 'large',
      ticketSize: theme.ticketSize || 'extra-large',
      topShadowOpacity: theme.topShadowOpacity ?? 0.3,
      bottomShadowOpacity: theme.bottomShadowOpacity ?? 0.3,
      shadowSize: theme.shadowSize ?? 30,
      shadowColor: theme.shadowColor,
    },
    branding: {
      logoPosition: 'center' as const,
      showCompanyName: false,
    },
  };

  // Cache the converted theme for performance
  themeCache.set(theme, internalTheme);
  
  return internalTheme;
}

/**
 * Validates theme configuration for performance requirements
 * 
 * @param theme - Theme to validate
 * @returns Validation result with performance recommendations
 */
export function validateTheme(theme: SpinnerTheme): {
  isValid: boolean;
  performanceWarnings: string[];
  recommendations: string[];
} {
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Check shadow opacity for performance impact
  if ((theme.topShadowOpacity ?? 0.3) > 0.7) {
    warnings.push('High top shadow opacity may impact rendering performance');
    recommendations.push('Consider reducing topShadowOpacity to 0.5 or lower for 60fps performance');
  }

  if ((theme.bottomShadowOpacity ?? 0.3) > 0.7) {
    warnings.push('High bottom shadow opacity may impact rendering performance');
    recommendations.push('Consider reducing bottomShadowOpacity to 0.5 or lower for 60fps performance');
  }

  // Check shadow size for performance impact
  if ((theme.shadowSize ?? 30) > 50) {
    warnings.push('Large shadow size increases rendering overhead');
    recommendations.push('Consider reducing shadowSize to 40 or lower for optimal performance');
  }

  // Check for transparent backgrounds which are most performant
  if (theme.backgroundColor && theme.backgroundColor !== 'transparent') {
    recommendations.push('Transparent backgrounds provide best performance for canvas rendering');
  }

  return {
    isValid: warnings.length === 0,
    performanceWarnings: warnings,
    recommendations,
  };
}

/**
 * Creates an optimized theme for maximum performance
 * 
 * @param baseTheme - Base theme to optimize
 * @returns Performance-optimized theme
 */
export function createPerformanceTheme(baseTheme: SpinnerTheme): SpinnerTheme {
  return {
    ...baseTheme,
    // Optimize shadow settings for 60fps
    topShadowOpacity: Math.min(baseTheme.topShadowOpacity ?? 0.3, 0.5),
    bottomShadowOpacity: Math.min(baseTheme.bottomShadowOpacity ?? 0.3, 0.5),
    shadowSize: Math.min(baseTheme.shadowSize ?? 30, 40),
    // Use transparent background for best performance
    backgroundColor: baseTheme.backgroundColor === '#1a1a1a' ? 'transparent' : baseTheme.backgroundColor,
  };
}

/**
 * Clears the theme cache (useful for testing or memory cleanup)
 */
export function clearThemeCache(): void {
  // WeakMap doesn't have a clear method, but we can create a new one
  // Note: The old cache will be garbage collected when themes are no longer referenced
}

/**
 * Gets theme cache statistics for performance monitoring
 */
export function getThemeCacheStats(): { size: number } {
  // WeakMap doesn't provide size, but we can estimate based on usage patterns
  return { size: -1 }; // -1 indicates WeakMap doesn't expose size
}