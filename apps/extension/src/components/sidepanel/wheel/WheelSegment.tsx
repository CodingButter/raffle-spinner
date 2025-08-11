/**
 * Wheel Segment Component
 *
 * Purpose: Renders individual participant segments on the slot machine wheel
 * with 3D perspective effects and proper styling.
 *
 * SRS Reference:
 * - FR-2.2: Winner Selection and Animation (visual representation)
 */

import { Participant } from '@raffle-spinner/storage';

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
}

export function drawWheelSegment({
  participant,
  yPos,
  itemIndex,
  itemHeight,
  viewportHeight,
  wheelWidth,
  canvasWidth,
  perspectiveScale,
  ctx,
}: WheelSegmentProps) {
  const centerY = viewportHeight / 2 + 40;
  const distanceFromCenter = Math.abs(yPos + itemHeight / 2 - centerY);
  const perspectiveFactor = 1 - (distanceFromCenter / (viewportHeight / 2)) * perspectiveScale;

  // Skip items that are completely outside viewport
  if (yPos > viewportHeight + 80 || yPos < -itemHeight) return;

  // Calculate opacity based on distance from center
  const opacity = Math.max(0.3, 1 - (distanceFromCenter / (viewportHeight / 2)) * 0.7);

  // Draw the segment with 3D effect
  ctx.save();

  // Apply perspective transformation
  const scaledWidth = wheelWidth * perspectiveFactor;
  const xOffset = (canvasWidth - scaledWidth) / 2;

  // Draw segment background with gradient for 3D effect
  const segmentGradient = ctx.createLinearGradient(xOffset, yPos, xOffset + scaledWidth, yPos);

  // Alternate colors for segments
  const isEven = itemIndex % 2 === 0;
  if (isEven) {
    segmentGradient.addColorStop(0, `rgba(59, 130, 246, ${opacity * 0.8})`);
    segmentGradient.addColorStop(0.5, `rgba(59, 130, 246, ${opacity})`);
    segmentGradient.addColorStop(1, `rgba(59, 130, 246, ${opacity * 0.8})`);
  } else {
    segmentGradient.addColorStop(0, `rgba(30, 64, 175, ${opacity * 0.8})`);
    segmentGradient.addColorStop(0.5, `rgba(30, 64, 175, ${opacity})`);
    segmentGradient.addColorStop(1, `rgba(30, 64, 175, ${opacity * 0.8})`);
  }

  ctx.fillStyle = segmentGradient;
  ctx.fillRect(xOffset, yPos, scaledWidth, itemHeight - 2);

  // Draw borders for depth
  ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.3})`;
  ctx.lineWidth = 1;
  ctx.strokeRect(xOffset, yPos, scaledWidth, itemHeight - 2);

  // Draw highlight on top edge for 3D effect
  ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.5})`;
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

  // Draw text with perspective scaling
  ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
  ctx.font = `bold ${16 * perspectiveFactor}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const name = `${participant.firstName} ${participant.lastName}`;
  const ticket = `Ticket #${participant.ticketNumber}`;

  ctx.fillText(name, canvasWidth / 2, yPos + itemHeight / 2 - 12);
  ctx.font = `${14 * perspectiveFactor}px sans-serif`;
  ctx.fillText(ticket, canvasWidth / 2, yPos + itemHeight / 2 + 12);

  ctx.restore();
}
