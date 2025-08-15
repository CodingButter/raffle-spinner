import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface BezierCurve {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface BezierCurveEditorProps {
  value: BezierCurve;
  onChange: (curve: BezierCurve) => void;
}

// Preset curves for quick selection
const PRESETS: { name: string; curve: BezierCurve; description: string }[] = [
  { 
    name: 'Linear', 
    curve: { x1: 0, y1: 0, x2: 1, y2: 1 },
    description: 'Constant speed throughout'
  },
  { 
    name: 'Ease In-Out', 
    curve: { x1: 0.42, y1: 0, x2: 0.58, y2: 1 },
    description: 'Slow start and end, fast middle'
  },
  { 
    name: 'Ease Out', 
    curve: { x1: 0, y1: 0, x2: 0.58, y2: 1 },
    description: 'Fast start, slow end'
  },
  { 
    name: 'Ease In', 
    curve: { x1: 0.42, y1: 0, x2: 1, y2: 1 },
    description: 'Slow start, fast end'
  },
  { 
    name: 'Dramatic', 
    curve: { x1: 0.2, y1: 0.9, x2: 0.8, y2: 0.1 },
    description: 'Very fast middle, very slow ends'
  },
  { 
    name: 'Smooth Stop', 
    curve: { x1: 0.25, y1: 0.1, x2: 0.75, y2: 0.9 },
    description: 'Gradual acceleration and deceleration'
  },
];

export function BezierCurveEditor({ value, onChange }: BezierCurveEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState<'p1' | 'p2' | null>(null);

  // Draw the bezier curve visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(0, (height / 4) * i);
      ctx.lineTo(width, (height / 4) * i);
      ctx.moveTo((width / 4) * i, 0);
      ctx.lineTo((width / 4) * i, height);
      ctx.stroke();
    }

    // Draw diagonal reference line
    ctx.strokeStyle = '#6B7280';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(width, 0);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw bezier curve
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, height);

    // Draw the actual bezier curve
    for (let t = 0; t <= 1; t += 0.01) {
      const x = cubicBezier(t, 0, value.x1, value.x2, 1);
      const y = cubicBezier(t, 0, value.y1, value.y2, 1);
      ctx.lineTo(x * width, height - y * height);
    }
    ctx.stroke();

    // Draw control points
    const p1x = value.x1 * width;
    const p1y = height - value.y1 * height;
    const p2x = value.x2 * width;
    const p2y = height - value.y2 * height;

    // Control lines
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(p1x, p1y);
    ctx.moveTo(width, 0);
    ctx.lineTo(p2x, p2y);
    ctx.stroke();

    // Control point circles
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(p1x, p1y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(p2x, p2y, 8, 0, Math.PI * 2);
    ctx.fill();

    // Labels
    ctx.fillStyle = '#F9FAFB';
    ctx.font = '12px sans-serif';
    ctx.fillText('Start', 5, height - 5);
    ctx.fillText('End', width - 25, 15);
  }, [value]);

  // Cubic bezier calculation
  function cubicBezier(t: number, p0: number, p1: number, p2: number, p3: number): number {
    const t2 = t * t;
    const t3 = t2 * t;
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    return mt3 * p0 + 3 * mt2 * t * p1 + 3 * mt * t2 * p2 + t3 * p3;
  }

  // Handle mouse interactions for dragging control points
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const p1x = value.x1 * canvas.width;
    const p1y = canvas.height - value.y1 * canvas.height;
    const p2x = value.x2 * canvas.width;
    const p2y = canvas.height - value.y2 * canvas.height;

    // Check if clicking on control points
    const dist1 = Math.sqrt((x - p1x) ** 2 + (y - p1y) ** 2);
    const dist2 = Math.sqrt((x - p2x) ** 2 + (y - p2y) ** 2);

    if (dist1 < 15) {
      setIsDragging('p1');
    } else if (dist2 < 15) {
      setIsDragging('p2');
    }
  }, [value]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
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
  }, [isDragging, value, onChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spin Animation Curve</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Canvas for curve visualization */}
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
        </div>

        {/* Manual control inputs */}
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

        {/* Preset buttons */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Presets</label>
          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map((preset) => (
              <Button
                key={preset.name}
                variant={
                  JSON.stringify(value) === JSON.stringify(preset.curve)
                    ? 'default'
                    : 'outline'
                }
                size="sm"
                onClick={() => onChange(preset.curve)}
                title={preset.description}
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </div>

        {/* CSS output for copying */}
        <div className="space-y-2">
          <label className="text-sm font-medium">CSS Value</label>
          <code className="block p-2 bg-gray-800 rounded text-xs">
            cubic-bezier({value.x1.toFixed(2)}, {value.y1.toFixed(2)}, {value.x2.toFixed(2)}, {value.y2.toFixed(2)})
          </code>
        </div>
      </CardContent>
    </Card>
  );
}