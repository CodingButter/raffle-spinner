/**
 * Theme Default Values
 * 
 * Purpose: Provides default theme configurations that adapt to system preferences
 */

import type { ThemeColors, SpinnerStyle, BrandingSettings, ThemeSettings } from '@raffle-spinner/storage';

// Get system color scheme preference
export const getSystemColorScheme = () => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

// Default theme colors - Adapts to system preference
export const getDefaultColors = (isDark?: boolean): ThemeColors => {
  const dark = isDark ?? (getSystemColorScheme() === 'dark');
  
  return {
    primary: '#0b1e3a', // DrawDay Navy - Primary brand color
    secondary: '#e6b540', // DrawDay Gold - Brand accent
    accent: '#e6b540', // DrawDay Gold - Highlight
    background: dark ? '#0c0e11' : '#fdfeff', // Night for dark, White for light
    foreground: dark ? '#fdfeff' : '#161b21', // White text on dark, Rich Black on light
    card: dark ? '#161b21' : '#fdfeff', // Rich Black for dark, White for light
    cardForeground: dark ? '#fdfeff' : '#161b21', // White on dark, Rich Black on light
    winner: '#e6b540', // DrawDay Gold for winner highlight
    winnerGlow: '#e6b540', // DrawDay Gold glow
  };
};

export const getDefaultSpinnerStyle = (isDark?: boolean): SpinnerStyle => {
  const dark = isDark ?? (getSystemColorScheme() === 'dark');
  
  return {
    type: 'slotMachine',
    nameSize: 'large',
    ticketSize: 'extra-large',
    nameColor: dark ? '#fdfeff' : '#161b21', // White on dark, Rich Black on light
    ticketColor: '#e6b540', // DrawDay Gold - Ticket numbers
    backgroundColor: dark ? '#161b21' : '#fdfeff', // Rich Black for dark, White for light
    canvasBackground: 'transparent', // Always transparent for clean overlay
    topShadowOpacity: 0.3, // Top shadow opacity
    bottomShadowOpacity: 0.3, // Bottom shadow opacity
    shadowSize: 30, // Shadow size as percentage
    shadowColor: undefined, // Use panel background by default
    borderColor: '#e6b540', // DrawDay Gold - Borders
    highlightColor: '#e6b540', // DrawDay Gold - Highlights
    fontFamily: 'system-ui',
  };
};

export const DEFAULT_BRANDING: BrandingSettings = {
  logoPosition: 'center',
  showCompanyName: true,
};

export const getDefaultTheme = (isDark?: boolean): ThemeSettings => ({
  colorScheme: 'system',
  colors: getDefaultColors(isDark),
  spinnerStyle: getDefaultSpinnerStyle(isDark),
  branding: DEFAULT_BRANDING,
});