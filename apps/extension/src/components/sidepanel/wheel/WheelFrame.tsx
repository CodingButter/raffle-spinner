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

  // Draw center selection indicator (red arrows pointing to center)
  const centerLineY = viewportHeight / 2 + 40;

  // Left arrow
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.moveTo(10, centerLineY);
  ctx.lineTo(40, centerLineY - 20);
  ctx.lineTo(40, centerLineY + 20);
  ctx.closePath();
  ctx.fill();

  // Right arrow
  ctx.beginPath();
  ctx.moveTo(canvasWidth - 10, centerLineY);
  ctx.lineTo(canvasWidth - 40, centerLineY - 20);
  ctx.lineTo(canvasWidth - 40, centerLineY + 20);
  ctx.closePath();
  ctx.fill();

  // Draw selection line
  ctx.strokeStyle = '#ef4444';
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

  // Draw title
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('RAFFLE SPINNER', canvasWidth / 2, 25);
}
