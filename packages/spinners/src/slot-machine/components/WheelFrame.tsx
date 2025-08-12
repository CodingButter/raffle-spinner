/**
 * Wheel Frame Component
 *
 * Renders the frame and selection indicators for the slot machine wheel.
 * This includes the center selection area and visual guides.
 */

interface WheelFrameProps {
  ctx: CanvasRenderingContext2D;
  canvasWidth: number;
  canvasHeight: number;
  viewportHeight: number;
}

export function drawWheelFrame({
  ctx,
  canvasWidth,
  canvasHeight,
  viewportHeight,
}: WheelFrameProps): void {
  // Center the frame vertically in the viewport (which starts at y=40)
  const wheelTop = 40;
  const centerY = wheelTop + viewportHeight / 2;
  const wheelLeft = (canvasWidth - 350) / 2 - 10;
  const wheelWidth = 350 + 20;
  const cornerRadius = 20;

  // Draw selection indicator (the center line where winner is shown)
  ctx.save();

  // Draw subtle guide lines
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);

  // Top guide line
  ctx.beginPath();
  ctx.moveTo(20, centerY - 40);
  ctx.lineTo(canvasWidth - 20, centerY - 40);
  ctx.stroke();

  // Bottom guide line
  ctx.beginPath();
  ctx.moveTo(20, centerY + 40);
  ctx.lineTo(canvasWidth - 20, centerY + 40);
  ctx.stroke();

  ctx.setLineDash([]);

  // Draw selection arrows pointing inward to center
  const arrowSize = 15;
  const arrowX = 15;

  // Left arrow (pointing right toward center)
  ctx.fillStyle = "#ff1493"; // Hot pink
  ctx.beginPath();
  ctx.moveTo(arrowX + arrowSize, centerY); // Point of arrow
  ctx.lineTo(arrowX, centerY - arrowSize / 2); // Top of base
  ctx.lineTo(arrowX, centerY + arrowSize / 2); // Bottom of base
  ctx.closePath();
  ctx.fill();

  // Right arrow (pointing left toward center)
  ctx.beginPath();
  ctx.moveTo(canvasWidth - arrowX - arrowSize, centerY); // Point of arrow
  ctx.lineTo(canvasWidth - arrowX, centerY - arrowSize / 2); // Top of base
  ctx.lineTo(canvasWidth - arrowX, centerY + arrowSize / 2); // Bottom of base
  ctx.closePath();
  ctx.fill();

  // Draw glow effect around center area
  const glowGradient = ctx.createLinearGradient(
    0,
    centerY - 40,
    0,
    centerY + 40,
  );
  glowGradient.addColorStop(0, "rgba(255, 215, 0, 0)");
  glowGradient.addColorStop(0.5, "rgba(255, 215, 0, 0.1)");
  glowGradient.addColorStop(1, "rgba(255, 215, 0, 0)");

  ctx.fillStyle = glowGradient;
  ctx.fillRect(0, centerY - 40, canvasWidth, 80);

  // Draw top and bottom shadows for depth - covering full canvas
  // Top shadow from canvas top to wheel top area
  const topShadow = ctx.createLinearGradient(0, 0, 0, wheelTop + 80);
  topShadow.addColorStop(0, "rgba(0, 0, 0, 0.9)");
  topShadow.addColorStop(0.5, "rgba(0, 0, 0, 0.7)");
  topShadow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = topShadow;
  ctx.fillRect(0, 0, canvasWidth, wheelTop + 80);

  // Bottom shadow from wheel bottom to canvas bottom
  const bottomShadow = ctx.createLinearGradient(
    0,
    wheelTop + viewportHeight - 80,
    0,
    canvasHeight,
  );
  bottomShadow.addColorStop(0, "rgba(0, 0, 0, 0)");
  bottomShadow.addColorStop(0.5, "rgba(0, 0, 0, 0.7)");
  bottomShadow.addColorStop(1, "rgba(0, 0, 0, 0.9)");
  ctx.fillStyle = bottomShadow;
  ctx.fillRect(
    0,
    wheelTop + viewportHeight - 80,
    canvasWidth,
    canvasHeight - (wheelTop + viewportHeight - 80),
  );

  // Draw rounded border frame
  ctx.strokeStyle = "rgba(255, 215, 0, 0.3)"; // Golden border
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(wheelLeft + cornerRadius, wheelTop);
  ctx.lineTo(wheelLeft + wheelWidth - cornerRadius, wheelTop);
  ctx.quadraticCurveTo(
    wheelLeft + wheelWidth,
    wheelTop,
    wheelLeft + wheelWidth,
    wheelTop + cornerRadius,
  );
  ctx.lineTo(wheelLeft + wheelWidth, wheelTop + viewportHeight - cornerRadius);
  ctx.quadraticCurveTo(
    wheelLeft + wheelWidth,
    wheelTop + viewportHeight,
    wheelLeft + wheelWidth - cornerRadius,
    wheelTop + viewportHeight,
  );
  ctx.lineTo(wheelLeft + cornerRadius, wheelTop + viewportHeight);
  ctx.quadraticCurveTo(
    wheelLeft,
    wheelTop + viewportHeight,
    wheelLeft,
    wheelTop + viewportHeight - cornerRadius,
  );
  ctx.lineTo(wheelLeft, wheelTop + cornerRadius);
  ctx.quadraticCurveTo(wheelLeft, wheelTop, wheelLeft + cornerRadius, wheelTop);
  ctx.closePath();
  ctx.stroke();

  // Add inner glow
  const innerGlow = ctx.createRadialGradient(
    canvasWidth / 2,
    centerY,
    0,
    canvasWidth / 2,
    centerY,
    wheelWidth / 2,
  );
  innerGlow.addColorStop(0, "rgba(255, 215, 0, 0)");
  innerGlow.addColorStop(0.8, "rgba(255, 215, 0, 0)");
  innerGlow.addColorStop(1, "rgba(255, 215, 0, 0.15)");

  ctx.strokeStyle = innerGlow;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();
}
