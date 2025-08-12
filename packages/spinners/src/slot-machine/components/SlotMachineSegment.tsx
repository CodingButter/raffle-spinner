/**
 * Wheel Segment Component
 *
 * Purpose: Renders individual participant segments on the slot machine wheel
 * with 3D perspective effects and proper styling.
 *
 * SRS Reference:
 * - FR-2.2: Winner Selection and Animation (visual representation)
 */

import { Participant, ThemeSettings } from "@raffle-spinner/storage";

// Convert hex color to rgba
const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

interface WheelSegmentProps {
  participant: Participant;
  yPos: number;
  itemIndex: number;
  itemHeight: number;
  viewportHeight: number;
  wheelWidth: number;
  canvasWidth: number;
  perspectiveScale: number;
  ctx: CanvasRenderingContext2D;
  theme: ThemeSettings;
}

export function drawSlotMachineSegment({
  participant,
  yPos,
  itemIndex,
  itemHeight,
  viewportHeight,
  wheelWidth,
  canvasWidth,
  perspectiveScale,
  ctx,
  theme,
}: WheelSegmentProps) {
  const centerY = viewportHeight / 2 + 40;
  const distanceFromCenter = Math.abs(yPos + itemHeight / 2 - centerY);
  const perspectiveFactor =
    1 - (distanceFromCenter / (viewportHeight / 2)) * perspectiveScale;

  // Skip items that are completely outside viewport
  if (yPos > viewportHeight + 80 || yPos < -itemHeight) return;

  // Calculate opacity based on distance from center
  const opacity = Math.max(
    0.3,
    1 - (distanceFromCenter / (viewportHeight / 2)) * 0.7,
  );

  // Draw the segment with 3D effect
  ctx.save();

  // Apply perspective transformation
  const scaledWidth = wheelWidth * perspectiveFactor;
  const xOffset = (canvasWidth - scaledWidth) / 2;

  // Draw segment background with gradient for 3D effect
  const segmentGradient = ctx.createLinearGradient(
    xOffset,
    yPos,
    xOffset + scaledWidth,
    yPos,
  );

  // Parse the background color from theme
  const bgColor = theme.spinnerStyle.backgroundColor;

  // Use theme background color with alternating opacity for depth
  const isEven = itemIndex % 2 === 0;
  const baseAlpha = isEven ? opacity : opacity * 0.7;

  segmentGradient.addColorStop(0, hexToRgba(bgColor, baseAlpha * 0.8));
  segmentGradient.addColorStop(0.5, hexToRgba(bgColor, baseAlpha));
  segmentGradient.addColorStop(1, hexToRgba(bgColor, baseAlpha * 0.8));

  ctx.fillStyle = segmentGradient;
  ctx.fillRect(xOffset, yPos, scaledWidth, itemHeight - 2);

  // Draw borders using theme border color
  ctx.strokeStyle = hexToRgba(theme.spinnerStyle.borderColor, opacity * 0.3);
  ctx.lineWidth = 1;
  ctx.strokeRect(xOffset, yPos, scaledWidth, itemHeight - 2);

  // Draw highlight on top edge using highlight color
  ctx.strokeStyle = hexToRgba(theme.spinnerStyle.highlightColor, opacity * 0.5);
  ctx.beginPath();
  ctx.moveTo(xOffset, yPos);
  ctx.lineTo(xOffset + scaledWidth, yPos);
  ctx.stroke();

  // Draw shadow on bottom edge
  ctx.strokeStyle = `rgba(0, 0, 0, ${opacity * 0.5})`;
  ctx.beginPath();
  ctx.moveTo(xOffset, yPos + itemHeight - 2);
  ctx.lineTo(xOffset + scaledWidth, yPos + itemHeight - 2);
  ctx.stroke();

  // Get font sizes from theme
  const nameSizes = {
    small: 14,
    medium: 16,
    large: 20,
    "extra-large": 24,
  };
  const ticketSizes = {
    small: 18,
    medium: 24,
    large: 32,
    "extra-large": 40,
  };

  const nameSize = nameSizes[theme.spinnerStyle.nameSize];
  const ticketSize = ticketSizes[theme.spinnerStyle.ticketSize];
  const fontFamily = theme.spinnerStyle.fontFamily || "sans-serif";

  // Draw name with theme color and size
  const nameColor = theme.spinnerStyle.nameColor;
  ctx.fillStyle = hexToRgba(nameColor, opacity);
  ctx.font = `bold ${nameSize * perspectiveFactor}px ${fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const name = `${participant.firstName} ${participant.lastName}`;
  ctx.fillText(name, canvasWidth / 2, yPos + itemHeight / 2 - 15);

  // Draw ticket with theme color and size
  const ticketColor = theme.spinnerStyle.ticketColor;
  ctx.fillStyle = hexToRgba(ticketColor, opacity);
  ctx.font = `bold ${ticketSize * perspectiveFactor}px ${fontFamily}`;

  const ticket = `#${participant.ticketNumber}`;
  ctx.fillText(ticket, canvasWidth / 2, yPos + itemHeight / 2 + 15);

  ctx.restore();
}
