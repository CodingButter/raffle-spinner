/**
 * SegmentRenderer Component
 * 
 * Handles the rendering of individual wheel segments.
 * Manages the visual appearance of participants and background effects.
 * 
 * @module SegmentRenderer
 */

import { Participant } from '@raffle-spinner/storage';
import { drawSlotMachineSegment } from '../SlotMachineSegment';
import { drawSlotMachineFrame } from '../SlotMachineFrame';
import { 
  ITEM_HEIGHT, 
  VISIBLE_ITEMS, 
  VIEWPORT_HEIGHT,
  WHEEL_WIDTH,
  PERSPECTIVE_SCALE
} from '../../constants';

/**
 * Internal theme settings format required by drawing functions
 */
export interface InternalTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    winner: string;
    winnerGlow: string;
  };
  spinnerStyle: {
    type: 'slotMachine';
    backgroundColor: string;
    canvasBackground: string;
    borderColor: string;
    highlightColor: string;
    nameColor: string;
    ticketColor: string;
    fontFamily: string;
    nameSize: string;
    ticketSize: string;
    topShadowOpacity: number;
    bottomShadowOpacity: number;
    shadowSize: number;
    shadowColor?: string;
  };
  branding: {
    logoPosition: 'center';
    showCompanyName: boolean;
  };
}

/**
 * Adjusts the brightness of a hex color
 * @param color - Hex color string (e.g., '#ffffff')
 * @param percent - Amount to adjust (-255 to 255)
 * @returns Adjusted hex color string
 */
export function adjustBrightness(color: string, percent: number): string {
  // Handle hex colors
  if (color.startsWith('#')) {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, ((num >> 16) & 255) + percent));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 255) + percent));
    const b = Math.max(0, Math.min(255, (num & 255) + percent));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }
  // For non-hex colors, return with opacity adjustment
  return color;
}

/**
 * Draws the background gradient for the wheel
 */
export function drawBackground(
  ctx: CanvasRenderingContext2D,
  theme: InternalTheme,
  viewportTop: number,
  viewportLeft: number,
  viewportWidth: number,
  viewportBottom: number
): void {
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
    ctx.fillRect(viewportLeft, viewportTop, viewportWidth, VIEWPORT_HEIGHT);
  }
}

/**
 * Draws all visible segments of the wheel
 */
export function drawSegments(
  ctx: CanvasRenderingContext2D,
  subset: Participant[],
  normalizedPos: number,
  theme: InternalTheme,
  canvasWidth: number,
  viewportTop: number,
  showDebug: boolean
): void {
  // Determine which participant is at the top of the viewport
  const topParticipantIndex = Math.floor(normalizedPos / ITEM_HEIGHT);
  const pixelOffset = normalizedPos % ITEM_HEIGHT;

  // Draw participants from top to bottom
  // We draw extra ones above and below for smooth scrolling
  for (let i = -2; i <= VISIBLE_ITEMS + 2; i++) {
    // Calculate which participant to draw from the subset
    let participantIndex = (topParticipantIndex + i) % subset.length;
    if (participantIndex < 0) {
      participantIndex += subset.length;
    }

    const participant = subset[participantIndex];
    const yPosition = i * ITEM_HEIGHT - pixelOffset + viewportTop;

    // Highlight the center position for debugging
    const isCenter = i === 2;

    // Draw the participant segment
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

    // Add debug text showing position indices (only in dev builds)
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
}

/**
 * Draws the frame around the wheel
 */
export function drawFrame(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  theme: InternalTheme
): void {
  drawSlotMachineFrame({
    ctx,
    canvasWidth,
    viewportHeight: VIEWPORT_HEIGHT,
    theme,
  });
}