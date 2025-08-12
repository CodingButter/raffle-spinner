/**
 * Wheel Segment Component
 *
 * Renders individual participant segments on the slot machine wheel
 * with 3D perspective effects and proper styling.
 */

import { Participant } from "@raffle-spinner/storage";
import { SpinnerTheme, DEFAULT_SPINNER_THEME } from "../../types";

/**
 * Convert color to rgba format
 * Handles hex colors, rgb/rgba, hsl/hsla, and CSS variables
 */
const colorToRgba = (color: string, alpha: number): string => {
  // If it's already an rgba/rgb/hsl/hsla color or CSS variable, adjust alpha
  if (
    color.startsWith("rgb") ||
    color.startsWith("hsl") ||
    color.includes("var(")
  ) {
    // For CSS variables and complex colors, create a semi-transparent overlay
    // This is a fallback approach that works with any color format
    if (color.includes("var(")) {
      // Use the color as-is with opacity applied via globalAlpha or rgba overlay
      return `rgba(0, 0, 0, ${alpha})`;
    }

    // Handle rgb/rgba
    if (color.startsWith("rgb")) {
      const match = color.match(/rgba?\(([^)]+)\)/);
      if (match) {
        const values = match[1].split(",").map((v) => v.trim());
        if (values.length === 3) {
          return `rgba(${values[0]}, ${values[1]}, ${values[2]}, ${alpha})`;
        } else if (values.length === 4) {
          // Replace existing alpha
          return `rgba(${values[0]}, ${values[1]}, ${values[2]}, ${alpha})`;
        }
      }
    }

    // For hsl/hsla, return as-is (canvas supports these formats)
    if (color.startsWith("hsl")) {
      const match = color.match(/hsla?\(([^)]+)\)/);
      if (match) {
        const values = match[1].split(",").map((v) => v.trim());
        if (values.length === 3) {
          return `hsla(${values[0]}, ${values[1]}, ${values[2]}, ${alpha})`;
        } else if (values.length === 4) {
          // Replace existing alpha
          return `hsla(${values[0]}, ${values[1]}, ${values[2]}, ${alpha})`;
        }
      }
    }
  }

  // Handle hex colors
  if (color.startsWith("#")) {
    let r: number, g: number, b: number;

    if (color.length === 4) {
      r = parseInt(color[1] + color[1], 16);
      g = parseInt(color[2] + color[2], 16);
      b = parseInt(color[3] + color[3], 16);
    } else if (color.length === 7) {
      r = parseInt(color.slice(1, 3), 16);
      g = parseInt(color.slice(3, 5), 16);
      b = parseInt(color.slice(5, 7), 16);
    } else {
      // Invalid hex color, return a default
      return `rgba(128, 128, 128, ${alpha})`;
    }

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // Named colors or other formats - return with opacity
  // Canvas context will handle named colors
  return color;
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
  theme?: SpinnerTheme;
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
  theme = DEFAULT_SPINNER_THEME,
}: WheelSegmentProps): void {
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

  // Use theme background color with alternating opacity for depth
  const bgColor =
    theme.backgroundColor || DEFAULT_SPINNER_THEME.backgroundColor!;
  const isEven = itemIndex % 2 === 0;
  const baseAlpha = isEven ? opacity : opacity * 0.7;

  segmentGradient.addColorStop(0, colorToRgba(bgColor, baseAlpha * 0.8));
  segmentGradient.addColorStop(0.5, colorToRgba(bgColor, baseAlpha));
  segmentGradient.addColorStop(1, colorToRgba(bgColor, baseAlpha * 0.8));

  ctx.fillStyle = segmentGradient;
  ctx.fillRect(xOffset, yPos, scaledWidth, itemHeight - 2);

  // Draw borders
  const borderColor = theme.borderColor || DEFAULT_SPINNER_THEME.borderColor!;
  ctx.strokeStyle = colorToRgba(borderColor, opacity * 0.3);
  ctx.lineWidth = 1;
  ctx.strokeRect(xOffset, yPos, scaledWidth, itemHeight - 2);

  // Draw highlight on top edge
  const highlightColor =
    theme.highlightColor || DEFAULT_SPINNER_THEME.highlightColor!;
  ctx.strokeStyle = colorToRgba(highlightColor, opacity * 0.5);
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

  const nameSize = nameSizes[theme.nameSize || "medium"];
  const ticketSize = ticketSizes[theme.ticketSize || "large"];
  const fontFamily = theme.fontFamily || DEFAULT_SPINNER_THEME.fontFamily!;

  // Draw name
  const nameColor = theme.nameColor || DEFAULT_SPINNER_THEME.nameColor!;
  ctx.fillStyle = colorToRgba(nameColor, opacity);
  ctx.font = `bold ${nameSize * perspectiveFactor}px ${fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const name = `${participant.firstName} ${participant.lastName}`;
  ctx.fillText(name, canvasWidth / 2, yPos + itemHeight / 2 - 15);

  // Draw ticket
  const ticketColor = theme.ticketColor || DEFAULT_SPINNER_THEME.ticketColor!;
  ctx.fillStyle = colorToRgba(ticketColor, opacity);
  ctx.font = `bold ${ticketSize * perspectiveFactor}px ${fontFamily}`;

  const ticket = `#${participant.ticketNumber}`;
  ctx.fillText(ticket, canvasWidth / 2, yPos + itemHeight / 2 + 15);

  ctx.restore();
}
