/**
 * Bezier Curve Editor Component
 * Interactive editor for customizing animation bezier curves
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BezierCanvas } from './bezier-curve-editor/BezierCanvas';
import { BezierPresets } from './bezier-curve-editor/BezierPresets';
import { BezierSliders } from './bezier-curve-editor/BezierSliders';
import type { BezierCurve } from './bezier-curve-editor/types';

interface BezierCurveEditorProps {
  value: BezierCurve;
  onChange: (curve: BezierCurve) => void;
}

export function BezierCurveEditor({ value, onChange }: BezierCurveEditorProps) {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Custom Easing Curve</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-400">
          Drag the red control points to customize the animation easing curve. The curve shows how
          the spinner speed changes over time.
        </div>

        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <BezierCanvas value={value} onChange={onChange} />
          </div>

          <div className="flex-1 space-y-4">
            <BezierPresets onSelect={onChange} />
            <BezierSliders value={value} onChange={onChange} />

            <div className="text-xs text-gray-500 pt-2 border-t border-gray-700">
              CSS: cubic-bezier({value.x1.toFixed(2)}, {value.y1.toFixed(2)}, {value.x2.toFixed(2)},{' '}
              {value.y2.toFixed(2)})
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Re-export the type for backward compatibility
export type { BezierCurve } from './bezier-curve-editor/types';
