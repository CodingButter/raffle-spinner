/**
 * Shadow Controls Component
 * Manages shadow effects for the spinner
 */

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HexColorPicker } from 'react-colorful';
import type { SpinnerStyle } from '@raffle-spinner/storage';

interface ShadowControlsProps {
  theme: { spinnerStyle: SpinnerStyle };
  activeColorPicker: string | null;
  setActiveColorPicker: (value: string | null) => void;
  updateSpinnerStyle: (style: Partial<SpinnerStyle>) => void;
}

export function ShadowControls({
  theme,
  activeColorPicker,
  setActiveColorPicker,
  updateSpinnerStyle,
}: ShadowControlsProps) {
  return (
    <div className="pb-3 border-b space-y-4">
      <Label className="text-sm font-medium">Shadow Effects</Label>

      {/* Top Shadow Opacity */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Top Shadow</Label>
          <span className="text-xs font-mono">
            {Math.round((theme.spinnerStyle.topShadowOpacity || 0.3) * 100)}%
          </span>
        </div>
        <Slider
          value={[(theme.spinnerStyle.topShadowOpacity || 0.3) * 100]}
          onValueChange={([value]) =>
            updateSpinnerStyle({ topShadowOpacity: value / 100 })
          }
          min={0}
          max={100}
          step={5}
          className="w-full"
        />
      </div>

      {/* Bottom Shadow Opacity */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Bottom Shadow</Label>
          <span className="text-xs font-mono">
            {Math.round((theme.spinnerStyle.bottomShadowOpacity || 0.3) * 100)}%
          </span>
        </div>
        <Slider
          value={[(theme.spinnerStyle.bottomShadowOpacity || 0.3) * 100]}
          onValueChange={([value]) =>
            updateSpinnerStyle({ bottomShadowOpacity: value / 100 })
          }
          min={0}
          max={100}
          step={5}
          className="w-full"
        />
      </div>

      {/* Shadow Size */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Shadow Size</Label>
          <span className="text-xs font-mono">
            {theme.spinnerStyle.shadowSize || 30}%
          </span>
        </div>
        <Slider
          value={[theme.spinnerStyle.shadowSize || 30]}
          onValueChange={([value]) => updateSpinnerStyle({ shadowSize: value })}
          min={10}
          max={50}
          step={5}
          className="w-full"
        />
      </div>

      {/* Shadow Color */}
      <div className="flex items-center gap-2">
        <Label className="text-xs min-w-[80px]">Shadow Color</Label>
        <Popover
          open={activeColorPicker === 'shadowColor'}
          onOpenChange={(open) => setActiveColorPicker(open ? 'shadowColor' : null)}
        >
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1 justify-start gap-2">
              <div
                className="h-3 w-3 rounded border border-border"
                style={{
                  backgroundColor:
                    theme.spinnerStyle.shadowColor ||
                    theme.spinnerStyle.backgroundColor ||
                    '#1a1a1a',
                }}
              />
              <span className="font-mono text-xs">
                {theme.spinnerStyle.shadowColor || 'Auto'}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3">
            <HexColorPicker
              color={
                theme.spinnerStyle.shadowColor ||
                theme.spinnerStyle.backgroundColor ||
                '#1a1a1a'
              }
              onChange={(newColor) => updateSpinnerStyle({ shadowColor: newColor })}
            />
            <Input
              value={theme.spinnerStyle.shadowColor || ''}
              onChange={(e) =>
                updateSpinnerStyle({ shadowColor: e.target.value || undefined })
              }
              className="mt-2"
              placeholder="Auto (uses panel color)"
            />
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={() => updateSpinnerStyle({ shadowColor: undefined })}
            >
              Reset to Auto
            </Button>
          </PopoverContent>
        </Popover>
      </div>

      <p className="text-xs text-muted-foreground">
        Creates a fade effect at the top and bottom of the slot machine
      </p>
    </div>
  );
}