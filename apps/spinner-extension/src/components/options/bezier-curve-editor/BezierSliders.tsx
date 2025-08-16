/**
 * Bezier Sliders Component
 * Provides precise slider controls for bezier curve values
 */

import React from 'react';
import { Slider } from '@/components/ui/slider';
import type { BezierCurve } from './types';

interface BezierSlidersProps {
  value: BezierCurve;
  onChange: (curve: BezierCurve) => void;
}

export function BezierSliders({ value, onChange }: BezierSlidersProps) {
  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-gray-200">Fine Control</div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">X1: {value.x1.toFixed(2)}</span>
          <Slider
            value={[value.x1]}
            onValueChange={([v]) => onChange({ ...value, x1: v })}
            min={0}
            max={1}
            step={0.01}
            className="w-32"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Y1: {value.y1.toFixed(2)}</span>
          <Slider
            value={[value.y1]}
            onValueChange={([v]) => onChange({ ...value, y1: v })}
            min={0}
            max={1}
            step={0.01}
            className="w-32"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">X2: {value.x2.toFixed(2)}</span>
          <Slider
            value={[value.x2]}
            onValueChange={([v]) => onChange({ ...value, x2: v })}
            min={0}
            max={1}
            step={0.01}
            className="w-32"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Y2: {value.y2.toFixed(2)}</span>
          <Slider
            value={[value.y2]}
            onValueChange={([v]) => onChange({ ...value, y2: v })}
            min={0}
            max={1}
            step={0.01}
            className="w-32"
          />
        </div>
      </div>
    </div>
  );
}
