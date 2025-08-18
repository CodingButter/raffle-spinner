/**
 * Theme utility functions for spinner components
 * 
 * @module ThemeUtils
 * @category Utilities
 */

export interface SpinnerTheme {
  backgroundColor?: string;
  borderColor?: string;
  highlightColor?: string;
  nameColor?: string;
  ticketColor?: string;
  fontFamily?: string;
  nameSize?: 'small' | 'medium' | 'large' | 'extra-large';
  ticketSize?: 'small' | 'medium' | 'large' | 'extra-large';
  topShadowOpacity?: number;
  bottomShadowOpacity?: number;
  shadowSize?: number;
  shadowColor?: string;
}

export interface InternalThemeSettings {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    winner: string;
    winnerGlow: string;
  };
  spinnerStyle: {
    type: 'slotMachine';
    backgroundColor: string;
    canvasBackground: string;
    borderColor: string;
    highlightColor: string;
    nameColor: string;
    ticketColor: string;
    fontFamily: string;
    nameSize: 'small' | 'medium' | 'large' | 'extra-large';
    ticketSize: 'small' | 'medium' | 'large' | 'extra-large';
    topShadowOpacity: number;
    bottomShadowOpacity: number;
    shadowSize: number;
    shadowColor?: string;
  };
  branding: {
    logoPosition: 'center';
    showCompanyName: boolean;
  };
}

/**
 * Adjusts the brightness of a hex color
 * @param color - Hex color string (e.g., '#ffffff')
 * @param percent - Amount to adjust (-255 to 255)
 * @returns Adjusted hex color string
 */
export function adjustBrightness(color: string, percent: number): string {
  // Handle hex colors
  if (color.startsWith('#')) {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, ((num >> 16) & 255) + percent));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 255) + percent));
    const b = Math.max(0, Math.min(255, (num & 255) + percent));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }
  // For non-hex colors, return unchanged
  return color;
}

/**
 * Converts a hex color to RGB object
 * @param hex - Hex color string (e.g., '#ffffff')
 * @returns RGB object with r, g, b properties
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 26, g: 26, b: 26 }; // Fallback to #1a1a1a
}

/**
 * Converts the public SpinnerTheme interface to the internal ThemeSettings format
 * required by the drawing functions. This maintains backward compatibility while
 * allowing for a cleaner public API.
 *
 * @param theme - Public theme configuration
 * @returns Internal theme settings with all required properties
 */
export function convertTheme(theme: SpinnerTheme): InternalThemeSettings {
  return {
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
}