/**
 * Theme Presets Component
 * Quick selection of predefined theme color schemes
 */

import { Button } from '@/components/ui/button';
import type { ThemeColors } from '@raffle-spinner/storage';
import { presetThemes } from './presetThemes';

interface ThemePresetsProps {
  onSelectPreset: (colors: ThemeColors) => void;
}

export function ThemePresets({ onSelectPreset }: ThemePresetsProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {presetThemes.map((preset) => (
        <Button
          key={preset.name}
          variant="outline"
          className="justify-start gap-2"
          onClick={() => onSelectPreset(preset.colors)}
        >
          <div className="flex gap-1">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: preset.colors.primary }}
            />
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: preset.colors.secondary }}
            />
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: preset.colors.accent }}
            />
          </div>
          <span className="text-xs">{preset.name}</span>
        </Button>
      ))}
    </div>
  );
}