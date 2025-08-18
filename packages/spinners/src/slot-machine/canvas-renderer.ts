/**
 * High-Performance Canvas Renderer
 * 
 * Optimized canvas rendering system for slot machine wheel visualization.
 * Features caching, minimal redraws, and efficient memory usage.
 */

import { Participant } from '@raffle-spinner/storage';
import { adjustBrightness } from '@drawday/utils';
import { drawSlotMachineSegment } from './components/SlotMachineSegment';
import { drawSlotMachineFrame } from './components/SlotMachineFrame';
import {
  ITEM_HEIGHT,
  VISIBLE_ITEMS,
  VIEWPORT_HEIGHT,
  WHEEL_WIDTH,
  PERSPECTIVE_SCALE,
  FRAME_BORDER_WIDTH,
  RENDER_BUFFER_SIZE
} from './slot-machine-constants';

export interface CanvasRendererOptions {
  canvasWidth: number;
  canvasHeight: number;
  theme: any;
  showDebug?: boolean;
}

export class OptimizedCanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private options: CanvasRendererOptions;
  private gradientCache = new Map<string, CanvasGradient>();
  private lastPosition = -Infinity;
  private lastSubsetHash = '';

  constructor(canvas: HTMLCanvasElement, options: CanvasRendererOptions) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.options = options;
    
    // Set up canvas for optimal rendering
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
  }

  /**
   * Creates a cached gradient to avoid recreation on every frame
   */
  private getCachedGradient(key: string, creator: () => CanvasGradient): CanvasGradient {
    if (!this.gradientCache.has(key)) {
      this.gradientCache.set(key, creator());
    }
    return this.gradientCache.get(key)!;
  }

  /**
   * Generates a hash for the participant subset to detect changes
   */
  private hashSubset(subset: Participant[]): string {
    return subset.map(p => `${p.ticketNumber}:${p.firstName}:${p.lastName}`).join('|');
  }

  /**
   * Optimized wheel rendering with intelligent caching
   */
  renderWheel(currentPosition: number, subset: Participant[]): void {
    if (!subset.length) return;

    const subsetHash = this.hashSubset(subset);
    const positionChanged = Math.abs(currentPosition - this.lastPosition) > 0.1;
    const subsetChanged = subsetHash !== this.lastSubsetHash;

    // Skip render if nothing significant changed
    if (!positionChanged && !subsetChanged) return;

    this.lastPosition = currentPosition;
    this.lastSubsetHash = subsetHash;

    // Clear canvas efficiently
    this.ctx.clearRect(0, 0, this.options.canvasWidth, this.options.canvasHeight);

    // Define viewport area
    const VIEWPORT_TOP = FRAME_BORDER_WIDTH;
    const VIEWPORT_LEFT = FRAME_BORDER_WIDTH;
    const VIEWPORT_WIDTH = this.options.canvasWidth - FRAME_BORDER_WIDTH * 2;
    const VIEWPORT_BOTTOM = VIEWPORT_TOP + VIEWPORT_HEIGHT;

    // Save context state
    this.ctx.save();

    // Create clipping region for viewport
    this.ctx.beginPath();
    this.ctx.rect(VIEWPORT_LEFT, VIEWPORT_TOP, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
    this.ctx.clip();

    // Draw background with cached gradient
    this.drawBackground(VIEWPORT_LEFT, VIEWPORT_TOP, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

    // Calculate visible range more efficiently
    const wheelCircumference = subset.length * ITEM_HEIGHT;
    const normalizedPos = ((currentPosition % wheelCircumference) + wheelCircumference) % wheelCircumference;
    const topParticipantIndex = Math.floor(normalizedPos / ITEM_HEIGHT);
    const pixelOffset = normalizedPos % ITEM_HEIGHT;

    // Render only visible participants + buffer
    this.renderVisibleParticipants(
      subset,
      topParticipantIndex,
      pixelOffset,
      VIEWPORT_TOP
    );

    // Draw shadow overlays with cached gradients
    this.drawShadowOverlays(VIEWPORT_LEFT, VIEWPORT_TOP, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

    // Restore context
    this.ctx.restore();

    // Draw frame on top
    drawSlotMachineFrame({
      ctx: this.ctx,
      canvasWidth: this.options.canvasWidth,
      viewportHeight: VIEWPORT_HEIGHT,
      theme: this.options.theme,
    });
  }

  private drawBackground(left: number, top: number, width: number, height: number): void {
    const bgColor = this.options.theme?.spinnerStyle?.backgroundColor;
    if (!bgColor || bgColor === 'transparent') return;

    const gradientKey = `bg:${bgColor}:${height}`;
    const gradient = this.getCachedGradient(gradientKey, () => {
      const grad = this.ctx.createLinearGradient(0, top, 0, top + height);
      grad.addColorStop(0, adjustBrightness(bgColor, -20));
      grad.addColorStop(0.5, bgColor);
      grad.addColorStop(1, adjustBrightness(bgColor, -20));
      return grad;
    });

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(left, top, width, height);
  }

  private renderVisibleParticipants(
    subset: Participant[],
    topIndex: number,
    pixelOffset: number,
    viewportTop: number
  ): void {
    // Render from buffer above to buffer below
    for (let i = -RENDER_BUFFER_SIZE; i <= VISIBLE_ITEMS + RENDER_BUFFER_SIZE; i++) {
      let participantIndex = (topIndex + i) % subset.length;
      if (participantIndex < 0) {
        participantIndex += subset.length;
      }

      const participant = subset[participantIndex];
      const yPosition = i * ITEM_HEIGHT - pixelOffset + viewportTop;

      // Skip if completely outside extended viewport
      if (yPosition + ITEM_HEIGHT < -ITEM_HEIGHT || yPosition > VIEWPORT_HEIGHT + ITEM_HEIGHT) {
        continue;
      }

      drawSlotMachineSegment({
        participant,
        yPos: yPosition,
        itemIndex: participantIndex,
        itemHeight: ITEM_HEIGHT,
        viewportHeight: VIEWPORT_HEIGHT,
        wheelWidth: WHEEL_WIDTH,
        canvasWidth: this.options.canvasWidth,
        perspectiveScale: PERSPECTIVE_SCALE,
        ctx: this.ctx,
        theme: this.options.theme,
      });

      // Debug information
      if (this.options.showDebug) {
        this.drawDebugInfo(i, participantIndex, yPosition);
      }
    }
  }

  private drawShadowOverlays(left: number, top: number, width: number, height: number): void {
    const topOpacity = this.options.theme?.spinnerStyle?.topShadowOpacity ?? 0.3;
    const bottomOpacity = this.options.theme?.spinnerStyle?.bottomShadowOpacity ?? 0.3;
    const shadowSize = (this.options.theme?.spinnerStyle?.shadowSize ?? 30) / 100;
    const shadowColor = this.options.theme?.spinnerStyle?.shadowColor || 
                       this.options.theme?.spinnerStyle?.backgroundColor || 
                       '#1a1a1a';

    // Parse shadow color to RGB
    const rgb = this.hexToRgb(shadowColor);

    // Top shadow
    if (topOpacity > 0) {
      const topShadowHeight = height * shadowSize;
      const topKey = `top:${shadowColor}:${topOpacity}:${topShadowHeight}`;
      const topGradient = this.getCachedGradient(topKey, () => {
        const grad = this.ctx.createLinearGradient(0, top, 0, top + topShadowHeight);
        grad.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${topOpacity})`);
        grad.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
        return grad;
      });
      
      this.ctx.fillStyle = topGradient;
      this.ctx.fillRect(left, top, width, topShadowHeight);
    }

    // Bottom shadow
    if (bottomOpacity > 0) {
      const bottomShadowHeight = height * shadowSize;
      const bottomStart = top + height - bottomShadowHeight;
      const bottomKey = `bottom:${shadowColor}:${bottomOpacity}:${bottomShadowHeight}`;
      const bottomGradient = this.getCachedGradient(bottomKey, () => {
        const grad = this.ctx.createLinearGradient(0, bottomStart, 0, top + height);
        grad.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
        grad.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${bottomOpacity})`);
        return grad;
      });
      
      this.ctx.fillStyle = bottomGradient;
      this.ctx.fillRect(left, bottomStart, width, bottomShadowHeight);
    }
  }

  private drawDebugInfo(i: number, participantIndex: number, yPosition: number): void {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    this.ctx.font = '10px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`i=${i}, idx=${participantIndex}`, 10, yPosition + ITEM_HEIGHT / 2);
    
    if (i === 2) { // Center position
      this.ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
      this.ctx.fillText('← CENTER', 60, yPosition + ITEM_HEIGHT / 2);
    }
    this.ctx.restore();
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
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
   * Clear all caches when theme or canvas size changes
   */
  clearCaches(): void {
    this.gradientCache.clear();
    this.lastPosition = -Infinity;
    this.lastSubsetHash = '';
  }

  /**
   * Update options and clear relevant caches
   */
  updateOptions(newOptions: Partial<CanvasRendererOptions>): void {
    const themeChanged = newOptions.theme && newOptions.theme !== this.options.theme;
    const sizeChanged = (newOptions.canvasWidth && newOptions.canvasWidth !== this.options.canvasWidth) ||
                       (newOptions.canvasHeight && newOptions.canvasHeight !== this.options.canvasHeight);

    this.options = { ...this.options, ...newOptions };

    if (themeChanged || sizeChanged) {
      this.clearCaches();
    }
  }
}