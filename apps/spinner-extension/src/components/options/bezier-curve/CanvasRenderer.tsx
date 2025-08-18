import React, { useEffect } from 'react';
import { BezierCurve } from './types';
import { cubicBezier } from './utils';

interface CanvasRendererProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  value: BezierCurve;
}

export function CanvasRenderer({ canvasRef, value }: CanvasRendererProps) {
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
  }, [canvasRef, value]);

  return null;
}
