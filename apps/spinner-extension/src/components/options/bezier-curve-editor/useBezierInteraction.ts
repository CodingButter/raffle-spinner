/**
 * Bezier Interaction Hook
 * Handles mouse interactions for dragging control points
 */

import { useState, useCallback, RefObject } from 'react';
import type { BezierCurve } from './types';

interface UseBezierInteractionProps {
  value: BezierCurve;
  onChange: (curve: BezierCurve) => void;
  canvasRef: RefObject<HTMLCanvasElement>;
}

export function useBezierInteraction({ value, onChange, canvasRef }: UseBezierInteractionProps) {
  const [isDragging, setIsDragging] = useState<'p1' | 'p2' | null>(null);

  const getMousePosition = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    },
    [canvasRef]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const pos = getMousePosition(e);
      const p1 = {
        x: value.x1 * canvas.width,
        y: (1 - value.y1) * canvas.height,
      };
      const p2 = {
        x: value.x2 * canvas.width,
        y: (1 - value.y2) * canvas.height,
      };

      const dist1 = Math.sqrt((pos.x - p1.x) ** 2 + (pos.y - p1.y) ** 2);
      const dist2 = Math.sqrt((pos.x - p2.x) ** 2 + (pos.y - p2.y) ** 2);

      if (dist1 < 16) {
        setIsDragging('p1');
      } else if (dist2 < 16) {
        setIsDragging('p2');
      }
    },
    [value, getMousePosition, canvasRef]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || !isDragging) return;

      const pos = getMousePosition(e);
      const x = Math.max(0, Math.min(1, pos.x / canvas.width));
      const y = Math.max(0, Math.min(1, 1 - pos.y / canvas.height));

      if (isDragging === 'p1') {
        onChange({ ...value, x1: x, y1: y });
      } else if (isDragging === 'p2') {
        onChange({ ...value, x2: x, y2: y });
      }
    },
    [isDragging, value, onChange, getMousePosition, canvasRef]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}
