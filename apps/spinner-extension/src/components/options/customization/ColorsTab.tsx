import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { HexColorPicker } from 'react-colorful';
import { ColorButton } from './ColorButton';
import { ShadowControls } from './ShadowControls';
import type { SpinnerStyle } from '@raffle-spinner/storage';

interface ColorsTabProps {
  theme: {
    spinnerStyle: SpinnerStyle;
  };
  activeColorPicker: string | null;
  setActiveColorPicker: (picker: string | null) => void;
  updateSpinnerStyle: (updates: Partial<SpinnerStyle>) => void;
}

const helpContent = {
  colors: {
    title: 'Color Customization',
    description: 'Customize colors to match your brand or event theme',
    details: {
      content:
        'Click any color button to open a color picker. You can enter hex codes directly or use the visual picker.',
      examples: ['#FF0000 - Red', '#00FF00 - Green', '#0000FF - Blue'],
    },
  },
};

export function ColorsTab({
  theme,
  activeColorPicker,
  setActiveColorPicker,
  updateSpinnerStyle,
}: ColorsTabProps) {
  const handleColorChange = (field: keyof SpinnerStyle, color: string) => {
    updateSpinnerStyle({ [field]: color });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Label>Color Scheme</Label>
        <InfoTooltip {...helpContent.colors} iconSize="sm" />
      </div>

      <div className="space-y-3">
        {/* Canvas Background */}
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

        {/* Shadow Controls */}
        <ShadowControls
          topShadowOpacity={theme.spinnerStyle.topShadowOpacity || 0.3}
          bottomShadowOpacity={theme.spinnerStyle.bottomShadowOpacity || 0.3}
          shadowSize={theme.spinnerStyle.shadowSize || 30}
          shadowColor={theme.spinnerStyle.shadowColor}
          backgroundColor={theme.spinnerStyle.backgroundColor}
          activeColorPicker={activeColorPicker}
          onUpdateStyle={updateSpinnerStyle}
          setActiveColorPicker={setActiveColorPicker}
        />

        {/* Panel and Text Colors */}
        <ColorButton
          label="Panel Color"
          color={theme.spinnerStyle.backgroundColor}
          field="backgroundColor"
          isOpen={activeColorPicker === 'backgroundColor'}
          onOpenChange={(open) => setActiveColorPicker(open ? 'backgroundColor' : null)}
          onColorChange={(color) => handleColorChange('backgroundColor', color)}
        />
        <ColorButton
          label="Name Color"
          color={theme.spinnerStyle.nameColor}
          field="nameColor"
          isOpen={activeColorPicker === 'nameColor'}
          onOpenChange={(open) => setActiveColorPicker(open ? 'nameColor' : null)}
          onColorChange={(color) => handleColorChange('nameColor', color)}
        />
        <ColorButton
          label="Ticket Color"
          color={theme.spinnerStyle.ticketColor}
          field="ticketColor"
          isOpen={activeColorPicker === 'ticketColor'}
          onOpenChange={(open) => setActiveColorPicker(open ? 'ticketColor' : null)}
          onColorChange={(color) => handleColorChange('ticketColor', color)}
        />
        <ColorButton
          label="Border"
          color={theme.spinnerStyle.borderColor}
          field="borderColor"
          isOpen={activeColorPicker === 'borderColor'}
          onOpenChange={(open) => setActiveColorPicker(open ? 'borderColor' : null)}
          onColorChange={(color) => handleColorChange('borderColor', color)}
        />
        <ColorButton
          label="Highlight"
          color={theme.spinnerStyle.highlightColor}
          field="highlightColor"
          isOpen={activeColorPicker === 'highlightColor'}
          onOpenChange={(open) => setActiveColorPicker(open ? 'highlightColor' : null)}
          onColorChange={(color) => handleColorChange('highlightColor', color)}
        />
      </div>
    </div>
  );
}