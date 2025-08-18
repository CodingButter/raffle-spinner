import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HexColorPicker } from 'react-colorful';

interface ShadowControlsProps {
  topShadowOpacity: number;
  bottomShadowOpacity: number;
  shadowSize: number;
  shadowColor?: string;
  backgroundColor: string;
  activeColorPicker: string | null;
  onUpdateStyle: (updates: Record<string, unknown>) => void;
  setActiveColorPicker: (picker: string | null) => void;
}

export function ShadowControls({
  topShadowOpacity,
  bottomShadowOpacity,
  shadowSize,
  shadowColor,
  backgroundColor,
  activeColorPicker,
  onUpdateStyle,
  setActiveColorPicker,
}: ShadowControlsProps) {
  const effectiveShadowColor = shadowColor || backgroundColor || '#1a1a1a';

  return (
    <div className="pb-3 border-b space-y-4">
      <Label className="text-sm font-medium">Shadow Effects</Label>

      {/* Top Shadow Opacity */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Top Shadow</Label>
          <span className="text-xs font-mono">
            {Math.round((topShadowOpacity || 0.3) * 100)}%
          </span>
        </div>
        <Slider
          value={[(topShadowOpacity || 0.3) * 100]}
          onValueChange={([value]) => onUpdateStyle({ topShadowOpacity: value / 100 })}
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
            {Math.round((bottomShadowOpacity || 0.3) * 100)}%
          </span>
        </div>
        <Slider
          value={[(bottomShadowOpacity || 0.3) * 100]}
          onValueChange={([value]) => onUpdateStyle({ bottomShadowOpacity: value / 100 })}
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
          <span className="text-xs font-mono">{shadowSize || 30}%</span>
        </div>
        <Slider
          value={[shadowSize || 30]}
          onValueChange={([value]) => onUpdateStyle({ shadowSize: value })}
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
                style={{ backgroundColor: effectiveShadowColor }}
              />
              <span className="font-mono text-xs">{shadowColor || 'Auto'}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3">
            <HexColorPicker
              color={effectiveShadowColor}
              onChange={(newColor) => onUpdateStyle({ shadowColor: newColor })}
            />
            <Input
              value={shadowColor || ''}
              onChange={(e) => onUpdateStyle({ shadowColor: e.target.value || undefined })}
              className="mt-2"
              placeholder="Auto (uses panel color)"
            />
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={() => onUpdateStyle({ shadowColor: undefined })}
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