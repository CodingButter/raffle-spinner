/**
 * SlotMachineRenderer Utility
 * 
 * High-performance canvas rendering utilities for the slot machine wheel.
 * Optimized for 60fps performance with 5000+ participants.
 * 
 * @module SlotMachineRenderer
 * @category Performance Utils
 */

import { Participant } from '@raffle-spinner/storage';
import { drawSlotMachineSegment } from '../components/SlotMachineSegment';
import { drawSlotMachineFrame } from '../components/SlotMachineFrame';

// Visual constants optimized for performance
export const ITEM_HEIGHT = 80;
export const VISIBLE_ITEMS = 5;
export const VIEWPORT_HEIGHT = VISIBLE_ITEMS * ITEM_HEIGHT;
export const WHEEL_WIDTH = 350;
export const PERSPECTIVE_SCALE = 0.15;
export const FRAME_BORDER_WIDTH = 8;

export interface RenderConfig {
  canvasWidth: number;
  canvasHeight: number;
  showDebug: boolean;
}

export interface ThemeSettings {
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
 * Adjusts the brightness of a hex color for performance-optimized gradients
 */
export function adjustBrightness(color: string, percent: number): string {
  if (!color.startsWith('#')) return color;
  
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, ((num >> 16) & 255) + percent));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 255) + percent));
  const b = Math.max(0, Math.min(255, (num & 255) + percent));
  
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/**
 * Parses hex color to RGB for shadow rendering optimization
 */
export function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 26, g: 26, b: 26 }; // Fallback
}

/**
 * Renders the main wheel visualization with performance optimizations
 */
export function renderWheel(
  ctx: CanvasRenderingContext2D,
  currentPosition: number,
  subset: Participant[],
  theme: ThemeSettings,
  config: RenderConfig
): void {
  if (subset.length === 0) return;

  const { canvasWidth, canvasHeight, showDebug } = config;
  
  // Clear canvas efficiently
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // Define viewport boundaries
  const VIEWPORT_TOP = FRAME_BORDER_WIDTH;
  const VIEWPORT_LEFT = FRAME_BORDER_WIDTH;
  const VIEWPORT_WIDTH = canvasWidth - FRAME_BORDER_WIDTH * 2;
  const VIEWPORT_BOTTOM = VIEWPORT_TOP + VIEWPORT_HEIGHT;

  // Setup clipping region for performance
  ctx.save();
  ctx.beginPath();
  ctx.rect(VIEWPORT_LEFT, VIEWPORT_TOP, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
  ctx.clip();

  // Render background if needed
  renderBackground(ctx, theme, VIEWPORT_LEFT, VIEWPORT_TOP, VIEWPORT_WIDTH, VIEWPORT_HEIGHT, VIEWPORT_BOTTOM);

  // Calculate wheel physics
  const wheelCircumference = subset.length * ITEM_HEIGHT;
  const normalizedPos = ((currentPosition % wheelCircumference) + wheelCircumference) % wheelCircumference;
  const topParticipantIndex = Math.floor(normalizedPos / ITEM_HEIGHT);
  const pixelOffset = normalizedPos % ITEM_HEIGHT;

  // Render participants efficiently
  renderParticipants(ctx, subset, topParticipantIndex, pixelOffset, VIEWPORT_TOP, theme, config);

  // Render shadow overlays
  renderShadowOverlays(ctx, theme, VIEWPORT_LEFT, VIEWPORT_TOP, VIEWPORT_WIDTH, VIEWPORT_HEIGHT, VIEWPORT_BOTTOM);

  // Restore context and render frame
  ctx.restore();
  
  drawSlotMachineFrame({
    ctx,
    canvasWidth,
    viewportHeight: VIEWPORT_HEIGHT,
    theme,
  });
}

/**
 * Renders the wheel background with performance optimization
 */
function renderBackground(
  ctx: CanvasRenderingContext2D,
  theme: ThemeSettings,
  left: number,
  top: number,
  width: number,
  height: number,
  bottom: number
): void {
  const backgroundColor = theme?.spinnerStyle?.backgroundColor;
  if (!backgroundColor || backgroundColor === 'transparent') return;

  const gradient = ctx.createLinearGradient(0, top, 0, bottom);
  gradient.addColorStop(0, adjustBrightness(backgroundColor, -20));
  gradient.addColorStop(0.5, backgroundColor);
  gradient.addColorStop(1, adjustBrightness(backgroundColor, -20));
  
  ctx.fillStyle = gradient;
  ctx.fillRect(left, top, width, height);
}

/**
 * Renders participants with optimized loop
 */
function renderParticipants(
  ctx: CanvasRenderingContext2D,
  subset: Participant[],
  topIndex: number,
  pixelOffset: number,
  viewportTop: number,
  theme: ThemeSettings,
  config: RenderConfig
): void {
  // Render only visible items plus small buffer for smooth scrolling
  for (let i = -2; i <= VISIBLE_ITEMS + 2; i++) {
    let participantIndex = (topIndex + i) % subset.length;
    if (participantIndex < 0) participantIndex += subset.length;

    const participant = subset[participantIndex];
    const yPosition = i * ITEM_HEIGHT - pixelOffset + viewportTop;
    const isCenter = i === 2;

    // Draw participant segment
    drawSlotMachineSegment({
      participant,
      yPos: yPosition,
      itemIndex: participantIndex,
      itemHeight: ITEM_HEIGHT,
      viewportHeight: VIEWPORT_HEIGHT,
      wheelWidth: WHEEL_WIDTH,
      canvasWidth: config.canvasWidth,
      perspectiveScale: PERSPECTIVE_SCALE,
      ctx,
      theme,
    });

    // Debug rendering (only in development)
    if (config.showDebug && process.env.NODE_ENV === 'development') {
      renderDebugInfo(ctx, i, participantIndex, yPosition, isCenter);
    }
  }
}

/**
 * Renders debug information for development
 */
function renderDebugInfo(
  ctx: CanvasRenderingContext2D,
  i: number,
  participantIndex: number,
  yPosition: number,
  isCenter: boolean
): void {
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

/**
 * Renders shadow overlays with performance optimization
 */
function renderShadowOverlays(
  ctx: CanvasRenderingContext2D,
  theme: ThemeSettings,
  left: number,
  top: number,
  width: number,
  height: number,
  bottom: number
): void {
  const topShadowOpacity = theme?.spinnerStyle?.topShadowOpacity ?? 0.3;
  const bottomShadowOpacity = theme?.spinnerStyle?.bottomShadowOpacity ?? 0.3;
  const shadowSize = (theme?.spinnerStyle?.shadowSize ?? 30) / 100;
  const shadowColor = theme?.spinnerStyle?.shadowColor || 
                     theme?.spinnerStyle?.backgroundColor || 
                     '#1a1a1a';

  const rgb = hexToRgb(shadowColor);

  // Top shadow
  if (topShadowOpacity > 0) {
    const topShadowHeight = height * shadowSize;
    const topGradient = ctx.createLinearGradient(0, top, 0, top + topShadowHeight);
    topGradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${topShadowOpacity})`);
    topGradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
    ctx.fillStyle = topGradient;
    ctx.fillRect(left, top, width, topShadowHeight);
  }

  // Bottom shadow
  if (bottomShadowOpacity > 0) {
    const bottomShadowHeight = height * shadowSize;
    const bottomStart = bottom - bottomShadowHeight;
    const bottomGradient = ctx.createLinearGradient(0, bottomStart, 0, bottom);
    bottomGradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
    bottomGradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${bottomShadowOpacity})`);
    ctx.fillStyle = bottomGradient;
    ctx.fillRect(left, bottomStart, width, bottomShadowHeight);
  }
}