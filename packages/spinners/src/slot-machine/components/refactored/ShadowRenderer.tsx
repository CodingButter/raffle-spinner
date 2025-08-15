/**
 * ShadowRenderer Component
 * 
 * Handles shadow overlay rendering for the slot machine wheel.
 * Manages gradient shadows for top and bottom of viewport.
 * 
 * @module ShadowRenderer
 */

import { VIEWPORT_HEIGHT } from '../../constants';
import { InternalTheme } from './SegmentRenderer';

/**
 * Parses hex color to RGB values
 */
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 26, g: 26, b: 26 }; // Fallback to #1a1a1a
}

/**
 * Draws shadow overlays on top and bottom of the wheel
 */
export function drawShadowOverlays(
  ctx: CanvasRenderingContext2D,
  theme: InternalTheme,
  viewportTop: number,
  viewportLeft: number,
  viewportWidth: number,
  viewportBottom: number
): void {
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
    const topShadowHeight = VIEWPORT_HEIGHT * shadowSize;
    const topGradient = ctx.createLinearGradient(
      0,
      viewportTop,
      0,
      viewportTop + topShadowHeight
    );
    topGradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${topShadowOpacity})`);
    topGradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
    ctx.fillStyle = topGradient;
    ctx.fillRect(viewportLeft, viewportTop, viewportWidth, topShadowHeight);
  }

  // Bottom shadow gradient - within viewport only
  if (bottomShadowOpacity > 0) {
    const bottomShadowHeight = VIEWPORT_HEIGHT * shadowSize;
    const bottomStart = viewportBottom - bottomShadowHeight;
    const bottomGradient = ctx.createLinearGradient(0, bottomStart, 0, viewportBottom);
    bottomGradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
    bottomGradient.addColorStop(
      1,
      `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${bottomShadowOpacity})`
    );
    ctx.fillStyle = bottomGradient;
    ctx.fillRect(viewportLeft, bottomStart, viewportWidth, bottomShadowHeight);
  }
}