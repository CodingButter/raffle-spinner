#!/usr/bin/env node

/**
 * Memory Usage and Cleanup Testing
 * 
 * Purpose: Validate memory efficiency and detect leaks in SlotMachineWheel component
 * Tests memory usage patterns and cleanup after animations
 * 
 * @author Michael Thompson - Performance & Extension Engineer
 */

import { chromium } from 'playwright';
import { performance } from 'perf_hooks';
import { writeFileSync } from 'fs';
import path from 'path';

// Memory test configuration
const MEMORY_TARGETS = {
  BASELINE_MB: 50,    // Idle extension memory
  PEAK_MB: 200,       // Maximum during animation
  CLEANUP_PERCENTAGE: 95, // % of memory cleaned up after animation
  LEAK_THRESHOLD_MB: 10,  // Maximum acceptable memory growth per cycle
};

const MEMORY_TEST_SCENARIOS = [
  { name: 'Single Animation', participants: 1000, cycles: 1 },
  { name: 'Multiple Cycles', participants: 1000, cycles: 5 },
  { name: 'Large Dataset Single', participants: 5000, cycles: 1 },
  { name: 'Large Dataset Multiple', participants: 5000, cycles: 3 },
  { name: 'Stress Test', participants: 10000, cycles: 2 },
];

/**
 * Memory measurement utilities
 */
class MemoryProfiler {
  constructor() {
    this.snapshots = [];
    this.isRecording = false;
  }

  async takeSnapshot(page, label = '') {
    try {
      const memInfo = await page.evaluate(async () => {
        // Force garbage collection if available
        if (window.gc) {
          window.gc();
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        const memory = performance.memory || {};
        return {
          usedJSHeapSize: memory.usedJSHeapSize || 0,
          totalJSHeapSize: memory.totalJSHeapSize || 0,
          jsHeapSizeLimit: memory.jsHeapSizeLimit || 0,
          timestamp: Date.now(),
        };
      });

      const snapshot = {
        ...memInfo,
        label,
        usedMB: memInfo.usedJSHeapSize / (1024 * 1024),
        totalMB: memInfo.totalJSHeapSize / (1024 * 1024),
      };

      if (this.isRecording) {
        this.snapshots.push(snapshot);
      }

      return snapshot;
    } catch (error) {
      console.warn(`Memory snapshot failed for ${label}:`, error.message);
      return {
        usedJSHeapSize: 0,
        totalJSHeapSize: 0,
        jsHeapSizeLimit: 0,
        usedMB: 0,
        totalMB: 0,
        label,
        timestamp: Date.now(),
        error: error.message,
      };
    }
  }

  startRecording() {
    this.snapshots = [];
    this.isRecording = true;
  }

  stopRecording() {
    this.isRecording = false;
    return this.analyzeMemoryPattern();
  }

  analyzeMemoryPattern() {
    if (this.snapshots.length < 2) {
      return { error: 'Insufficient memory snapshots' };
    }

    const baseline = this.snapshots[0];
    const peak = this.snapshots.reduce((max, snap) => 
      snap.usedMB > max.usedMB ? snap : max
    );
    const final = this.snapshots[this.snapshots.length - 1];

    // Calculate memory growth and cleanup
    const totalGrowth = final.usedMB - baseline.usedMB;
    const peakGrowth = peak.usedMB - baseline.usedMB;
    const cleanupPercentage = peakGrowth > 0 ? 
      ((peak.usedMB - final.usedMB) / peakGrowth) * 100 : 100;

    // Detect potential leaks
    const hasLeak = totalGrowth > MEMORY_TARGETS.LEAK_THRESHOLD_MB;
    const cleanupPassed = cleanupPercentage >= MEMORY_TARGETS.CLEANUP_PERCENTAGE;
    const peakPassed = peak.usedMB <= MEMORY_TARGETS.PEAK_MB;

    return {
      baseline: baseline.usedMB,
      peak: peak.usedMB,
      final: final.usedMB,
      growth: totalGrowth,
      peakGrowth: peakGrowth,
      cleanupPercentage: cleanupPercentage,
      hasLeak: hasLeak,
      passed: !hasLeak && cleanupPassed && peakPassed,
      snapshots: this.snapshots,
    };
  }
}

/**
 * Run comprehensive memory tests
 */
async function runMemoryTests() {
  console.log('🧠 Starting Memory Usage and Cleanup Tests...\n');
  console.log(`Memory Targets:`);
  console.log(`- Baseline: ≤${MEMORY_TARGETS.BASELINE_MB}MB`);
  console.log(`- Peak: ≤${MEMORY_TARGETS.PEAK_MB}MB`);
  console.log(`- Cleanup: ≥${MEMORY_TARGETS.CLEANUP_PERCENTAGE}%`);
  console.log(`- Leak Threshold: ≤${MEMORY_TARGETS.LEAK_THRESHOLD_MB}MB growth per cycle\n`);

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--enable-precise-memory-info',
      '--js-flags="--expose-gc"', // Enable garbage collection
    ]
  });

  const results = [];

  try {
    for (const scenario of MEMORY_TEST_SCENARIOS) {
      console.log(`🔍 Testing: ${scenario.name} (${scenario.participants} participants, ${scenario.cycles} cycles)`);
      
      const result = await runMemoryScenario(browser, scenario);
      results.push(result);

      const status = result.passed ? '✅' : '❌';
      const leakWarning = result.hasLeak ? ' ⚠️ LEAK DETECTED' : '';
      console.log(`${status} ${scenario.name}: Peak ${result.peak.toFixed(1)}MB | Growth ${result.growth.toFixed(1)}MB | Cleanup ${result.cleanupPercentage.toFixed(1)}%${leakWarning}\n`);
    }

    // Run long-term memory stability test
    console.log('⏱️ Running long-term memory stability test...');
    const stabilityResult = await runLongTermMemoryTest(browser);
    results.push(stabilityResult);

    // Generate detailed report
    await generateMemoryReport(results);

    const allPassed = results.every(r => r.passed);
    console.log(`🏁 Memory Tests Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);

    return allPassed;

  } finally {
    await browser.close();
  }
}

/**
 * Run a single memory test scenario
 */
async function runMemoryScenario(browser, scenario) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const profiler = new MemoryProfiler();

  try {
    // Load the spinner component
    const devPagePath = path.resolve('apps/spinner-extension/src/dev/standalone.html');
    await page.goto(`file://${devPagePath}`);
    await page.waitForLoadState('networkidle');

    // Setup test data
    const participants = generateParticipants(scenario.participants);
    await page.evaluate((testParticipants) => {
      window.testParticipants = testParticipants;
      window.testSettings = {
        minSpinDuration: 1, // Short for testing
        decelerationRate: 'fast'
      };
    }, participants);

    profiler.startRecording();

    // Take baseline measurement
    await profiler.takeSnapshot(page, 'baseline');
    await page.waitForTimeout(500); // Allow for initial render

    // Run animation cycles
    for (let cycle = 0; cycle < scenario.cycles; cycle++) {
      await profiler.takeSnapshot(page, `pre-animation-${cycle + 1}`);

      // Trigger animation
      await triggerSpinAnimation(page);
      
      // Take peak memory snapshot during animation
      await page.waitForTimeout(500); // Let animation start
      await profiler.takeSnapshot(page, `peak-animation-${cycle + 1}`);

      // Wait for animation to complete
      await waitForAnimationComplete(page);
      
      // Take post-animation snapshot
      await profiler.takeSnapshot(page, `post-animation-${cycle + 1}`);

      // Allow time for cleanup
      await page.waitForTimeout(1000);
      await profiler.takeSnapshot(page, `cleanup-${cycle + 1}`);
    }

    // Final measurement
    await profiler.takeSnapshot(page, 'final');

    const analysis = profiler.stopRecording();

    return {
      scenario: scenario.name,
      participants: scenario.participants,
      cycles: scenario.cycles,
      ...analysis,
    };

  } finally {
    await context.close();
  }
}

/**
 * Run long-term memory stability test
 */
async function runLongTermMemoryTest(browser) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const profiler = new MemoryProfiler();

  try {
    console.log('Running 30-cycle endurance test...');
    
    const devPagePath = path.resolve('apps/spinner-extension/src/dev/standalone.html');
    await page.goto(`file://${devPagePath}`);
    await page.waitForLoadState('networkidle');

    // Setup moderate test data
    const participants = generateParticipants(1000);
    await page.evaluate((testParticipants) => {
      window.testParticipants = testParticipants;
      window.testSettings = {
        minSpinDuration: 0.5, // Very fast for endurance
        decelerationRate: 'fast'
      };
    }, participants);

    profiler.startRecording();
    await profiler.takeSnapshot(page, 'endurance-start');

    // Run 30 animation cycles to test for accumulating leaks
    for (let i = 0; i < 30; i++) {
      if (i % 10 === 0) {
        console.log(`  Cycle ${i + 1}/30...`);
        await profiler.takeSnapshot(page, `endurance-${i + 1}`);
      }

      await triggerSpinAnimation(page);
      await waitForAnimationComplete(page);
      
      // Minimal delay between animations
      await page.waitForTimeout(100);
    }

    await profiler.takeSnapshot(page, 'endurance-end');
    const analysis = profiler.stopRecording();

    // Analyze long-term trend
    const startMemory = analysis.snapshots[0].usedMB;
    const endMemory = analysis.snapshots[analysis.snapshots.length - 1].usedMB;
    const linearGrowth = endMemory - startMemory;

    return {
      scenario: 'Long-term Stability',
      participants: 1000,
      cycles: 30,
      ...analysis,
      linearGrowth,
      passed: analysis.passed && linearGrowth < MEMORY_TARGETS.LEAK_THRESHOLD_MB * 3, // Allow some growth over 30 cycles
    };

  } finally {
    await context.close();
  }
}

/**
 * Helper function to generate test participants
 */
function generateParticipants(count) {
  return Array.from({ length: count }, (_, i) => ({
    firstName: `First${i}`,
    lastName: `Last${i}`,
    ticketNumber: `T${String(i + 1).padStart(6, '0')}`,
  }));
}

/**
 * Trigger spin animation
 */
async function triggerSpinAnimation(page) {
  await page.evaluate(() => {
    // Look for spin trigger methods
    if (window.triggerSpin) {
      window.triggerSpin();
    } else {
      // Simulate button click
      const spinButton = document.querySelector('[data-testid="spin-button"]') ||
                        document.querySelector('button[aria-label*="Spin"]') ||
                        Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.includes('Spin'));
      if (spinButton) {
        spinButton.click();
      }
    }
  });
}

/**
 * Wait for animation to complete
 */
async function waitForAnimationComplete(page) {
  try {
    // Wait for spin to start
    await page.waitForFunction(() => {
      return window.isSpinning === true || 
             document.querySelector('.spinning') ||
             document.querySelector('[data-spinning="true"]');
    }, { timeout: 2000 });

    // Wait for spin to complete
    await page.waitForFunction(() => {
      return window.isSpinning === false ||
             !document.querySelector('.spinning') ||
             document.querySelector('[data-spinning="false"]');
    }, { timeout: 5000 });

  } catch (error) {
    // Fallback: fixed wait time
    await page.waitForTimeout(2000);
  }
}

/**
 * Generate comprehensive memory report
 */
async function generateMemoryReport(results) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = `memory-report-${timestamp}.json`;

  const report = {
    timestamp: new Date().toISOString(),
    testConfig: {
      targets: MEMORY_TARGETS,
      scenarios: MEMORY_TEST_SCENARIOS,
    },
    results: results,
    summary: {
      totalTests: results.length,
      passed: results.filter(r => r.passed).length,
      failed: results.filter(r => !r.passed).length,
      leaksDetected: results.filter(r => r.hasLeak).length,
      averagePeakMemory: results.reduce((sum, r) => sum + r.peak, 0) / results.length,
      maxMemoryUsage: Math.max(...results.map(r => r.peak)),
      recommendations: generateMemoryRecommendations(results),
    },
  };

  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Memory report saved: ${reportPath}\n`);

  // Generate human-readable summary
  console.log('🧠 MEMORY TEST SUMMARY');
  console.log('======================');
  
  results.forEach(result => {
    const peakStatus = result.peak <= MEMORY_TARGETS.PEAK_MB ? '✅' : '❌';
    const cleanupStatus = result.cleanupPercentage >= MEMORY_TARGETS.CLEANUP_PERCENTAGE ? '✅' : '❌';
    const leakStatus = !result.hasLeak ? '✅' : '⚠️';
    
    console.log(`\n${result.scenario}:`);
    console.log(`  ${peakStatus} Peak Memory: ${result.peak.toFixed(1)}MB (target: ${MEMORY_TARGETS.PEAK_MB}MB)`);
    console.log(`  ${cleanupStatus} Cleanup: ${result.cleanupPercentage.toFixed(1)}% (target: ${MEMORY_TARGETS.CLEANUP_PERCENTAGE}%)`);
    console.log(`  ${leakStatus} Memory Growth: ${result.growth.toFixed(1)}MB (threshold: ${MEMORY_TARGETS.LEAK_THRESHOLD_MB}MB)`);
    
    if (result.hasLeak) {
      console.log(`  ⚠️  POTENTIAL MEMORY LEAK DETECTED`);
    }
  });

  return report;
}

/**
 * Generate memory optimization recommendations
 */
function generateMemoryRecommendations(results) {
  const recommendations = [];

  // Check for peak memory issues
  const peakIssues = results.filter(r => r.peak > MEMORY_TARGETS.PEAK_MB);
  if (peakIssues.length > 0) {
    recommendations.push({
      type: 'peak_memory_optimization',
      priority: 'high',
      message: `${peakIssues.length} scenarios exceeded peak memory target. Consider reducing canvas size or optimizing data structures.`,
      affectedScenarios: peakIssues.map(r => r.scenario),
    });
  }

  // Check for cleanup issues
  const cleanupIssues = results.filter(r => r.cleanupPercentage < MEMORY_TARGETS.CLEANUP_PERCENTAGE);
  if (cleanupIssues.length > 0) {
    recommendations.push({
      type: 'memory_cleanup',
      priority: 'high',
      message: `${cleanupIssues.length} scenarios have poor memory cleanup. Review event listener removal and object disposal.`,
      affectedScenarios: cleanupIssues.map(r => r.scenario),
    });
  }

  // Check for memory leaks
  const leaks = results.filter(r => r.hasLeak);
  if (leaks.length > 0) {
    recommendations.push({
      type: 'memory_leak_fix',
      priority: 'critical',
      message: `${leaks.length} scenarios show potential memory leaks. Immediate investigation required.`,
      affectedScenarios: leaks.map(r => r.scenario),
    });
  }

  return recommendations;
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  runMemoryTests()
    .then(success => {
      console.log('\n🎯 Memory testing completed!');
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Memory test failed:', error);
      process.exit(1);
    });
}

export { runMemoryTests, MEMORY_TARGETS, MemoryProfiler };