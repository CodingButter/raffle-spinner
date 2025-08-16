/**
 * Bezier Curve Presets Component
 * Provides preset curve options for quick selection
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import type { BezierCurve } from './types';

export const PRESETS: { name: string; curve: BezierCurve; description: string }[] = [
  {
    name: 'Linear',
    curve: { x1: 0, y1: 0, x2: 1, y2: 1 },
    description: 'Constant speed throughout',
  },
  {
    name: 'Ease In-Out',
    curve: { x1: 0.42, y1: 0, x2: 0.58, y2: 1 },
    description: 'Slow start and end, fast middle',
  },
  {
    name: 'Ease Out',
    curve: { x1: 0, y1: 0, x2: 0.58, y2: 1 },
    description: 'Fast start, slow end',
  },
  {
    name: 'Ease In',
    curve: { x1: 0.42, y1: 0, x2: 1, y2: 1 },
    description: 'Slow start, fast end',
  },
  {
    name: 'Dramatic',
    curve: { x1: 0.2, y1: 0.9, x2: 0.8, y2: 0.1 },
    description: 'Very fast middle, very slow ends',
  },
  {
    name: 'Smooth Stop',
    curve: { x1: 0.25, y1: 0.1, x2: 0.75, y2: 0.9 },
    description: 'Gradual acceleration and deceleration',
  },
];

interface BezierPresetsProps {
  onSelect: (curve: BezierCurve) => void;
}

export function BezierPresets({ onSelect }: BezierPresetsProps) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-200">Presets</div>
      <div className="grid grid-cols-2 gap-2">
        {PRESETS.map((preset) => (
          <Button
            key={preset.name}
            variant="outline"
            size="sm"
            onClick={() => onSelect(preset.curve)}
            className="justify-start"
            title={preset.description}
          >
            {preset.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
