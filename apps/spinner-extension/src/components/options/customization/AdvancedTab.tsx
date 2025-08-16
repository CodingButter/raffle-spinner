/**
 * Advanced Tab Component
 * Manages advanced settings like font family
 */

import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RefreshCw } from 'lucide-react';
import type { ThemeSettings } from '@raffle-spinner/storage';

interface AdvancedTabProps {
  theme: ThemeSettings;
  handleFontChange: (font: string) => void;
  resetTheme: () => void;
}

export function AdvancedTab({ theme, handleFontChange, resetTheme }: AdvancedTabProps) {
  return (
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
  );
}
