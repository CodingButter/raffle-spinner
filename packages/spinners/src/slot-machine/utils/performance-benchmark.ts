/**
 * Performance Benchmark Utility for Slot Machine
 * 
 * Provides real-time FPS monitoring and performance metrics
 * for the slot machine spinner with large datasets.
 * 
 * @module performance-benchmark
 */

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  droppedFrames: number;
  totalFrames: number;
  averageFps: number;
  minFps: number;
  maxFps: number;
  participantCount: number;
  subsetSize: number;
  memoryUsed?: number;
}

export class PerformanceBenchmark {
  private frameTimestamps: number[] = [];
  private fpsHistory: number[] = [];
  private droppedFrames = 0;
  private totalFrames = 0;
  private lastTimestamp = 0;
  private isMonitoring = false;
  private rafId: number | null = null;
  
  /**
   * Start monitoring performance
   */
  start(): void {
    this.reset();
    this.isMonitoring = true;
    this.lastTimestamp = performance.now();
    this.monitor();
  }
  
  /**
   * Stop monitoring
   */
  stop(): void {
    this.isMonitoring = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
  
  /**
   * Reset all metrics
   */
  reset(): void {
    this.frameTimestamps = [];
    this.fpsHistory = [];
    this.droppedFrames = 0;
    this.totalFrames = 0;
    this.lastTimestamp = 0;
  }
  
  /**
   * Monitor frame performance
   */
  private monitor = (): void => {
    if (!this.isMonitoring) return;
    
    const now = performance.now();
    const frameTime = now - this.lastTimestamp;
    
    this.frameTimestamps.push(frameTime);
    this.totalFrames++;
    
    // Check for dropped frames (> 16.67ms for 60fps)
    if (frameTime > 16.67) {
      this.droppedFrames++;
    }
    
    // Calculate FPS
    const fps = 1000 / frameTime;
    this.fpsHistory.push(fps);
    
    // Keep only last 60 frames for rolling average
    if (this.frameTimestamps.length > 60) {
      this.frameTimestamps.shift();
      this.fpsHistory.shift();
    }
    
    this.lastTimestamp = now;
    this.rafId = requestAnimationFrame(this.monitor);
  };
  
  /**
   * Get current performance metrics
   */
  getMetrics(participantCount: number, subsetSize: number): PerformanceMetrics {
    const currentFps = this.fpsHistory[this.fpsHistory.length - 1] || 0;
    const averageFps = this.fpsHistory.length > 0
      ? this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length
      : 0;
    const minFps = Math.min(...this.fpsHistory) || 0;
    const maxFps = Math.max(...this.fpsHistory) || 0;
    const avgFrameTime = this.frameTimestamps.length > 0
      ? this.frameTimestamps.reduce((a, b) => a + b, 0) / this.frameTimestamps.length
      : 0;
    
    // Try to get memory usage if available
    let memoryUsed: number | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ('memory' in performance && (performance as any).memory) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      memoryUsed = (performance as any).memory.usedJSHeapSize;
    }
    
    return {
      fps: Math.round(currentFps),
      frameTime: Math.round(avgFrameTime * 100) / 100,
      droppedFrames: this.droppedFrames,
      totalFrames: this.totalFrames,
      averageFps: Math.round(averageFps),
      minFps: Math.round(minFps),
      maxFps: Math.round(maxFps),
      participantCount,
      subsetSize,
      memoryUsed,
    };
  }
  
  /**
   * Log performance report
   */
  logReport(participantCount: number, subsetSize: number): void {
    const metrics = this.getMetrics(participantCount, subsetSize);
    
    /* eslint-disable no-console */
    console.group('🎯 Performance Benchmark Report');
    console.log(`Participants: ${metrics.participantCount.toLocaleString()}`);
    console.log(`Subset Size: ${metrics.subsetSize}`);
    console.log(`Current FPS: ${metrics.fps}`);
    console.log(`Average FPS: ${metrics.averageFps}`);
    console.log(`Min/Max FPS: ${metrics.minFps}/${metrics.maxFps}`);
    console.log(`Frame Time: ${metrics.frameTime}ms`);
    console.log(`Dropped Frames: ${metrics.droppedFrames}/${metrics.totalFrames} (${
      Math.round((metrics.droppedFrames / metrics.totalFrames) * 100)
    }%)`);
    
    if (metrics.memoryUsed) {
      console.log(`Memory Used: ${(metrics.memoryUsed / 1024 / 1024).toFixed(2)} MB`);
    }
    
    // Performance rating
    let rating = '⚠️ Poor';
    if (metrics.averageFps >= 55) rating = '✅ Excellent';
    else if (metrics.averageFps >= 45) rating = '👍 Good';
    else if (metrics.averageFps >= 30) rating = '😐 Acceptable';
    
    console.log(`Performance Rating: ${rating}`);
    console.groupEnd();
    /* eslint-enable no-console */
  }
}

/**
 * Create and start a performance benchmark
 */
export function createBenchmark(): PerformanceBenchmark {
  return new PerformanceBenchmark();
}

/**
 * Run automated performance test
 */
export async function runPerformanceTest(
  participantCount: number,
  duration: number = 5000
): Promise<PerformanceMetrics> {
  const benchmark = createBenchmark();
  
  // eslint-disable-next-line no-console
  console.log(`🚀 Starting performance test with ${participantCount.toLocaleString()} participants...`);
  
  benchmark.start();
  
  // Run for specified duration
  await new Promise(resolve => setTimeout(resolve, duration));
  
  benchmark.stop();
  
  const metrics = benchmark.getMetrics(participantCount, 100);
  benchmark.logReport(participantCount, 100);
  
  return metrics;
}

/**
 * Test multiple participant counts
 */
export async function runScalingTest(): Promise<void> {
  const testCounts = [100, 500, 1000, 5000, 10000, 20000];
  const results: PerformanceMetrics[] = [];
  
  // eslint-disable-next-line no-console
  console.log('🔬 Running scaling performance tests...\n');
  
  for (const count of testCounts) {
    const metrics = await runPerformanceTest(count, 3000);
    results.push(metrics);
    
    // Brief pause between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary report
  /* eslint-disable no-console */
  console.group('📊 Scaling Test Summary');
  console.table(results.map(r => ({
    Participants: r.participantCount.toLocaleString(),
    'Avg FPS': r.averageFps,
    'Min FPS': r.minFps,
    'Dropped Frames %': Math.round((r.droppedFrames / r.totalFrames) * 100),
    'Memory (MB)': r.memoryUsed ? (r.memoryUsed / 1024 / 1024).toFixed(2) : 'N/A',
  })));
  console.groupEnd();
  /* eslint-enable no-console */
}