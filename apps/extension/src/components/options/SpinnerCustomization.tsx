/**
 * Spinner Customization Component
 *
 * Purpose: Allows users to customize the appearance of the spinner including
 * type selection, colors, font sizes, and styling options.
 */

import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/contexts/ThemeContext';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Palette, Type, Square, RefreshCw } from 'lucide-react';
import type { SpinnerType, SpinnerStyle } from '@raffle-spinner/storage';

export function SpinnerCustomization() {
  const { theme, updateSpinnerStyle, resetTheme } = useTheme();
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);

  const handleColorChange = (field: keyof SpinnerStyle, color: string) => {
    updateSpinnerStyle({ [field]: color });
  };

  const handleSizeChange = (field: 'nameSize' | 'ticketSize', size: string) => {
    updateSpinnerStyle({ [field]: size });
  };

  const handleTypeChange = (type: SpinnerType) => {
    updateSpinnerStyle({ type });
  };

  const handleFontChange = (font: string) => {
    updateSpinnerStyle({ fontFamily: font });
  };

  const ColorButton = ({
    label,
    color,
    field,
  }: {
    label: string;
    color: string;
    field: keyof SpinnerStyle;
  }) => (
    <div className="flex items-center gap-2">
      <Label className="min-w-[120px]">{label}</Label>
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
    spinnerType: {
      title: 'Spinner Type',
      description: 'Choose the visual style for your raffle spinner',
      details: {
        content:
          'Different spinner types provide unique visual experiences for your audience. Slot Machine offers a classic casino feel, Wheel provides a traditional spinning wheel, and Cards shows a shuffling card effect.',
        tips: [
          'Slot Machine works best for large audiences',
          'Wheel is great for smaller, intimate raffles',
        ],
      },
    },
    textSizes: {
      title: 'Text Sizes',
      description: 'Control the size of participant names and ticket numbers',
      details: {
        content:
          'Adjust text sizes to ensure visibility for your audience. Larger sizes work better for projection or streaming.',
      },
    },
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Spinner Customization
        </CardTitle>
        <CardDescription>Customize the appearance and style of your raffle spinner</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="type" className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="type">Type & Size</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="type" className="space-y-4">
            {/* Spinner Type Selection */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Spinner Type</Label>
                <InfoTooltip {...helpContent.spinnerType} iconSize="sm" />
              </div>
              <Select
                value={theme.spinnerStyle.type}
                onValueChange={(value) => handleTypeChange(value as SpinnerType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slotMachine">
                    <div className="flex items-center gap-2">
                      <Square className="h-4 w-4" />
                      Slot Machine
                    </div>
                  </SelectItem>
                  <SelectItem value="wheel" disabled>
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Spinning Wheel (Coming Soon)
                    </div>
                  </SelectItem>
                  <SelectItem value="cards" disabled>
                    <div className="flex items-center gap-2">
                      <Square className="h-4 w-4" />
                      Card Shuffle (Coming Soon)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Text Size Controls */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                <Label>Text Sizes</Label>
                <InfoTooltip {...helpContent.textSizes} iconSize="sm" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Name Size</Label>
                  <Select
                    value={theme.spinnerStyle.nameSize}
                    onValueChange={(value) => handleSizeChange('nameSize', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                      <SelectItem value="extra-large">Extra Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Ticket Size</Label>
                  <Select
                    value={theme.spinnerStyle.ticketSize}
                    onValueChange={(value) => handleSizeChange('ticketSize', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                      <SelectItem value="extra-large">Extra Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="colors" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Label>Color Scheme</Label>
              <InfoTooltip {...helpContent.colors} iconSize="sm" />
            </div>

            <div className="space-y-3">
              {/* Slot Machine Canvas Background */}
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

              {/* Panel and Text Colors */}
              <ColorButton
                label="Panel Color"
                color={theme.spinnerStyle.backgroundColor}
                field="backgroundColor"
              />
              <ColorButton
                label="Name Color"
                color={theme.spinnerStyle.nameColor}
                field="nameColor"
              />
              <ColorButton
                label="Ticket Color"
                color={theme.spinnerStyle.ticketColor}
                field="ticketColor"
              />
              <ColorButton
                label="Border"
                color={theme.spinnerStyle.borderColor}
                field="borderColor"
              />
              <ColorButton
                label="Highlight"
                color={theme.spinnerStyle.highlightColor}
                field="highlightColor"
              />
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Font Family</Label>
                <Select
                  value={theme.spinnerStyle.fontFamily || 'system-ui'}
                  onValueChange={handleFontChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system-ui">System Default</SelectItem>
                    <SelectItem value="'Arial', sans-serif">Arial</SelectItem>
                    <SelectItem value="'Times New Roman', serif">Times New Roman</SelectItem>
                    <SelectItem value="'Courier New', monospace">Courier New</SelectItem>
                    <SelectItem value="'Georgia', serif">Georgia</SelectItem>
                    <SelectItem value="'Verdana', sans-serif">Verdana</SelectItem>
                    <SelectItem value="'Comic Sans MS', cursive">Comic Sans MS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t">
                <Button variant="outline" onClick={resetTheme} className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset to Default Theme
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
