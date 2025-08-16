/**
 * Bezier Canvas Component
 * Renders interactive bezier curve visualization
 */

import React, { useRef, useEffect } from 'react';
import type { BezierCurve } from './types';
import { useBezierInteraction } from './useBezierInteraction';
import { drawBezierCurve } from './bezier-utils';

interface BezierCanvasProps {
  value: BezierCurve;
  onChange: (curve: BezierCurve) => void;
}

export function BezierCanvas({ value, onChange }: BezierCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { handleMouseDown, handleMouseMove, handleMouseUp } = useBezierInteraction({
    value,
    onChange,
    canvasRef,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawBezierCurve(ctx, canvas.width, canvas.height, value);
  }, [value]);

  return (
    <canvas
      ref={canvasRef}
      width={256}
      height={256}
      className="border border-gray-700 rounded bg-gray-900 cursor-crosshair"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
}
