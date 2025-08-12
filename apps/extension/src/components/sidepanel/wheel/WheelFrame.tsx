/**
 * Wheel Frame Component
 *
 * Purpose: Renders the decorative frame, selection indicators, and glass effects
 * around the slot machine wheel viewport.
 *
 * SRS Reference:
 * - FR-2.2: Winner Selection and Animation (visual indicators)
 */

import type { ThemeSettings } from '@raffle-spinner/storage';

// Helper function to adjust color brightness
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

export function drawWheelFrame({ ctx, canvasWidth, viewportHeight, theme }: WheelFrameProps) {
  // Draw viewport frame with glass effect
  ctx.save();

  // Draw outer frame using theme colors
  const borderColor = theme?.spinnerStyle?.borderColor || '#FFD700';
  const frameGradient = ctx.createLinearGradient(0, 40, 0, viewportHeight + 40);
  frameGradient.addColorStop(0, adjustBrightness(borderColor, -40));
  frameGradient.addColorStop(0.5, adjustBrightness(borderColor, -60));
  frameGradient.addColorStop(1, adjustBrightness(borderColor, -40));

  ctx.strokeStyle = frameGradient;
  ctx.lineWidth = 8;
  ctx.strokeRect(20, 40, canvasWidth - 40, viewportHeight);

  // Draw inner frame highlight
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 44, canvasWidth - 48, viewportHeight - 8);

  // Draw center selection indicator using Hot Pink arrows
  const centerLineY = viewportHeight / 2 + 40;

  // Left arrow (pointing right/inward) - Theme highlight color
  ctx.fillStyle = theme?.spinnerStyle?.highlightColor || '#FF1493';
  ctx.beginPath();
  ctx.moveTo(40, centerLineY); // Point at the right
  ctx.lineTo(10, centerLineY - 20); // Top left corner
  ctx.lineTo(10, centerLineY + 20); // Bottom left corner
  ctx.closePath();
  ctx.fill();

  // Right arrow (pointing left/inward) - Hot Pink
  ctx.beginPath();
  ctx.moveTo(canvasWidth - 40, centerLineY); // Point at the left
  ctx.lineTo(canvasWidth - 10, centerLineY - 20); // Top right corner
  ctx.lineTo(canvasWidth - 10, centerLineY + 20); // Bottom right corner
  ctx.closePath();
  ctx.fill();

  // Draw selection line - Theme border/winner color
  ctx.strokeStyle = theme?.colors?.winner || theme?.spinnerStyle?.borderColor || '#FFD700';
  ctx.lineWidth = 3;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(40, centerLineY);
  ctx.lineTo(canvasWidth - 40, centerLineY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Add glass reflection effect
  const glassGradient = ctx.createLinearGradient(0, 40, 0, viewportHeight / 3 + 40);
  glassGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
  glassGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = glassGradient;
  ctx.fillRect(24, 44, canvasWidth - 48, viewportHeight / 3);

  ctx.restore();
}
