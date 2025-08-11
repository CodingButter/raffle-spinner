/**
 * Theme Colors Component
 *
 * Purpose: Allows users to customize the overall application color palette
 * including primary, secondary, background, and other theme colors.
 */

import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useTheme } from '@/contexts/ThemeContext';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Palette, RefreshCw } from 'lucide-react';
import type { ThemeColors as ThemeColorsType } from '@raffle-spinner/storage';

export function ThemeColors() {
  const { theme, updateColors, resetTheme } = useTheme();
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);

  const handleColorChange = (field: keyof ThemeColorsType, color: string) => {
    updateColors({ [field]: color });
  };

  const ColorButton = ({
    label,
    color,
    field,
    description,
  }: {
    label: string;
    color: string;
    field: keyof ThemeColorsType;
    description: string;
  }) => (
    <div className="space-y-1">
      <Label className="text-sm">{label}</Label>
      <p className="text-xs text-muted-foreground mb-2">{description}</p>
      <Popover
        open={activeColorPicker === field}
        onOpenChange={(open) => setActiveColorPicker(open ? (field as string) : null)}
      >
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start gap-2">
            <div
              className="h-4 w-4 rounded border border-border"
              style={{ backgroundColor: color }}
            />
            <span className="font-mono text-xs">{color}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3">
          <HexColorPicker
            color={color}
            onChange={(newColor) => handleColorChange(field, newColor)}
          />
          <Input
            value={color}
            onChange={(e) => handleColorChange(field, e.target.value)}
            className="mt-2"
            placeholder="#000000"
          />
        </PopoverContent>
      </Popover>
    </div>
  );

  const helpContent = {
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

  const presetThemes = [
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
      name: 'Corporate Blue',
      colors: {
        primary: '#1e40af',
        secondary: '#3b82f6',
        accent: '#60a5fa',
        background: '#0f172a',
        foreground: '#f8fafc',
        card: '#1e293b',
        cardForeground: '#f8fafc',
        winner: '#fbbf24',
        winnerGlow: '#f59e0b',
      },
    },
    {
      name: 'Emerald',
      colors: {
        primary: '#10b981',
        secondary: '#34d399',
        accent: '#6ee7b7',
        background: '#022c22',
        foreground: '#f0fdf4',
        card: '#064e3b',
        cardForeground: '#f0fdf4',
        winner: '#fbbf24',
        winnerGlow: '#f59e0b',
      },
    },
    {
      name: 'Purple Night',
      colors: {
        primary: '#9333ea',
        secondary: '#a855f7',
        accent: '#c084fc',
        background: '#1e1b4b',
        foreground: '#faf5ff',
        card: '#312e81',
        cardForeground: '#faf5ff',
        winner: '#facc15',
        winnerGlow: '#eab308',
      },
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Theme Colors
          <InfoTooltip {...helpContent} />
        </CardTitle>
        <CardDescription>Customize the application color palette</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preset Themes */}
        <div className="space-y-2">
          <Label>Preset Themes</Label>
          <div className="grid grid-cols-2 gap-2">
            {presetThemes.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                className="justify-start"
                onClick={() => updateColors(preset.colors)}
              >
                <div className="flex gap-1 mr-2">
                  <div
                    className="h-3 w-3 rounded-full border"
                    style={{ backgroundColor: preset.colors.primary }}
                  />
                  <div
                    className="h-3 w-3 rounded-full border"
                    style={{ backgroundColor: preset.colors.secondary }}
                  />
                  <div
                    className="h-3 w-3 rounded-full border"
                    style={{ backgroundColor: preset.colors.accent }}
                  />
                </div>
                {preset.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Colors */}
        <div className="grid grid-cols-2 gap-4">
          <ColorButton
            label="Primary"
            color={theme.colors.primary}
            field="primary"
            description="Main brand color for buttons and actions"
          />
          <ColorButton
            label="Secondary"
            color={theme.colors.secondary}
            field="secondary"
            description="Supporting color for accents"
          />
          <ColorButton
            label="Accent"
            color={theme.colors.accent}
            field="accent"
            description="Highlight color for special elements"
          />
          <ColorButton
            label="Background"
            color={theme.colors.background}
            field="background"
            description="Main background color"
          />
          <ColorButton
            label="Foreground"
            color={theme.colors.foreground}
            field="foreground"
            description="Main text color"
          />
          <ColorButton
            label="Card"
            color={theme.colors.card}
            field="card"
            description="Card background color"
          />
          <ColorButton
            label="Card Text"
            color={theme.colors.cardForeground}
            field="cardForeground"
            description="Text color on cards"
          />
          <ColorButton
            label="Winner"
            color={theme.colors.winner}
            field="winner"
            description="Winner highlight color"
          />
          <ColorButton
            label="Winner Glow"
            color={theme.colors.winnerGlow}
            field="winnerGlow"
            description="Winner glow effect color"
          />
        </div>

        {/* Reset Button */}
        <div className="pt-4 border-t">
          <Button variant="outline" onClick={resetTheme} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset All Theme Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
