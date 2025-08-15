/**
 * Canvas rendering component for slot machine wheel
 * Handles all drawing operations and visual rendering
 * 
 * @module WheelCanvas
 */

import React, { useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Participant } from '@raffle-spinner/storage';
import { drawSlotMachineSegment } from './SlotMachineSegment';
import { drawSlotMachineFrame } from './SlotMachineFrame';
import { adjustBrightness, hexToRgb } from '../utils/theme-utils';

// Visual constants
const ITEM_HEIGHT = 80;
const VISIBLE_ITEMS = 5;
const VIEWPORT_HEIGHT = VISIBLE_ITEMS * ITEM_HEIGHT;
const WHEEL_WIDTH = 350;
const PERSPECTIVE_SCALE = 0.15;
const FRAME_BORDER_WIDTH = 8;

interface WheelCanvasProps {
  position: number;
  subset: Participant[];
  theme: any; // Internal theme format
  canvasWidth: number;
  canvasHeight: number;
  showDebug?: boolean;
  className?: string;
}

export interface WheelCanvasRef {
  drawWheel: (position: number, subset: Participant[]) => void;
}

export const WheelCanvas = forwardRef<WheelCanvasRef, WheelCanvasProps>(({
  position,
  subset,
  theme,
  canvasWidth,
  canvasHeight,
  showDebug = false,
  className
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /**
   * Draws the complete wheel visualization at the specified position
   */
  const drawWheel = useCallback(
    (currentPosition: number, currentSubset: Participant[]) => {
      const canvas = canvasRef.current;
      if (!canvas || currentSubset.length === 0) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Define viewport area
      const VIEWPORT_TOP = FRAME_BORDER_WIDTH;
      const VIEWPORT_LEFT = FRAME_BORDER_WIDTH;
      const VIEWPORT_WIDTH = canvasWidth - FRAME_BORDER_WIDTH * 2;
      const VIEWPORT_BOTTOM = VIEWPORT_TOP + VIEWPORT_HEIGHT;

      // Save context and create clipping region
      ctx.save();
      ctx.beginPath();
      ctx.rect(VIEWPORT_LEFT, VIEWPORT_TOP, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
      ctx.clip();

      // Draw background if needed
      if (
        theme?.spinnerStyle?.backgroundColor &&
        theme.spinnerStyle.backgroundColor !== 'transparent'
      ) {
        const slotBgColor = theme.spinnerStyle.backgroundColor;
        const bgGradient = ctx.createLinearGradient(0, VIEWPORT_TOP, 0, VIEWPORT_BOTTOM);
        bgGradient.addColorStop(0, adjustBrightness(slotBgColor, -20));
        bgGradient.addColorStop(0.5, slotBgColor);
        bgGradient.addColorStop(1, adjustBrightness(slotBgColor, -20));
        ctx.fillStyle = bgGradient;
        ctx.fillRect(VIEWPORT_LEFT, VIEWPORT_TOP, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
      }

      // Calculate wheel position
      const wheelCircumference = currentSubset.length * ITEM_HEIGHT;
      const normalizedPos =
        ((currentPosition % wheelCircumference) + wheelCircumference) % wheelCircumference;

      const topParticipantIndex = Math.floor(normalizedPos / ITEM_HEIGHT);
      const pixelOffset = normalizedPos % ITEM_HEIGHT;

      // Draw participants
      for (let i = -2; i <= VISIBLE_ITEMS + 2; i++) {
        let participantIndex = (topParticipantIndex + i) % currentSubset.length;
        if (participantIndex < 0) {
          participantIndex += currentSubset.length;
        }

        const participant = currentSubset[participantIndex];
        const yPosition = i * ITEM_HEIGHT - pixelOffset + VIEWPORT_TOP;
        const isCenter = i === 2;

        drawSlotMachineSegment({
          participant,
          yPos: yPosition,
          itemIndex: participantIndex,
          itemHeight: ITEM_HEIGHT,
          viewportHeight: VIEWPORT_HEIGHT,
          wheelWidth: WHEEL_WIDTH,
          canvasWidth,
          perspectiveScale: PERSPECTIVE_SCALE,
          ctx,
          theme,
        });

        // Debug text
        if (showDebug) {
          ctx.save();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.font = '10px monospace';
          ctx.textAlign = 'left';
          ctx.fillText(`i=${i}, idx=${participantIndex}`, 10, yPosition + ITEM_HEIGHT / 2);
          if (isCenter) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
            ctx.fillText('← CENTER', 60, yPosition + ITEM_HEIGHT / 2);
          }
          ctx.restore();
        }
      }

      // Draw shadow overlays
      const topShadowOpacity = theme?.spinnerStyle?.topShadowOpacity ?? 0.3;
      const bottomShadowOpacity = theme?.spinnerStyle?.bottomShadowOpacity ?? 0.3;
      const shadowSize = (theme?.spinnerStyle?.shadowSize ?? 30) / 100;
      const shadowColor =
        theme?.spinnerStyle?.shadowColor ||
        theme?.spinnerStyle?.backgroundColor ||
        '#1a1a1a';

      const rgb = hexToRgb(shadowColor);

      // Top shadow
      if (topShadowOpacity > 0) {
        const topShadowHeight = VIEWPORT_HEIGHT * shadowSize;
        const topGradient = ctx.createLinearGradient(
          0,
          VIEWPORT_TOP,
          0,
          VIEWPORT_TOP + topShadowHeight
        );
        topGradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${topShadowOpacity})`);
        topGradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
        ctx.fillStyle = topGradient;
        ctx.fillRect(VIEWPORT_LEFT, VIEWPORT_TOP, VIEWPORT_WIDTH, topShadowHeight);
      }

      // Bottom shadow
      if (bottomShadowOpacity > 0) {
        const bottomShadowHeight = VIEWPORT_HEIGHT * shadowSize;
        const bottomStart = VIEWPORT_BOTTOM - bottomShadowHeight;
        const bottomGradient = ctx.createLinearGradient(0, bottomStart, 0, VIEWPORT_BOTTOM);
        bottomGradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
        bottomGradient.addColorStop(
          1,
          `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${bottomShadowOpacity})`
        );
        ctx.fillStyle = bottomGradient;
        ctx.fillRect(VIEWPORT_LEFT, bottomStart, VIEWPORT_WIDTH, bottomShadowHeight);
      }

      // Restore context
      ctx.restore();

      // Draw frame on top
      drawSlotMachineFrame({
        ctx,
        canvasWidth,
        viewportHeight: VIEWPORT_HEIGHT,
        theme,
      });
    },
    [theme, canvasWidth, canvasHeight, showDebug]
  );

  // Expose drawWheel method to parent
  useImperativeHandle(ref, () => ({
    drawWheel
  }), [drawWheel]);

  // Draw on position or subset changes
  useEffect(() => {
    if (subset.length > 0) {
      drawWheel(position, subset);
    }
  }, [position, subset, drawWheel]);

  return (
    <div
      className={`inline-flex rounded-xl overflow-hidden ${className || ''}`}
      style={{ background: 'transparent' }}
    >
      <canvas
        ref={canvasRef}
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
});