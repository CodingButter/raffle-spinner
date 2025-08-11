/**
 * Wheel Frame Component
 *
 * Purpose: Renders the decorative frame, selection indicators, and glass effects
 * around the slot machine wheel viewport.
 *
 * SRS Reference:
 * - FR-2.2: Winner Selection and Animation (visual indicators)
 */

interface WheelFrameProps {
  ctx: CanvasRenderingContext2D;
  canvasWidth: number;
  viewportHeight: number;
}

export function drawWheelFrame({ ctx, canvasWidth, viewportHeight }: WheelFrameProps) {
  // Draw viewport frame with glass effect
  ctx.save();

  // Draw outer frame
  const frameGradient = ctx.createLinearGradient(0, 40, 0, viewportHeight + 40);
  frameGradient.addColorStop(0, '#2a2a3e');
  frameGradient.addColorStop(0.5, '#1a1a2e');
  frameGradient.addColorStop(1, '#2a2a3e');

  ctx.strokeStyle = frameGradient;
  ctx.lineWidth = 8;
  ctx.strokeRect(20, 40, canvasWidth - 40, viewportHeight);

  // Draw inner frame highlight
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 44, canvasWidth - 48, viewportHeight - 8);

  // Draw center selection indicator using Hot Pink arrows
  const centerLineY = viewportHeight / 2 + 40;

  // Left arrow (pointing right/inward) - Hot Pink
  ctx.fillStyle = '#FF1493';
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

  // Draw selection line - Winner Gold
  ctx.strokeStyle = '#FFD700';
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
