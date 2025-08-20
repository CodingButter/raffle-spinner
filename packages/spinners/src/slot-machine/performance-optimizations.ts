/**
 * Canvas Performance Optimizations for SlotMachineWheel in Iframe Context
 * Target: Maintain p95 60fps (16.67ms per frame) with 5000+ participants
 * 
 * Key optimizations:
 * 1. OffscreenCanvas for background processing
 * 2. GPU-accelerated rendering
 * 3. Intelligent frame skipping
 * 4. Memory-efficient caching
 * 5. Iframe-specific optimizations
 */

// Performance monitoring utilities
export class CanvasPerformanceMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private frameTimes: number[] = [];
  private readonly maxSamples = 60; // Track last 60 frames

  recordFrame(): number {
    const now = performance.now();
    const frameTime = now - this.lastTime;
    this.lastTime = now;
    
    this.frameTimes.push(frameTime);
    if (this.frameTimes.length > this.maxSamples) {
      this.frameTimes.shift();
    }
    
    this.frameCount++;
    return frameTime;
  }

  getCurrentFPS(): number {
    if (this.frameTimes.length === 0) return 0;
    const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    return 1000 / avgFrameTime;
  }

  getP95FrameTime(): number {
    if (this.frameTimes.length === 0) return 0;
    const sorted = [...this.frameTimes].sort((a, b) => a - b);
    const p95Index = Math.floor(sorted.length * 0.95);
    return sorted[p95Index];
  }

  getPerformanceReport() {
    return {
      currentFPS: this.getCurrentFPS(),
      p95FrameTime: this.getP95FrameTime(),
      p95FPS: 1000 / this.getP95FrameTime(),
      totalFrames: this.frameCount,
      meetsTarget: this.getP95FrameTime() <= 16.67
    };
  }
}

// OffscreenCanvas utilities for iframe-safe background processing
export class OffscreenCanvasManager {
  private offscreenCanvas: OffscreenCanvas | HTMLCanvasElement;
  private offscreenCtx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
  private isOffscreenSupported: boolean;

  constructor(width: number, height: number) {
    this.isOffscreenSupported = typeof OffscreenCanvas !== 'undefined';
    
    if (this.isOffscreenSupported) {
      this.offscreenCanvas = new OffscreenCanvas(width, height);
      this.offscreenCtx = this.offscreenCanvas.getContext('2d')!;
    } else {
      // Fallback for iframes that don't support OffscreenCanvas
      this.offscreenCanvas = document.createElement('canvas');
      this.offscreenCanvas.width = width;
      this.offscreenCanvas.height = height;
      this.offscreenCtx = this.offscreenCanvas.getContext('2d')!;
    }
  }

  getCanvas(): OffscreenCanvas | HTMLCanvasElement {
    return this.offscreenCanvas;
  }

  getContext(): OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D {
    return this.offscreenCtx;
  }

  transferToImageBitmap(): ImageBitmap | HTMLCanvasElement {
    if (this.isOffscreenSupported && 'transferToImageBitmap' in this.offscreenCanvas) {
      return (this.offscreenCanvas as OffscreenCanvas).transferToImageBitmap();
    }
    return this.offscreenCanvas as HTMLCanvasElement;
  }
}

// GPU-accelerated gradient cache
export class GradientCacheManager {
  private cache = new Map<string, CanvasGradient>();
  private maxCacheSize = 50; // Limit memory usage
  
  getCachedGradient(
    ctx: CanvasRenderingContext2D,
    key: string,
    createGradientFn: () => CanvasGradient
  ): CanvasGradient {
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    // Create gradient using provided function
    const gradient = createGradientFn();
    
    // Manage cache size
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, gradient);
    return gradient;
  }

  createRadialGradientKey(
    x0: number, y0: number, r0: number,
    x1: number, y1: number, r1: number,
    colors: string[]
  ): string {
    return `radial_${x0}_${y0}_${r0}_${x1}_${y1}_${r1}_${colors.join('_')}`;
  }

  createLinearGradientKey(
    x0: number, y0: number, x1: number, y1: number,
    colors: string[]
  ): string {
    return `linear_${x0}_${y0}_${x1}_${y1}_${colors.join('_')}`;
  }

  clear(): void {
    this.cache.clear();
  }
}

// Text rendering optimization for iframe context
export class TextRenderingOptimizer {
  private fontCache = new Map<string, boolean>();
  private textMetricsCache = new Map<string, TextMetrics>();

  // Preload fonts to avoid iframe loading delays
  async preloadFonts(fonts: string[]): Promise<void> {
    const loadPromises = fonts.map(font => this.loadFont(font));
    await Promise.all(loadPromises);
  }

  private async loadFont(fontFamily: string): Promise<void> {
    if (this.fontCache.has(fontFamily)) {
      return;
    }

    try {
      // Use FontFace API if available
      if ('FontFace' in window) {
        const font = new FontFace(fontFamily, `local("${fontFamily}")`);
        await font.load();
        (document.fonts as any).add(font);
      }
      
      this.fontCache.set(fontFamily, true);
    } catch (error) {
      console.warn(`Failed to preload font: ${fontFamily}`, error);
      this.fontCache.set(fontFamily, false);
    }
  }

  getCachedTextMetrics(
    ctx: CanvasRenderingContext2D,
    text: string,
    font: string
  ): TextMetrics {
    const key = `${text}_${font}`;
    
    if (this.textMetricsCache.has(key)) {
      return this.textMetricsCache.get(key)!;
    }

    // Temporarily set font for measurement
    const originalFont = ctx.font;
    ctx.font = font;
    const metrics = ctx.measureText(text);
    ctx.font = originalFont;

    // Cache with size limit
    if (this.textMetricsCache.size >= 100) {
      const firstKey = this.textMetricsCache.keys().next().value;
      this.textMetricsCache.delete(firstKey);
    }

    this.textMetricsCache.set(key, metrics);
    return metrics;
  }

  drawOptimizedText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    font: string,
    fillStyle: string | CanvasGradient | CanvasPattern
  ): void {
    // Only change context properties if they're different
    if (ctx.font !== font) ctx.font = font;
    if (ctx.fillStyle !== fillStyle) ctx.fillStyle = fillStyle;
    
    ctx.fillText(text, x, y);
  }
}

// Intelligent frame skipping for performance
export class FrameSkipManager {
  private targetFPS = 60;
  private currentFPS = 60;
  private skipRatio = 0;
  private frameCounter = 0;

  updatePerformanceMetrics(currentFPS: number): void {
    this.currentFPS = currentFPS;
    
    if (currentFPS < 50) {
      // Aggressive frame skipping for poor performance
      this.skipRatio = 0.5;
    } else if (currentFPS < 55) {
      // Moderate frame skipping
      this.skipRatio = 0.25;
    } else {
      // No frame skipping needed
      this.skipRatio = 0;
    }
  }

  shouldSkipFrame(): boolean {
    if (this.skipRatio === 0) return false;
    
    this.frameCounter++;
    return (this.frameCounter % Math.ceil(1 / this.skipRatio)) !== 0;
  }

  shouldRenderHighDetail(): boolean {
    return this.currentFPS >= 55;
  }

  getAdaptiveQuality(): 'high' | 'medium' | 'low' {
    if (this.currentFPS >= 55) return 'high';
    if (this.currentFPS >= 45) return 'medium';
    return 'low';
  }
}

// Memory-efficient particle system for large datasets
export class ParticleSystemOptimizer {
  private particlePool: Array<{x: number, y: number, active: boolean}> = [];
  private readonly maxParticles = 1000;

  constructor() {
    // Pre-allocate particle objects to avoid garbage collection
    for (let i = 0; i < this.maxParticles; i++) {
      this.particlePool.push({ x: 0, y: 0, active: false });
    }
  }

  getParticle(): {x: number, y: number, active: boolean} | null {
    for (const particle of this.particlePool) {
      if (!particle.active) {
        particle.active = true;
        return particle;
      }
    }
    return null; // Pool exhausted
  }

  releaseParticle(particle: {x: number, y: number, active: boolean}): void {
    particle.active = false;
  }

  getActiveCount(): number {
    return this.particlePool.filter(p => p.active).length;
  }
}

// Iframe-specific optimizations
export class IframePerformanceOptimizer {
  private isInIframe: boolean;
  private parentOrigin: string | null = null;

  constructor() {
    this.isInIframe = window !== window.parent;
    
    if (this.isInIframe) {
      this.setupIframeOptimizations();
    }
  }

  private setupIframeOptimizations(): void {
    // Optimize for iframe context
    
    // 1. Reduce background processing when not visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Pause or reduce animation frame rate
        this.notifyVisibilityChange(false);
      } else {
        // Resume full performance
        this.notifyVisibilityChange(true);
      }
    });

    // 2. Listen for parent window messages about focus
    window.addEventListener('message', (event) => {
      if (event.data.type === 'iframe_focus_change') {
        this.notifyFocusChange(event.data.focused);
      }
    });
  }

  private notifyVisibilityChange(visible: boolean): void {
    // Dispatch custom event for components to listen to
    window.dispatchEvent(new CustomEvent('iframe-visibility-change', {
      detail: { visible }
    }));
  }

  private notifyFocusChange(focused: boolean): void {
    // Dispatch custom event for focus changes
    window.dispatchEvent(new CustomEvent('iframe-focus-change', {
      detail: { focused }
    }));
  }

  isVisible(): boolean {
    return !document.hidden;
  }

  requestOptimalAnimationFrame(callback: FrameRequestCallback): number {
    // Use requestIdleCallback for non-critical animations in iframe
    if (this.isInIframe && 'requestIdleCallback' in window && !this.isVisible()) {
      return requestIdleCallback(() => {
        callback(performance.now());
      });
    }
    
    return requestAnimationFrame(callback);
  }
}

// Main performance optimization coordinator
export class SlotMachinePerformanceCoordinator {
  private monitor = new CanvasPerformanceMonitor();
  private frameSkipManager = new FrameSkipManager();
  private gradientCache = new GradientCacheManager();
  private textOptimizer = new TextRenderingOptimizer();
  private iframeOptimizer = new IframePerformanceOptimizer();
  
  // Performance metrics tracking
  private performanceLog: Array<{timestamp: number, fps: number, frameTime: number}> = [];

  constructor() {
    // Initialize font preloading
    this.textOptimizer.preloadFonts(['Inter', 'system-ui', 'Arial']);
    
    // Set up performance monitoring
    this.setupPerformanceMonitoring();
  }

  private setupPerformanceMonitoring(): void {
    // Log performance every 5 seconds
    setInterval(() => {
      const report = this.monitor.getPerformanceReport();
      this.performanceLog.push({
        timestamp: Date.now(),
        fps: report.currentFPS,
        frameTime: report.p95FrameTime
      });

      // Update frame skip manager
      this.frameSkipManager.updatePerformanceMetrics(report.currentFPS);

      // Log performance issues
      if (report.p95FrameTime > 16.67) {
        console.warn(`⚠️ Performance issue: P95 frame time ${report.p95FrameTime.toFixed(1)}ms (${report.p95FPS.toFixed(1)} FPS)`);
      }

      // Keep only last 60 entries (5 minutes of data)
      if (this.performanceLog.length > 60) {
        this.performanceLog.shift();
      }
    }, 5000);
  }

  // Main optimization method to be called each frame
  optimize(ctx: CanvasRenderingContext2D): {
    shouldSkip: boolean;
    quality: 'high' | 'medium' | 'low';
    gradientCache: GradientCacheManager;
    textOptimizer: TextRenderingOptimizer;
  } {
    // Record frame performance
    this.monitor.recordFrame();

    return {
      shouldSkip: this.frameSkipManager.shouldSkipFrame(),
      quality: this.frameSkipManager.getAdaptiveQuality(),
      gradientCache: this.gradientCache,
      textOptimizer: this.textOptimizer
    };
  }

  getPerformanceReport() {
    return {
      monitor: this.monitor.getPerformanceReport(),
      recentPerformance: this.performanceLog.slice(-10), // Last 10 entries
      recommendations: this.generateRecommendations()
    };
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const report = this.monitor.getPerformanceReport();

    if (report.p95FPS < 60) {
      recommendations.push('Consider reducing particle count or visual effects');
    }
    
    if (report.currentFPS < 45) {
      recommendations.push('Enable aggressive frame skipping');
      recommendations.push('Reduce canvas resolution');
    }

    if (this.gradientCache['cache'].size > 40) {
      recommendations.push('Gradient cache is near capacity - consider clearing old entries');
    }

    return recommendations;
  }
}