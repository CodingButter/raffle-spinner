import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RefreshCw } from 'lucide-react';

interface AdvancedTabProps {
  fontFamily: string;
  onFontChange: (font: string) => void;
  onResetTheme: () => void;
}

export function AdvancedTab({ fontFamily, onFontChange, onResetTheme }: AdvancedTabProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Font Family</Label>
        <Select value={fontFamily || 'system-ui'} onValueChange={onFontChange}>
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
        <Button variant="outline" onClick={onResetTheme} className="w-full">
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset to Default Theme
        </Button>
      </div>
    </div>
  );
}