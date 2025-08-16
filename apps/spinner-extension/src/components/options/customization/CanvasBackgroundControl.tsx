/**
 * Canvas Background Control Component
 * Manages canvas background color settings
 */

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HexColorPicker } from 'react-colorful';
import type { SpinnerStyle, ThemeSettings } from '@raffle-spinner/storage';

interface CanvasBackgroundControlProps {
  theme: ThemeSettings;
  activeColorPicker: string | null;
  setActiveColorPicker: (value: string | null) => void;
  updateSpinnerStyle: (style: Partial<SpinnerStyle>) => void;
}

export function CanvasBackgroundControl({
  theme,
  activeColorPicker,
  setActiveColorPicker,
  updateSpinnerStyle,
}: CanvasBackgroundControlProps) {
  return (
    <div className="pb-3 border-b">
      <div className="flex items-center gap-2">
        <Label className="min-w-[120px]">Canvas Background</Label>
        <Popover
          open={activeColorPicker === 'canvasBackground'}
          onOpenChange={(open) => setActiveColorPicker(open ? 'canvasBackground' : null)}
        >
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start gap-2">
              <div
                className="h-4 w-4 rounded border border-border"
                style={{
                  backgroundColor: theme.spinnerStyle.canvasBackground || '#09090b',
                }}
              />
              <span className="font-mono text-xs">
                {theme.spinnerStyle.canvasBackground || '#09090b'}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3">
            <HexColorPicker
              color={theme.spinnerStyle.canvasBackground || '#09090b'}
              onChange={(newColor) => updateSpinnerStyle({ canvasBackground: newColor })}
            />
            <Input
              value={theme.spinnerStyle.canvasBackground || '#09090b'}
              onChange={(e) => updateSpinnerStyle({ canvasBackground: e.target.value })}
              className="mt-2"
              placeholder="#000000"
            />
          </PopoverContent>
        </Popover>
      </div>
      <p className="text-xs text-muted-foreground mt-1 ml-[128px]">
        Slot machine canvas background color
      </p>
    </div>
  );
}
