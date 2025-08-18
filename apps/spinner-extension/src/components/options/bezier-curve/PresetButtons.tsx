import { Button } from '@/components/ui/button';
import { BezierCurve } from './types';
import { PRESETS } from './constants';

interface PresetButtonsProps {
  value: BezierCurve;
  onChange: (curve: BezierCurve) => void;
}

export function PresetButtons({ value, onChange }: PresetButtonsProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Presets</label>
      <div className="grid grid-cols-3 gap-2">
        {PRESETS.map((preset) => (
          <Button
            key={preset.name}
            variant={JSON.stringify(value) === JSON.stringify(preset.curve) ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange(preset.curve)}
            title={preset.description}
          >
            {preset.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
