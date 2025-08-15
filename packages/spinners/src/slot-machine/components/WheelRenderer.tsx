/**
 * Wheel rendering component for the slot machine
 * Handles all canvas drawing operations
 *
 * @module WheelRenderer
 */

import { useRef, useEffect, useCallback } from 'react';
import { Participant } from '@raffle-spinner/storage';
import { drawSlotMachineSegment } from './SlotMachineSegment';
import { drawSlotMachineFrame } from './SlotMachineFrame';
import { adjustBrightness, hexToRgb } from '../utils/theme-utils';

interface WheelRendererProps {
  displaySubset: Participant[];
  position: number;
  theme: ReturnType<typeof import('../utils/theme-utils').convertTheme>;
  canvasWidth: number;
  canvasHeight: number;
  itemHeight: number;
  visibleItems: number;
  showDebug?: boolean;
}

// Visual constants
const PERSPECTIVE_SCALE = 0.15;
const FRAME_BORDER_WIDTH = 8;
const WHEEL_WIDTH = 350;

export function WheelRenderer({
  displaySubset,
  position,
  theme,
  canvasWidth,
  canvasHeight,
  itemHeight,
  visibleItems,
  showDebug = false,
}: WheelRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || displaySubset.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const viewportHeight = visibleItems * itemHeight;
    const viewportTop = FRAME_BORDER_WIDTH;
    const viewportLeft = FRAME_BORDER_WIDTH;
    const viewportWidth = canvasWidth - FRAME_BORDER_WIDTH * 2;
    const viewportBottom = viewportTop + viewportHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Save context state
    ctx.save();

    // Create clipping region for the viewport
    ctx.beginPath();
    ctx.rect(viewportLeft, viewportTop, viewportWidth, viewportHeight);
    ctx.clip();

    // Draw background if not transparent
    if (
      theme?.spinnerStyle?.backgroundColor &&
      theme.spinnerStyle.backgroundColor !== 'transparent'
    ) {
      const slotBgColor = theme.spinnerStyle.backgroundColor;
      const bgGradient = ctx.createLinearGradient(0, viewportTop, 0, viewportBottom);
      bgGradient.addColorStop(0, adjustBrightness(slotBgColor, -20));
      bgGradient.addColorStop(0.5, slotBgColor);
      bgGradient.addColorStop(1, adjustBrightness(slotBgColor, -20));
      ctx.fillStyle = bgGradient;
      ctx.fillRect(viewportLeft, viewportTop, viewportWidth, viewportHeight);
    }

    // Calculate wheel position
    const wheelCircumference = displaySubset.length * itemHeight;
    const normalizedPos =
      ((position % wheelCircumference) + wheelCircumference) % wheelCircumference;

    // Determine which participant is at the top
    const topParticipantIndex = Math.floor(normalizedPos / itemHeight);
    const pixelOffset = normalizedPos % itemHeight;

    // Draw participants
    for (let i = -2; i <= visibleItems + 2; i++) {
      let participantIndex = (topParticipantIndex + i) % displaySubset.length;
      if (participantIndex < 0) {
        participantIndex += displaySubset.length;
      }

      const participant = displaySubset[participantIndex];
      const yPosition = i * itemHeight - pixelOffset + viewportTop;
      const isCenter = i === 2;

      drawSlotMachineSegment({
        participant,
        yPos: yPosition,
        itemIndex: participantIndex,
        itemHeight,
        viewportHeight,
        wheelWidth: WHEEL_WIDTH,
        canvasWidth,
        perspectiveScale: PERSPECTIVE_SCALE,
        ctx,
        theme,
      });

      // Debug info
      if (showDebug) {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '10px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`i=${i}, idx=${participantIndex}`, 10, yPosition + itemHeight / 2);
        if (isCenter) {
          ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
          ctx.fillText('← CENTER', 60, yPosition + itemHeight / 2);
        }
        ctx.restore();
      }
    }

    // Draw shadow overlays
    drawShadowOverlays(
      ctx,
      theme,
      viewportTop,
      viewportLeft,
      viewportWidth,
      viewportHeight,
      viewportBottom
    );

    // Restore context
    ctx.restore();

    // Draw frame on top
    drawSlotMachineFrame({
      ctx,
      canvasWidth,
      viewportHeight,
      theme,
    });
  }, [
    displaySubset,
    position,
    theme,
    canvasWidth,
    canvasHeight,
    itemHeight,
    visibleItems,
    showDebug,
  ]);

  // Redraw when dependencies change
  useEffect(() => {
    drawWheel();
  }, [drawWheel]);

  return (
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
  );
}

// Helper function for shadow overlays
function drawShadowOverlays(
  ctx: CanvasRenderingContext2D,
  theme: ReturnType<typeof import('../utils/theme-utils').convertTheme>,
  viewportTop: number,
  viewportLeft: number,
  viewportWidth: number,
  viewportHeight: number,
  viewportBottom: number
) {
  const topShadowOpacity = theme?.spinnerStyle?.topShadowOpacity ?? 0.3;
  const bottomShadowOpacity = theme?.spinnerStyle?.bottomShadowOpacity ?? 0.3;
  const shadowSize = (theme?.spinnerStyle?.shadowSize ?? 30) / 100;
  const shadowColor =
    theme?.spinnerStyle?.shadowColor || theme?.spinnerStyle?.backgroundColor || '#1a1a1a';

  const rgb = hexToRgb(shadowColor);

  // Top shadow gradient
  if (topShadowOpacity > 0) {
    const topShadowHeight = viewportHeight * shadowSize;
    const topGradient = ctx.createLinearGradient(0, viewportTop, 0, viewportTop + topShadowHeight);
    topGradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${topShadowOpacity})`);
    topGradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
    ctx.fillStyle = topGradient;
    ctx.fillRect(viewportLeft, viewportTop, viewportWidth, topShadowHeight);
  }

  // Bottom shadow gradient
  if (bottomShadowOpacity > 0) {
    const bottomShadowHeight = viewportHeight * shadowSize;
    const bottomStart = viewportBottom - bottomShadowHeight;
    const bottomGradient = ctx.createLinearGradient(0, bottomStart, 0, viewportBottom);
    bottomGradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
    bottomGradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${bottomShadowOpacity})`);
    ctx.fillStyle = bottomGradient;
    ctx.fillRect(viewportLeft, bottomStart, viewportWidth, bottomShadowHeight);
  }
}
