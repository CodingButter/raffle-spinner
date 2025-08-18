import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BezierCurveEditorProps } from './bezier-curve/types';
import { CanvasRenderer } from './bezier-curve/CanvasRenderer';
import { ControlPointSliders } from './bezier-curve/ControlPointSliders';
import { PresetButtons } from './bezier-curve/PresetButtons';

export function BezierCurveEditor({ value, onChange }: BezierCurveEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState<'p1' | 'p2' | null>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const p1x = value.x1 * canvas.width;
      const p1y = canvas.height - value.y1 * canvas.height;
      const p2x = value.x2 * canvas.width;
      const p2y = canvas.height - value.y2 * canvas.height;

      const dist1 = Math.sqrt((x - p1x) ** 2 + (y - p1y) ** 2);
      const dist2 = Math.sqrt((x - p2x) ** 2 + (y - p2y) ** 2);

      if (dist1 < 15) {
        setIsDragging('p1');
      } else if (dist2 < 15) {
        setIsDragging('p2');
      }
    },
    [value]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDragging) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / canvas.width));
      const y = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / canvas.height));

      if (isDragging === 'p1') {
        onChange({ ...value, x1: x, y1: y });
      } else if (isDragging === 'p2') {
        onChange({ ...value, x2: x, y2: y });
      }
    },
    [isDragging, value, onChange]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spin Animation Curve</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative bg-gray-900 rounded-lg p-4">
          <canvas
            ref={canvasRef}
            width={300}
            height={300}
            className="cursor-pointer"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
          <CanvasRenderer canvasRef={canvasRef} value={value} />
        </div>

        <ControlPointSliders value={value} onChange={onChange} />
        <PresetButtons value={value} onChange={onChange} />

        <div className="space-y-2">
          <label className="text-sm font-medium">CSS Value</label>
          <code className="block p-2 bg-gray-800 rounded text-xs">
            cubic-bezier({value.x1.toFixed(2)}, {value.y1.toFixed(2)}, {value.x2.toFixed(2)},{' '}
            {value.y2.toFixed(2)})
          </code>
        </div>
      </CardContent>
    </Card>
  );
}
