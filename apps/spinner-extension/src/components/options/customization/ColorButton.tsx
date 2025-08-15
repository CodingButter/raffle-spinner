import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HexColorPicker } from 'react-colorful';

interface ColorButtonProps {
  label: string;
  color: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onColorChange: (color: string) => void;
}

export function ColorButton({
  label,
  color,
  isOpen,
  onOpenChange,
  onColorChange,
}: ColorButtonProps) {
  return (
    <div className="flex items-center gap-2">
      <Label className="min-w-[120px]">{label}</Label>
      <Popover open={isOpen} onOpenChange={onOpenChange}>
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
          <HexColorPicker color={color} onChange={onColorChange} />
          <Input
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            className="mt-2"
            placeholder="#000000"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}