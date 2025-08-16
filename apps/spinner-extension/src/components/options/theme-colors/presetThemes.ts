/**
 * Preset Theme Configurations
 */

import type { ThemeColors } from '@raffle-spinner/storage';

interface PresetTheme {
  name: string;
  colors: ThemeColors;
}

export const presetThemes: PresetTheme[] = [
  {
    name: 'Default',
    colors: {
      primary: '#007BFF',
      secondary: '#FF1493',
      accent: '#FFD700',
      background: '#09090b',
      foreground: '#fafafa',
      card: '#09090b',
      cardForeground: '#fafafa',
      winner: '#FFD700',
      winnerGlow: '#FFD700',
    },
  },
  {
    name: 'Dark Neon',
    colors: {
      primary: '#00FFFF',
      secondary: '#FF00FF',
      accent: '#00FF00',
      background: '#000000',
      foreground: '#FFFFFF',
      card: '#1a1a1a',
      cardForeground: '#FFFFFF',
      winner: '#FFD700',
      winnerGlow: '#FFA500',
    },
  },
  {
    name: 'Pastel',
    colors: {
      primary: '#FFB6C1',
      secondary: '#87CEEB',
      accent: '#DDA0DD',
      background: '#FFF0F5',
      foreground: '#4B0082',
      card: '#FFFFFF',
      cardForeground: '#4B0082',
      winner: '#FF69B4',
      winnerGlow: '#FFB6C1',
    },
  },
  {
    name: 'Professional',
    colors: {
      primary: '#2C3E50',
      secondary: '#34495E',
      accent: '#3498DB',
      background: '#ECF0F1',
      foreground: '#2C3E50',
      card: '#FFFFFF',
      cardForeground: '#2C3E50',
      winner: '#27AE60',
      winnerGlow: '#2ECC71',
    },
  },
];

export const helpContent = {
  title: 'Theme Colors',
  description: 'Customize the overall color scheme of the application',
  details: {
    content:
      'These colors affect the entire application interface including buttons, backgrounds, and UI elements. Changes are applied instantly to both the options page and side panel.',
    tips: [
      'Use consistent colors for a professional look',
      'Ensure good contrast for readability',
      'Test colors in both light and dark environments',
    ],
  },
};