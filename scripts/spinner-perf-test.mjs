#!/usr/bin/env node

/**
 * Spinner Animation Performance Test Runner
 * 
 * Purpose: Automated performance testing for SlotMachineWheel component
 * Validates 60fps performance across different data sizes and scenarios
 * 
 * @author Michael Thompson - Performance & Extension Engineer
 */

import { chromium } from 'playwright';
import { performance } from 'perf_hooks';
import { writeFileSync } from 'fs';
import path from 'path';

// Performance thresholds
const PERFORMANCE_TARGETS = {
  FPS_TARGET: 60,
  FRAME_TIME_TARGET: 16.67, // 1000ms / 60fps
  INPUT_LATENCY_TARGET: 100,
  MEMORY_TARGET_MB: 200,
  JANK_THRESHOLD: 50, // frames >50ms are considered jank
};

// Test scenarios with different participant counts
const TEST_SCENARIOS = [
  { name: 'Small Dataset', participants: 100, expectedFps: 60 },
  { name: 'Medium Dataset', participants: 1000, expectedFps: 60 },
  { name: 'Large Dataset', participants: 5000, expectedFps: 60 },
  { name: 'Stress Test', participants: 10000, expectedFps: 55 }, // Allow slight degradation
];

/**
 * Generate test participant data
 */
function generateParticipants(count) {
  return Array.from({ length: count }, (_, i) => ({
    firstName: `First${i}`,
    lastName: `Last${i}`,
    ticketNumber: `T${String(i + 1).padStart(6, '0')}`,
  }));
}

/**
 * Performance measurement utilities
 */
class PerformanceMeasurer {
  constructor() {
    this.measurements = [];
    this.isRecording = false;
  }

  startRecording() {
    this.measurements = [];
    this.isRecording = true;
    this.startTime = performance.now();
  }

  stopRecording() {
    this.isRecording = false;
    this.endTime = performance.now();
    return this.analyzeMeasurements();
  }

  recordFrame(timestamp) {
    if (!this.isRecording) return;
    
    if (this.measurements.length > 0) {
      const lastFrame = this.measurements[this.measurements.length - 1];
      const frameDelta = timestamp - lastFrame;
      this.measurements.push(timestamp);
      
      // Calculate FPS from frame delta
      if (frameDelta > 0) {
        const fps = 1000 / frameDelta;
        return fps;
      }
    } else {
      this.measurements.push(timestamp);
    }
    
    return null;
  }

  analyzeMeasurements() {
    if (this.measurements.length < 2) {
      return { error: 'Insufficient frame data' };
    }

    // Calculate frame times
    const frameTimes = [];
    for (let i = 1; i < this.measurements.length; i++) {
      frameTimes.push(this.measurements[i] - this.measurements[i - 1]);
    }

    // Sort for percentile calculations
    frameTimes.sort((a, b) => a - b);

    const totalDuration = this.endTime - this.startTime;
    const frameCount = frameTimes.length;
    const averageFps = (frameCount / totalDuration) * 1000;

    // Calculate percentiles
    const p50 = frameTimes[Math.floor(frameCount * 0.5)];
    const p95 = frameTimes[Math.floor(frameCount * 0.95)];
    const p99 = frameTimes[Math.floor(frameCount * 0.99)];

    // Count jank frames (>50ms)
    const jankFrames = frameTimes.filter(ft => ft > PERFORMANCE_TARGETS.JANK_THRESHOLD).length;
    const jankPercentage = (jankFrames / frameCount) * 100;

    return {
      totalFrames: frameCount,
      duration: totalDuration,
      averageFps: averageFps,
      minFrameTime: frameTimes[0],
      maxFrameTime: frameTimes[frameCount - 1],
      p50FrameTime: p50,
      p95FrameTime: p95,
      p99FrameTime: p99,
      jankFrames: jankFrames,
      jankPercentage: jankPercentage,
      passed: averageFps >= PERFORMANCE_TARGETS.FPS_TARGET && p95 <= PERFORMANCE_TARGETS.FRAME_TIME_TARGET,
    };
  }
}

/**
 * Run spinner performance tests
 */
async function runSpinnerPerformanceTests() {
  console.log('🎰 Starting Spinner Animation Performance Tests...\n');
  console.log(`Performance Targets:`);
  console.log(`- FPS: ≥${PERFORMANCE_TARGETS.FPS_TARGET} fps`);
  console.log(`- Frame Time (P95): ≤${PERFORMANCE_TARGETS.FRAME_TIME_TARGET}ms`);
  console.log(`- Input Latency: ≤${PERFORMANCE_TARGETS.INPUT_LATENCY_TARGET}ms`);
  console.log(`- Memory Usage: ≤${PERFORMANCE_TARGETS.MEMORY_TARGET_MB}MB\n`);

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--enable-precise-memory-info',
    ]
  });

  const results = [];

  try {
    for (const scenario of TEST_SCENARIOS) {
      console.log(`📊 Testing: ${scenario.name} (${scenario.participants} participants)`);
      
      const result = await runSingleScenario(browser, scenario);
      results.push(result);
      
      // Log immediate results
      const status = result.performance.passed ? '✅' : '❌';
      console.log(`${status} ${scenario.name}: ${result.performance.averageFps.toFixed(1)} fps (P95: ${result.performance.p95FrameTime.toFixed(1)}ms)`);
      console.log(`   Memory: ${result.memory.peakUsageMB.toFixed(1)}MB | Jank: ${result.performance.jankPercentage.toFixed(1)}%\n`);
    }

    // Generate detailed report
    await generatePerformanceReport(results);
    
    const allPassed = results.every(r => r.performance.passed && r.memory.passed);
    console.log(`🏁 Overall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    
    return allPassed;

  } finally {
    await browser.close();
  }
}

/**
 * Run a single performance test scenario
 */
async function runSingleScenario(browser, scenario) {
  const context = await browser.newContext();
  const page = await context.newPage();

  // Enable runtime performance monitoring
  await page.addInitScript(() => {
    window.performanceData = [];
    window.memoryData = [];
    
    // Track frame performance
    let lastFrameTime = performance.now();
    function trackFramePerformance() {
      const now = performance.now();
      window.performanceData.push(now);
      requestAnimationFrame(trackFramePerformance);
    }
    requestAnimationFrame(trackFramePerformance);
  });

  // Load the spinner component (assuming standalone dev page)
  const devPagePath = path.resolve('apps/spinner-extension/src/dev/standalone.html');
  await page.goto(`file://${devPagePath}`);

  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Measure initial memory
  const initialMemory = await measureMemoryUsage(page);

  // Setup test data
  await page.evaluate((participants) => {
    window.testParticipants = participants;
    window.testSettings = {
      minSpinDuration: 2, // Shorter for testing
      decelerationRate: 'medium'
    };
  }, generateParticipants(scenario.participants));

  // Start performance recording
  await page.evaluate(() => {
    window.performanceData = [];
    window.recordingStartTime = performance.now();
  });

  // Trigger spin animation
  const inputLatency = await measureInputLatency(page);
  
  // Wait for animation to complete (estimated duration + buffer)
  await page.waitForTimeout(4000);

  // Stop recording and collect data
  const performanceData = await page.evaluate(() => {
    const endTime = performance.now();
    return {
      frames: window.performanceData,
      startTime: window.recordingStartTime,
      endTime: endTime,
    };
  });

  // Measure peak memory after animation
  const peakMemory = await measureMemoryUsage(page);
  
  // Wait for cleanup
  await page.waitForTimeout(1000);
  
  // Measure memory after cleanup
  const finalMemory = await measureMemoryUsage(page);

  await context.close();

  // Analyze performance data
  const measurer = new PerformanceMeasurer();
  measurer.measurements = performanceData.frames;
  measurer.startTime = performanceData.startTime;
  measurer.endTime = performanceData.endTime;
  const performanceResults = measurer.analyzeMeasurements();

  return {
    scenario: scenario.name,
    participants: scenario.participants,
    performance: {
      ...performanceResults,
      inputLatency,
    },
    memory: {
      initial: initialMemory,
      peak: peakMemory,
      final: finalMemory,
      peakUsageMB: peakMemory.usedJSHeapSize / (1024 * 1024),
      cleanup: ((peakMemory.usedJSHeapSize - finalMemory.usedJSHeapSize) / peakMemory.usedJSHeapSize) * 100,
      passed: (peakMemory.usedJSHeapSize / (1024 * 1024)) <= PERFORMANCE_TARGETS.MEMORY_TARGET_MB,
    }
  };
}

/**
 * Measure memory usage using Chrome's memory API
 */
async function measureMemoryUsage(page) {
  try {
    return await page.evaluate(async () => {
      if ('memory' in performance) {
        // Force garbage collection if available
        if (window.gc) {
          window.gc();
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        const memory = performance.memory;
        return {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
        };
      }
      
      return { usedJSHeapSize: 0, totalJSHeapSize: 0, jsHeapSizeLimit: 0 };
    });
  } catch (error) {
    return { usedJSHeapSize: 0, totalJSHeapSize: 0, jsHeapSizeLimit: 0 };
  }
}

/**
 * Measure input latency for spin start
 */
async function measureInputLatency(page) {
  const startTime = await page.evaluate(() => {
    const start = performance.now();
    // Simulate clicking the spin button
    const spinButton = document.querySelector('[data-testid="spin-button"]') || 
                      document.querySelector('button[aria-label*="Spin"]') ||
                      document.querySelector('button:has-text("Spin")');
    
    if (spinButton) {
      spinButton.click();
    }
    
    return start;
  });

  // Wait for animation to start (visual feedback)
  await page.waitForFunction(() => {
    // Look for spinning state or animation indicators
    return document.querySelector('.spinning') || 
           document.querySelector('[data-spinning="true"]') ||
           window.isSpinning === true;
  }, { timeout: 1000 }).catch(() => {
    // Fallback if no spinner state is detectable
    return null;
  });

  const responseTime = await page.evaluate(() => performance.now());
  
  return responseTime - startTime;
}

/**
 * Generate comprehensive performance report
 */
async function generatePerformanceReport(results) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = `performance-report-${timestamp}.json`;

  const report = {
    timestamp: new Date().toISOString(),
    testConfig: {
      targets: PERFORMANCE_TARGETS,
      scenarios: TEST_SCENARIOS,
    },
    results: results,
    summary: {
      totalTests: results.length,
      passed: results.filter(r => r.performance.passed && r.memory.passed).length,
      failed: results.filter(r => !r.performance.passed || !r.memory.passed).length,
      averageFps: results.reduce((sum, r) => sum + r.performance.averageFps, 0) / results.length,
      peakMemoryMB: Math.max(...results.map(r => r.memory.peakUsageMB)),
      recommendations: generateRecommendations(results),
    },
  };

  // Write detailed JSON report
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Detailed report saved: ${reportPath}`);

  // Generate human-readable summary
  console.log('\n📈 PERFORMANCE TEST SUMMARY');
  console.log('============================');
  
  results.forEach(result => {
    const fpsStatus = result.performance.averageFps >= PERFORMANCE_TARGETS.FPS_TARGET ? '✅' : '❌';
    const memStatus = result.memory.passed ? '✅' : '❌';
    
    console.log(`\n${result.scenario}:`);
    console.log(`  ${fpsStatus} FPS: ${result.performance.averageFps.toFixed(1)} (target: ${PERFORMANCE_TARGETS.FPS_TARGET})`);
    console.log(`  ${fpsStatus} P95 Frame Time: ${result.performance.p95FrameTime.toFixed(1)}ms (target: ${PERFORMANCE_TARGETS.FRAME_TIME_TARGET}ms)`);
    console.log(`  ${memStatus} Memory: ${result.memory.peakUsageMB.toFixed(1)}MB (target: ${PERFORMANCE_TARGETS.MEMORY_TARGET_MB}MB)`);
    console.log(`  📊 Jank: ${result.performance.jankPercentage.toFixed(1)}% | Input Latency: ${result.performance.inputLatency?.toFixed(1) || 'N/A'}ms`);
  });

  return report;
}

/**
 * Generate optimization recommendations
 */
function generateRecommendations(results) {
  const recommendations = [];
  
  // Check for FPS issues
  const fpsIssues = results.filter(r => r.performance.averageFps < PERFORMANCE_TARGETS.FPS_TARGET);
  if (fpsIssues.length > 0) {
    recommendations.push({
      type: 'fps_optimization',
      priority: 'high',
      message: `${fpsIssues.length} scenarios failed FPS target. Consider optimizing animation loop or reducing rendering complexity.`,
      affectedScenarios: fpsIssues.map(r => r.scenario),
    });
  }

  // Check for memory issues
  const memoryIssues = results.filter(r => !r.memory.passed);
  if (memoryIssues.length > 0) {
    recommendations.push({
      type: 'memory_optimization',
      priority: 'medium',
      message: `${memoryIssues.length} scenarios exceeded memory target. Review object cleanup and canvas memory usage.`,
      affectedScenarios: memoryIssues.map(r => r.scenario),
    });
  }

  // Check for jank issues
  const jankIssues = results.filter(r => r.performance.jankPercentage > 5);
  if (jankIssues.length > 0) {
    recommendations.push({
      type: 'jank_reduction',
      priority: 'medium',
      message: `${jankIssues.length} scenarios show >5% jank frames. Consider breaking up long tasks or optimizing rendering.`,
      affectedScenarios: jankIssues.map(r => r.scenario),
    });
  }

  return recommendations;
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  runSpinnerPerformanceTests()
    .then(success => {
      console.log('\n🎯 Performance testing completed!');
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Performance test failed:', error);
      process.exit(1);
    });
}

export { runSpinnerPerformanceTests, PERFORMANCE_TARGETS, TEST_SCENARIOS };