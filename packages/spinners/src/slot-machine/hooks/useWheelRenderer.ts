/**
 * Custom hook for wheel rendering logic
 * Handles the complex canvas drawing operations for the slot machine wheel
 */

import { useCallback } from 'react';
import { Participant } from '@raffle-spinner/storage';
import { adjustBrightness, hexToRgb, type InternalThemeSettings } from '@drawday/utils';
import { drawSlotMachineSegment } from '../components/SlotMachineSegment';
import { drawSlotMachineFrame } from '../components/SlotMachineFrame';

export interface UseWheelRendererProps {
  canvasWidth: number;
  canvasHeight: number;
  showDebug?: boolean;
  theme: InternalThemeSettings;
}

export interface WheelRendererConstants {
  ITEM_HEIGHT: number;
  VISIBLE_ITEMS: number;
  VIEWPORT_HEIGHT: number;
  WHEEL_WIDTH: number;
  PERSPECTIVE_SCALE: number;
  FRAME_BORDER_WIDTH: number;
}

export function useWheelRenderer({
  canvasWidth,
  canvasHeight,
  showDebug = false,
  theme,
}: UseWheelRendererProps) {
  // Visual constants
  const constants: WheelRendererConstants = {
    ITEM_HEIGHT: 80,
    VISIBLE_ITEMS: 5,
    VIEWPORT_HEIGHT: 5 * 80, // VISIBLE_ITEMS * ITEM_HEIGHT
    WHEEL_WIDTH: 350,
    PERSPECTIVE_SCALE: 0.15,
    FRAME_BORDER_WIDTH: 8,
  };

  /**
   * Draws the complete wheel visualization at the specified position.
   * Handles background, segments, frame, and shadow overlays.
   *
   * @param canvasRef - Reference to the canvas element
   * @param currentPosition - Current scroll position in pixels
   * @param subset - Current subset of participants to display
   */
  const drawWheel = useCallback(
    (
      canvasRef: React.RefObject<HTMLCanvasElement>,
      currentPosition: number,
      subset: Participant[]
    ) => {
      const canvas = canvasRef.current;
      if (!canvas || subset.length === 0) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas - make it completely transparent
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Define viewport area - now starts at top-left with border
      const VIEWPORT_TOP = constants.FRAME_BORDER_WIDTH;
      const VIEWPORT_LEFT = constants.FRAME_BORDER_WIDTH;
      const VIEWPORT_WIDTH = canvasWidth - constants.FRAME_BORDER_WIDTH * 2;
      const VIEWPORT_BOTTOM = VIEWPORT_TOP + constants.VIEWPORT_HEIGHT;

      // Save the current context state
      ctx.save();

      // Create clipping region for the viewport - EVERYTHING inside this will be clipped
      ctx.beginPath();
      ctx.rect(VIEWPORT_LEFT, VIEWPORT_TOP, VIEWPORT_WIDTH, constants.VIEWPORT_HEIGHT);
      ctx.clip();

      // Only draw background inside the clipped area
      // Check if we should draw a background at all
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
        ctx.fillRect(VIEWPORT_LEFT, VIEWPORT_TOP, VIEWPORT_WIDTH, constants.VIEWPORT_HEIGHT);
      }

      // Calculate wheel position (based on subset, not all participants)
      const wheelCircumference = subset.length * constants.ITEM_HEIGHT;
      const normalizedPos =
        ((currentPosition % wheelCircumference) + wheelCircumference) % wheelCircumference;

      // Determine which participant is at the top of the viewport
      const topParticipantIndex = Math.floor(normalizedPos / constants.ITEM_HEIGHT);
      const pixelOffset = normalizedPos % constants.ITEM_HEIGHT;

      // Draw participants from top to bottom
      // We draw extra ones above and below for smooth scrolling
      for (let i = -2; i <= constants.VISIBLE_ITEMS + 2; i++) {
        // Calculate which participant to draw from the subset
        let participantIndex = (topParticipantIndex + i) % subset.length;
        if (participantIndex < 0) {
          participantIndex += subset.length;
        }

        const participant = subset[participantIndex];
        const yPosition = i * constants.ITEM_HEIGHT - pixelOffset + VIEWPORT_TOP;

        // Highlight the center position for debugging
        const isCenter = i === 2;

        // Draw the participant segment
        drawSlotMachineSegment({
          participant,
          yPos: yPosition,
          itemIndex: participantIndex,
          itemHeight: constants.ITEM_HEIGHT,
          viewportHeight: constants.VIEWPORT_HEIGHT,
          wheelWidth: constants.WHEEL_WIDTH,
          canvasWidth,
          perspectiveScale: constants.PERSPECTIVE_SCALE,
          ctx,
          theme,
        });

        // Add debug text showing position indices (only in dev builds)
        if (showDebug) {
          ctx.save();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.font = '10px monospace';
          ctx.textAlign = 'left';
          ctx.fillText(`i=${i}, idx=${participantIndex}`, 10, yPosition + constants.ITEM_HEIGHT / 2);
          if (isCenter) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
            ctx.fillText('← CENTER', 60, yPosition + constants.ITEM_HEIGHT / 2);
          }
          ctx.restore();
        }
      }

      // Draw top and bottom shadow overlays INSIDE the viewport
      const topShadowOpacity = theme?.spinnerStyle?.topShadowOpacity ?? 0.3;
      const bottomShadowOpacity = theme?.spinnerStyle?.bottomShadowOpacity ?? 0.3;
      const shadowSize = (theme?.spinnerStyle?.shadowSize ?? 30) / 100; // Convert percentage to decimal
      const shadowColor =
        theme?.spinnerStyle?.shadowColor ||
        theme?.spinnerStyle?.backgroundColor ||
        '#1a1a1a';

      const rgb = hexToRgb(shadowColor);

      // Top shadow gradient - within viewport only
      if (topShadowOpacity > 0) {
        const topShadowHeight = constants.VIEWPORT_HEIGHT * shadowSize;
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

      // Bottom shadow gradient - within viewport only
      if (bottomShadowOpacity > 0) {
        const bottomShadowHeight = constants.VIEWPORT_HEIGHT * shadowSize;
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

      // Restore context to remove clipping
      ctx.restore();

      // Draw frame and selection indicators AFTER restoring context
      // This ensures the frame is drawn on top without clipping
      drawSlotMachineFrame({
        ctx,
        canvasWidth,
        viewportHeight: constants.VIEWPORT_HEIGHT,
        theme,
      });
    },
    [theme, canvasWidth, canvasHeight, showDebug, constants]
  );

  return {
    drawWheel,
    constants,
  };
}