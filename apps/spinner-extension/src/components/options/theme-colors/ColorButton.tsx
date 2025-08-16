/**
 * Color Button Component
 * Interactive color picker button with popover
 */

import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { ThemeColors } from '@raffle-spinner/storage';

interface ColorButtonProps {
  label: string;
  color: string;
  field: keyof ThemeColors;
  description: string;
  activeColorPicker: string | null;
  onColorChange: (field: keyof ThemeColors, color: string) => void;
  onPickerToggle: (field: string | null) => void;
}

export function ColorButton({
  label,
  color,
  field,
  description,
  activeColorPicker,
  onColorChange,
  onPickerToggle,
}: ColorButtonProps) {
  return (
    <div className="space-y-1">
      <Label className="text-sm">{label}</Label>
      <p className="text-xs text-muted-foreground mb-2">{description}</p>
      <Popover
        open={activeColorPicker === field}
        onOpenChange={(open) => onPickerToggle(open ? field : null)}
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
            onChange={(newColor) => onColorChange(field, newColor)}
          />
          <Input
            value={color}
            onChange={(e) => onColorChange(field, e.target.value)}
            className="mt-2"
            placeholder="#000000"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}