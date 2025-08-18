import React from 'react';
import { Slider } from '@/components/ui/slider';
import { BezierCurve } from './types';

interface ControlPointSlidersProps {
  value: BezierCurve;
  onChange: (curve: BezierCurve) => void;
}

export function ControlPointSliders({ value, onChange }: ControlPointSlidersProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Control Point 1</label>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs w-8">X1:</span>
            <Slider
              value={[value.x1]}
              onValueChange={([x1]) => onChange({ ...value, x1 })}
              min={0}
              max={1}
              step={0.01}
              className="flex-1"
            />
            <span className="text-xs w-10">{value.x1.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs w-8">Y1:</span>
            <Slider
              value={[value.y1]}
              onValueChange={([y1]) => onChange({ ...value, y1 })}
              min={0}
              max={1}
              step={0.01}
              className="flex-1"
            />
            <span className="text-xs w-10">{value.y1.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Control Point 2</label>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs w-8">X2:</span>
            <Slider
              value={[value.x2]}
              onValueChange={([x2]) => onChange({ ...value, x2 })}
              min={0}
              max={1}
              step={0.01}
              className="flex-1"
            />
            <span className="text-xs w-10">{value.x2.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs w-8">Y2:</span>
            <Slider
              value={[value.y2]}
              onValueChange={([y2]) => onChange({ ...value, y2 })}
              min={0}
              max={1}
              step={0.01}
              className="flex-1"
            />
            <span className="text-xs w-10">{value.y2.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
