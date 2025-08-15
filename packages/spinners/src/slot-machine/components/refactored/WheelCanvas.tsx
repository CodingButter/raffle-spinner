/**
 * WheelCanvas Component
 * 
 * Handles the canvas rendering and drawing logic for the slot machine wheel.
 * Manages the viewport, clipping regions, and background rendering.
 * 
 * @module WheelCanvas
 */

import React, { forwardRef } from 'react';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../constants';

export interface WheelCanvasProps {
  canvasWidth?: number;
  canvasHeight?: number;
  className?: string;
}

/**
 * Canvas component for the slot machine wheel visualization.
 * Provides a transparent canvas with proper sizing and styling.
 */
export const WheelCanvas = forwardRef<HTMLCanvasElement, WheelCanvasProps>(
  ({ canvasWidth = CANVAS_WIDTH, canvasHeight = CANVAS_HEIGHT, className = '' }, ref) => {
    return (
      <div
        className={`inline-flex rounded-xl overflow-hidden ${className}`}
        style={{ background: 'transparent' }}
      >
        <canvas
          ref={ref}
          width={canvasWidth}
          height={canvasHeight}
          className="block"
          style={{
            imageRendering: 'crisp-edges',
            background: 'transparent',
          }}
        />
      </div>
    );
  }
);

WheelCanvas.displayName = 'WheelCanvas';