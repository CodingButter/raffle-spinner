/**
 * Bezier Curve Utilities
 * Mathematical functions and drawing utilities for bezier curves
 */

import type { BezierCurve } from './types';

// Calculate cubic bezier value at time t
export function cubicBezier(t: number, p0: number, p1: number, p2: number, p3: number): number {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
}

// Draw the complete bezier curve visualization
export function drawBezierCurve(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  value: BezierCurve
) {
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
    ctx.lineTo(x * width, (1 - y) * height);
  }
  ctx.stroke();

  // Draw control lines
  ctx.strokeStyle = '#EF4444';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(value.x1 * width, (1 - value.y1) * height);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(width, 0);
  ctx.lineTo(value.x2 * width, (1 - value.y2) * height);
  ctx.stroke();

  // Draw control points
  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.arc(value.x1 * width, (1 - value.y1) * height, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(value.x2 * width, (1 - value.y2) * height, 8, 0, Math.PI * 2);
  ctx.fill();
}
