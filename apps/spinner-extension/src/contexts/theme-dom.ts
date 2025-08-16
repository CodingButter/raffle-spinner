/**
 * Theme DOM Utilities
 * 
 * Purpose: Handles applying theme settings to the DOM via CSS variables
 */

import type { ThemeSettings } from '@raffle-spinner/storage';

export const applyThemeToDOM = (theme: ThemeSettings) => {
  const root = document.documentElement;

  // Apply color variables
  root.style.setProperty('--theme-primary', theme.colors.primary);
  root.style.setProperty('--theme-secondary', theme.colors.secondary);
  root.style.setProperty('--theme-accent', theme.colors.accent);
  root.style.setProperty('--theme-background', theme.colors.background);
  root.style.setProperty('--theme-foreground', theme.colors.foreground);
  root.style.setProperty('--theme-card', theme.colors.card);
  root.style.setProperty('--theme-card-foreground', theme.colors.cardForeground);
  root.style.setProperty('--theme-winner', theme.colors.winner);
  root.style.setProperty('--theme-winner-glow', theme.colors.winnerGlow);

  // Apply spinner style variables
  root.style.setProperty('--spinner-name-color', theme.spinnerStyle.nameColor);
  root.style.setProperty('--spinner-ticket-color', theme.spinnerStyle.ticketColor);
  root.style.setProperty('--spinner-bg-color', theme.spinnerStyle.backgroundColor);
  root.style.setProperty('--spinner-border-color', theme.spinnerStyle.borderColor);
  root.style.setProperty('--spinner-highlight-color', theme.spinnerStyle.highlightColor);

  // Apply font sizes
  const nameSizes: Record<string, string> = {
    small: '14px',
    medium: '16px',
    large: '20px',
    'extra-large': '24px',
  };
  const ticketSizes: Record<string, string> = {
    small: '18px',
    medium: '24px',
    large: '32px',
    'extra-large': '40px',
  };

  root.style.setProperty('--spinner-name-size', nameSizes[theme.spinnerStyle.nameSize]);
  root.style.setProperty('--spinner-ticket-size', ticketSizes[theme.spinnerStyle.ticketSize]);

  if (theme.spinnerStyle.fontFamily) {
    root.style.setProperty('--spinner-font-family', theme.spinnerStyle.fontFamily);
  }

  // Apply custom CSS if provided
  if (theme.customCSS) {
    let styleElement = document.getElementById('custom-theme-styles');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'custom-theme-styles';
      document.head.appendChild(styleElement);
    }
    styleElement.textContent = theme.customCSS;
  }
};