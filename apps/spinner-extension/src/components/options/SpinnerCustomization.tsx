/**
 * Spinner Customization Component
 *
 * Purpose: Allows users to customize the appearance of the spinner including
 * type selection, colors, font sizes, and styling options.
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/contexts/ThemeContext';
import { Palette } from 'lucide-react';
import type { SpinnerType } from '@raffle-spinner/storage';

// Import sub-components
import { TypeAndSizeTab } from './customization/TypeAndSizeTab';
import { ColorsTab } from './customization/ColorsTab';
import { AdvancedTab } from './customization/AdvancedTab';

export function SpinnerCustomization() {
  const { theme, updateSpinnerStyle, resetTheme } = useTheme();
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);

  const handleSizeChange = (field: 'nameSize' | 'ticketSize', size: string) => {
    updateSpinnerStyle({ [field]: size });
  };

  const handleTypeChange = (type: SpinnerType) => {
    updateSpinnerStyle({ type });
  };

  const handleFontChange = (font: string) => {
    updateSpinnerStyle({ fontFamily: font });
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
            <TypeAndSizeTab
              spinnerType={theme.spinnerStyle.type}
              nameSize={theme.spinnerStyle.nameSize}
              ticketSize={theme.spinnerStyle.ticketSize}
              onTypeChange={handleTypeChange}
              onSizeChange={handleSizeChange}
            />
          </TabsContent>

          <TabsContent value="colors" className="space-y-4">
            <ColorsTab
              theme={theme}
              activeColorPicker={activeColorPicker}
              setActiveColorPicker={setActiveColorPicker}
              updateSpinnerStyle={updateSpinnerStyle}
            />
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <AdvancedTab
              fontFamily={theme.spinnerStyle.fontFamily || 'system-ui'}
              onFontChange={handleFontChange}
              onResetTheme={resetTheme}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}