/**
 * SlotMachinePerformance Utility
 * 
 * Performance monitoring and optimization utilities for the slot machine wheel.
 * Provides FPS tracking, memory monitoring, and performance validation.
 * 
 * @module SlotMachinePerformance
 * @category Performance Utils
 */

/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
  fps: number;
  averageFps: number;
  memoryUsage: number; // MB
  renderTime: number; // ms
  frameDrops: number;
  totalFrames: number;
}

/**
 * Performance monitor class for real-time FPS and memory tracking
 */
export class SlotMachinePerformanceMonitor {
  private frameCount = 0;
  private lastFrameTime = 0;
  private frameTimes: number[] = [];
  private fpsHistory: number[] = [];
  private frameDropCount = 0;
  private startTime = 0;
  private isMonitoring = false;
  private renderStartTime = 0;
  private lastRenderTime = 0;

  private readonly maxHistorySize = 60; // Keep 1 second of FPS history at 60fps
  private readonly targetFps = 60;
  private readonly frameDropThreshold = 50; // Consider <50fps as frame drop

  /**
   * Starts performance monitoring
   */
  start(): void {
    this.frameCount = 0;
    this.frameTimes = [];
    this.fpsHistory = [];
    this.frameDropCount = 0;
    this.startTime = performance.now();
    this.lastFrameTime = this.startTime;
    this.isMonitoring = true;
  }

  /**
   * Stops performance monitoring
   */
  stop(): void {
    this.isMonitoring = false;
  }

  /**
   * Marks the start of a render operation
   */
  startRender(): void {
    this.renderStartTime = performance.now();
  }

  /**
   * Marks the end of a render operation and tracks timing
   */
  endRender(): void {
    if (this.renderStartTime > 0) {
      this.lastRenderTime = performance.now() - this.renderStartTime;
    }
  }

  /**
   * Records a frame for FPS calculation
   */
  recordFrame(): void {
    if (!this.isMonitoring) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;
    
    if (deltaTime > 0) {
      const currentFps = 1000 / deltaTime;
      
      // Track frame times and FPS
      this.frameTimes.push(deltaTime);
      this.fpsHistory.push(currentFps);
      
      // Maintain history size
      if (this.fpsHistory.length > this.maxHistorySize) {
        this.fpsHistory.shift();
        this.frameTimes.shift();
      }
      
      // Count frame drops
      if (currentFps < this.frameDropThreshold) {
        this.frameDropCount++;
      }
      
      this.frameCount++;
      this.lastFrameTime = currentTime;
    }
  }

  /**
   * Gets current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    const currentTime = performance.now();
    const elapsedTime = currentTime - this.startTime;
    
    // Calculate current FPS from recent frames
    const recentFps = this.fpsHistory.slice(-10); // Last 10 frames
    const currentFps = recentFps.length > 0 
      ? recentFps.reduce((sum, fps) => sum + fps, 0) / recentFps.length 
      : 0;
    
    // Calculate average FPS over entire monitoring period
    const averageFps = elapsedTime > 0 ? (this.frameCount * 1000) / elapsedTime : 0;
    
    // Get memory usage if available
    const memoryUsage = this.getMemoryUsage();

    return {
      fps: Math.round(currentFps * 10) / 10,
      averageFps: Math.round(averageFps * 10) / 10,
      memoryUsage,
      renderTime: Math.round(this.lastRenderTime * 100) / 100,
      frameDrops: this.frameDropCount,
      totalFrames: this.frameCount,
    };
  }

  /**
   * Gets memory usage in MB
   */
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return Math.round((memory.usedJSHeapSize / 1024 / 1024) * 100) / 100;
    }
    return 0;
  }

  /**
   * Checks if performance meets 60fps requirement
   */
  isPerformanceGood(): boolean {
    const metrics = this.getMetrics();
    return metrics.fps >= 55 && metrics.averageFps >= 55; // Allow 5fps tolerance
  }

  /**
   * Gets performance warnings if any
   */
  getPerformanceWarnings(): string[] {
    const warnings: string[] = [];
    const metrics = this.getMetrics();

    if (metrics.fps < 45) {
      warnings.push(`Low FPS detected: ${metrics.fps}fps (target: 60fps)`);
    }

    if (metrics.renderTime > 10) {
      warnings.push(`High render time: ${metrics.renderTime}ms (target: <10ms)`);
    }

    if (metrics.frameDrops > metrics.totalFrames * 0.1) {
      warnings.push(`High frame drop rate: ${metrics.frameDrops}/${metrics.totalFrames} frames`);
    }

    if (metrics.memoryUsage > 100) {
      warnings.push(`High memory usage: ${metrics.memoryUsage}MB`);
    }

    return warnings;
  }
}

/**
 * Global performance monitor instance
 */
export const performanceMonitor = new SlotMachinePerformanceMonitor();

/**
 * Performance measurement decorator for functions
 */
export function measurePerformance<T extends (...args: any[]) => any>(
  fn: T,
  label: string
): T {
  return ((...args: any[]) => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    
    if (end - start > 5) { // Only log if operation takes more than 5ms
      console.debug(`[Performance] ${label}: ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  }) as T;
}

/**
 * Validates performance requirements for large datasets
 */
export function validatePerformanceRequirements(
  participantCount: number,
  metrics: PerformanceMetrics
): {
  passes: boolean;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check FPS requirements
  if (metrics.fps < 55) {
    issues.push(`FPS below requirement: ${metrics.fps}fps (target: 60fps)`);
    recommendations.push('Consider reducing visual complexity or enabling performance mode');
  }

  // Check render time requirements
  if (metrics.renderTime > 16.67) { // 60fps = 16.67ms per frame
    issues.push(`Render time too high: ${metrics.renderTime}ms (target: <16.67ms)`);
    recommendations.push('Optimize canvas rendering operations');
  }

  // Check memory requirements based on participant count
  const expectedMemory = Math.max(50, participantCount * 0.01); // Base 50MB + 0.01MB per participant
  if (metrics.memoryUsage > expectedMemory * 2) {
    issues.push(`Memory usage too high: ${metrics.memoryUsage}MB (expected: ~${expectedMemory}MB)`);
    recommendations.push('Check for memory leaks or reduce subset size');
  }

  // Check frame drops
  const frameDropRate = metrics.totalFrames > 0 ? metrics.frameDrops / metrics.totalFrames : 0;
  if (frameDropRate > 0.05) { // More than 5% frame drops
    issues.push(`High frame drop rate: ${(frameDropRate * 100).toFixed(1)}%`);
    recommendations.push('Optimize animation easing or reduce visual effects');
  }

  return {
    passes: issues.length === 0,
    issues,
    recommendations,
  };
}

/**
 * Creates a performance test suite for stress testing
 */
export function createPerformanceTestSuite() {
  return {
    /**
     * Tests FPS with increasing participant counts
     */
    async testScalability(participantCounts: number[]): Promise<{
      count: number;
      fps: number;
      renderTime: number;
      passed: boolean;
    }[]> {
      const results = [];
      
      for (const count of participantCounts) {
        // This would be called by the actual test implementation
        // For now, we just provide the structure
        results.push({
          count,
          fps: 0,
          renderTime: 0,
          passed: false,
        });
      }
      
      return results;
    },

    /**
     * Tests memory usage over time
     */
    async testMemoryUsage(durationMs: number): Promise<{
      maxMemory: number;
      avgMemory: number;
      memoryLeak: boolean;
    }> {
      // Implementation would track memory over time
      return {
        maxMemory: 0,
        avgMemory: 0,
        memoryLeak: false,
      };
    },
  };
}