/**
 * Wheel Frame Component
 *
 * Renders the decorative frame, selection indicators, and glass effects
 * around the slot machine wheel viewport. Creates the distinctive slot machine
 * appearance with metallic borders and winner selection arrows.
 *
 * Features:
 * - Metallic gradient frame with theme colors
 * - Glass overlay effect for depth
 * - Selection arrows pointing to winner position
 * - Glowing winner highlight area
 *
 * @module WheelFrame
 * @category Components/SlotMachine
 */

import type { ThemeSettings } from '@raffle-spinner/storage';

/**
 * Adjusts the brightness of a hex color for gradient effects
 * @param color - Hex color string
 * @param percent - Brightness adjustment (-255 to 255)
 * @returns Adjusted hex color
 * @internal
 */
function adjustBrightness(color: string, percent: number): string {
  // Handle hex colors
  if (color.startsWith('#')) {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, ((num >> 16) & 255) + percent));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 255) + percent));
    const b = Math.max(0, Math.min(255, (num & 255) + percent));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }
  return color;
}

interface WheelFrameProps {
  ctx: CanvasRenderingContext2D;
  canvasWidth: number;
  viewportHeight: number;
  theme?: ThemeSettings;
}

/**
 * Draws the decorative frame around the slot machine viewport
 *
 * @param props - Frame rendering properties
 * @param props.ctx - Canvas 2D rendering context
 * @param props.canvasWidth - Total canvas width in pixels
 * @param props.viewportHeight - Viewport height for the wheel
 * @param props.theme - Theme settings for colors and styles
 */
export function drawSlotMachineFrame({ ctx, canvasWidth, viewportHeight, theme }: WheelFrameProps) {
  // Draw viewport frame with glass effect
  ctx.save();

  const FRAME_BORDER_WIDTH = 8;
  const VIEWPORT_TOP = FRAME_BORDER_WIDTH;
  const VIEWPORT_LEFT = FRAME_BORDER_WIDTH;
  const VIEWPORT_WIDTH = canvasWidth - (FRAME_BORDER_WIDTH * 2);

  // Draw outer frame using theme colors
  const borderColor = theme?.spinnerStyle?.borderColor || '#FFD700';
  const frameGradient = ctx.createLinearGradient(0, VIEWPORT_TOP, 0, viewportHeight + VIEWPORT_TOP);
  frameGradient.addColorStop(0, adjustBrightness(borderColor, -40));
  frameGradient.addColorStop(0.5, adjustBrightness(borderColor, -60));
  frameGradient.addColorStop(1, adjustBrightness(borderColor, -40));

  ctx.strokeStyle = frameGradient;
  ctx.lineWidth = FRAME_BORDER_WIDTH;
  ctx.strokeRect(FRAME_BORDER_WIDTH/2, FRAME_BORDER_WIDTH/2, canvasWidth - FRAME_BORDER_WIDTH, viewportHeight + FRAME_BORDER_WIDTH);

  // Draw inner frame highlight
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 2;
  ctx.strokeRect(VIEWPORT_LEFT, VIEWPORT_TOP, VIEWPORT_WIDTH, viewportHeight);

  // Draw center selection indicator using Hot Pink arrows
  const centerLineY = viewportHeight / 2 + VIEWPORT_TOP;

  // Left arrow (pointing right/inward) - Theme highlight color
  ctx.fillStyle = theme?.spinnerStyle?.highlightColor || '#FF1493';
  ctx.beginPath();
  ctx.moveTo(VIEWPORT_LEFT + 20, centerLineY); // Point at the right
  ctx.lineTo(2, centerLineY - 20); // Top left corner
  ctx.lineTo(2, centerLineY + 20); // Bottom left corner
  ctx.closePath();
  ctx.fill();

  // Right arrow (pointing left/inward) - Hot Pink
  ctx.beginPath();
  ctx.moveTo(canvasWidth - VIEWPORT_LEFT - 20, centerLineY); // Point at the left
  ctx.lineTo(canvasWidth - 2, centerLineY - 20); // Top right corner
  ctx.lineTo(canvasWidth - 2, centerLineY + 20); // Bottom right corner
  ctx.closePath();
  ctx.fill();

  // Draw selection line - Theme border/winner color
  ctx.strokeStyle = theme?.colors?.winner || theme?.spinnerStyle?.borderColor || '#FFD700';
  ctx.lineWidth = 3;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(VIEWPORT_LEFT + 20, centerLineY);
  ctx.lineTo(canvasWidth - VIEWPORT_LEFT - 20, centerLineY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Add glass reflection effect - only a subtle overlay, not a fill
  const glassGradient = ctx.createLinearGradient(0, VIEWPORT_TOP, 0, viewportHeight / 3 + VIEWPORT_TOP);
  glassGradient.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
  glassGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = glassGradient;
  ctx.fillRect(VIEWPORT_LEFT, VIEWPORT_TOP, VIEWPORT_WIDTH, viewportHeight / 3);

  ctx.restore();
}
