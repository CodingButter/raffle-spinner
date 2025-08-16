/**
 * Theme Colors Component
 *
 * Purpose: Allows users to customize the overall application color palette
 * including primary, secondary, background, and other theme colors.
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Palette, RefreshCw } from 'lucide-react';
import type { ThemeColors as ThemeColorsType } from '@raffle-spinner/storage';
import { ColorButton } from './theme-colors/ColorButton';
import { ThemePresets } from './theme-colors/ThemePresets';
import { helpContent } from './theme-colors/presetThemes';

export function ThemeColors() {
  const { theme, updateColors, resetTheme } = useTheme();
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);

  const handleColorChange = (field: keyof ThemeColorsType, color: string) => {
    updateColors({ [field]: color });
  };

  const handlePresetSelect = (colors: ThemeColorsType) => {
    updateColors(colors);
  };

  const colorFields = [
    { field: 'primary', label: 'Primary', description: 'Main brand color' },
    { field: 'secondary', label: 'Secondary', description: 'Accent color' },
    { field: 'accent', label: 'Accent', description: 'Highlight color' },
    { field: 'background', label: 'Background', description: 'Main background' },
    { field: 'foreground', label: 'Foreground', description: 'Main text color' },
    { field: 'card', label: 'Card', description: 'Card background' },
    { field: 'cardForeground', label: 'Card Text', description: 'Card text color' },
    { field: 'winner', label: 'Winner', description: 'Winner highlight' },
    { field: 'winnerGlow', label: 'Winner Glow', description: 'Winner glow effect' },
  ] as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Theme Colors
          <InfoTooltip {...helpContent} />
        </CardTitle>
        <CardDescription>Customize the application color scheme</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-3">Preset Themes</h3>
          <ThemePresets onSelectPreset={handlePresetSelect} />
        </div>

        <div className="border-t pt-4">
          <h3 className="text-sm font-medium mb-3">Custom Colors</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {colorFields.map(({ field, label, description }) => (
              <ColorButton
                key={field}
                label={label}
                color={theme.colors[field]}
                field={field}
                description={description}
                activeColorPicker={activeColorPicker}
                onColorChange={handleColorChange}
                onPickerToggle={setActiveColorPicker}
              />
            ))}
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button variant="outline" onClick={resetTheme} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset to Default Colors
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}