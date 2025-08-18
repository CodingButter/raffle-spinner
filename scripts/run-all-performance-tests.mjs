#!/usr/bin/env node

/**
 * Complete Performance Testing Suite
 * 
 * Purpose: Run all performance tests for SlotMachineWheel and generate comprehensive report
 * Integrates animation performance, memory testing, and bundle size validation
 * 
 * @author Michael Thompson - Performance & Extension Engineer
 */

import { performance } from 'perf_hooks';
import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

// Import our test modules
import { runSpinnerPerformanceTests, PERFORMANCE_TARGETS } from './spinner-perf-test.mjs';
import { runMemoryTests, MEMORY_TARGETS } from './memory-test.mjs';

// Bundle size limits (in bytes)
const BUNDLE_SIZE_LIMITS = {
  TOTAL_COMPRESSED: 2 * 1024 * 1024, // 2MB
  EXTENSION_CHUNK: 200 * 1024, // 200KB per chunk
  REGRESSION_THRESHOLD: 0.05, // 5% increase fails
};

/**
 * Main performance testing orchestrator
 */
async function runCompletePerformanceTests() {
  console.log('🚀 Starting Complete Performance Test Suite...\n');
  console.log('This suite will test:');
  console.log('1. ⚡ Animation Performance (60fps target)');
  console.log('2. 🧠 Memory Usage and Cleanup');
  console.log('3. 📦 Bundle Size Validation');
  console.log('4. 📊 Storage Performance\n');

  const startTime = performance.now();
  const results = {
    timestamp: new Date().toISOString(),
    suite: 'Complete Performance Tests',
    tests: {},
    summary: {},
  };

  let allTestsPassed = true;

  try {
    // 1. Storage Performance Tests (existing)
    console.log('📀 Running Storage Performance Tests...');
    try {
      execSync('node scripts/perf-test.mjs', { 
        stdio: 'inherit',
        cwd: process.cwd(),
        timeout: 60000 // 1 minute timeout
      });
      results.tests.storage = { status: 'PASSED', message: 'All storage operations meet performance targets' };
      console.log('✅ Storage Performance: PASSED\n');
    } catch (error) {
      results.tests.storage = { status: 'FAILED', message: 'Storage performance targets not met', error: error.message };
      allTestsPassed = false;
      console.log('❌ Storage Performance: FAILED\n');
    }

    // 2. Animation Performance Tests
    console.log('⚡ Running Animation Performance Tests...');
    try {
      const animationResult = await runSpinnerPerformanceTests();
      results.tests.animation = { 
        status: animationResult ? 'PASSED' : 'FAILED',
        message: animationResult ? '60fps target achieved across all scenarios' : 'Animation performance targets not met'
      };
      if (!animationResult) allTestsPassed = false;
    } catch (error) {
      results.tests.animation = { status: 'FAILED', message: 'Animation tests failed to run', error: error.message };
      allTestsPassed = false;
      console.log('❌ Animation Performance: FAILED');
      console.log(`Error: ${error.message}\n`);
    }

    // 3. Memory Tests
    console.log('🧠 Running Memory Usage Tests...');
    try {
      const memoryResult = await runMemoryTests();
      results.tests.memory = {
        status: memoryResult ? 'PASSED' : 'FAILED',
        message: memoryResult ? 'Memory usage within limits, no leaks detected' : 'Memory issues detected'
      };
      if (!memoryResult) allTestsPassed = false;
    } catch (error) {
      results.tests.memory = { status: 'FAILED', message: 'Memory tests failed to run', error: error.message };
      allTestsPassed = false;
      console.log('❌ Memory Tests: FAILED');
      console.log(`Error: ${error.message}\n`);
    }

    // 4. Bundle Size Validation
    console.log('📦 Running Bundle Size Tests...');
    try {
      const bundleResult = await validateBundleSize();
      results.tests.bundleSize = bundleResult;
      if (bundleResult.status !== 'PASSED') allTestsPassed = false;
    } catch (error) {
      results.tests.bundleSize = { status: 'FAILED', message: 'Bundle size validation failed', error: error.message };
      allTestsPassed = false;
      console.log('❌ Bundle Size: FAILED');
      console.log(`Error: ${error.message}\n`);
    }

    const endTime = performance.now();
    const duration = (endTime - startTime) / 1000;

    // Compile final summary
    results.summary = {
      duration: `${duration.toFixed(2)}s`,
      totalTests: Object.keys(results.tests).length,
      passed: Object.values(results.tests).filter(t => t.status === 'PASSED').length,
      failed: Object.values(results.tests).filter(t => t.status === 'FAILED').length,
      overallResult: allTestsPassed ? 'PASSED' : 'FAILED',
    };

    // Generate final report
    await generateFinalReport(results);

    return allTestsPassed;

  } catch (error) {
    console.error('❌ Performance test suite encountered an error:', error);
    return false;
  }
}

/**
 * Validate bundle size and check for regressions
 */
async function validateBundleSize() {
  console.log('Building extension for size analysis...');
  
  try {
    // Build the extension
    execSync('pnpm --filter @drawday/spinner-extension build', { 
      stdio: 'pipe',
      cwd: process.cwd(),
    });

    // Analyze bundle size
    const distPath = 'apps/spinner-extension/dist';
    const bundleStats = await analyzeBundleSize(distPath);

    // Check against limits
    const totalSizeMB = bundleStats.totalCompressed / (1024 * 1024);
    const sizeCheck = {
      totalSize: bundleStats.totalCompressed,
      totalSizeMB: totalSizeMB,
      limit: BUNDLE_SIZE_LIMITS.TOTAL_COMPRESSED,
      limitMB: BUNDLE_SIZE_LIMITS.TOTAL_COMPRESSED / (1024 * 1024),
      passed: bundleStats.totalCompressed <= BUNDLE_SIZE_LIMITS.TOTAL_COMPRESSED,
    };

    // Check for regressions (if baseline exists)
    const regressionCheck = await checkBundleSizeRegression(bundleStats);

    const status = sizeCheck.passed && !regressionCheck.hasRegression ? 'PASSED' : 'FAILED';
    const statusIcon = status === 'PASSED' ? '✅' : '❌';

    console.log(`${statusIcon} Bundle Size: ${totalSizeMB.toFixed(2)}MB / ${sizeCheck.limitMB.toFixed(2)}MB`);
    
    if (regressionCheck.hasRegression) {
      console.log(`⚠️  Size regression detected: +${(regressionCheck.changePercent * 100).toFixed(1)}%`);
    }

    return {
      status,
      message: status === 'PASSED' ? 
        `Bundle size ${totalSizeMB.toFixed(2)}MB within limit` : 
        `Bundle size ${totalSizeMB.toFixed(2)}MB exceeds ${sizeCheck.limitMB}MB limit`,
      bundleStats,
      sizeCheck,
      regressionCheck,
    };

  } catch (error) {
    return {
      status: 'FAILED',
      message: 'Bundle size validation failed',
      error: error.message,
    };
  }
}

/**
 * Analyze bundle size from dist folder
 */
async function analyzeBundleSize(distPath) {
  const fs = await import('fs');
  const { promisify } = await import('util');
  const stat = promisify(fs.stat);
  const readdir = promisify(fs.readdir);

  if (!existsSync(distPath)) {
    throw new Error(`Distribution folder not found: ${distPath}`);
  }

  const files = await readdir(distPath);
  const jsFiles = files.filter(f => f.endsWith('.js'));
  const totalFiles = files.length;
  
  let totalSize = 0;
  let totalCompressed = 0; // Approximation using gzip ratio
  const fileDetails = [];

  for (const file of files) {
    const filePath = path.join(distPath, file);
    const stats = await stat(filePath);
    const size = stats.size;
    
    // Estimate compressed size (typical gzip ratio for JS/HTML/CSS)
    const compressedSize = file.endsWith('.js') ? size * 0.3 : 
                          file.endsWith('.html') ? size * 0.4 :
                          file.endsWith('.css') ? size * 0.2 : size;
    
    totalSize += size;
    totalCompressed += compressedSize;

    fileDetails.push({
      name: file,
      size: size,
      compressedSize: Math.round(compressedSize),
      sizeMB: (size / (1024 * 1024)).toFixed(3),
    });
  }

  return {
    totalFiles,
    jsFiles: jsFiles.length,
    totalSize,
    totalCompressed: Math.round(totalCompressed),
    files: fileDetails.sort((a, b) => b.size - a.size), // Largest first
  };
}

/**
 * Check for bundle size regression
 */
async function checkBundleSizeRegression(currentStats) {
  const baselinePath = 'performance-baseline.json';
  
  if (!existsSync(baselinePath)) {
    // Create baseline if it doesn't exist
    const baseline = {
      timestamp: new Date().toISOString(),
      bundleSize: currentStats.totalCompressed,
    };
    writeFileSync(baselinePath, JSON.stringify(baseline, null, 2));
    
    return {
      hasRegression: false,
      message: 'Baseline created',
      changePercent: 0,
    };
  }

  try {
    const baseline = JSON.parse(readFileSync(baselinePath, 'utf-8'));
    const changePercent = (currentStats.totalCompressed - baseline.bundleSize) / baseline.bundleSize;
    const hasRegression = changePercent > BUNDLE_SIZE_LIMITS.REGRESSION_THRESHOLD;

    return {
      hasRegression,
      changePercent,
      baseline: baseline.bundleSize,
      current: currentStats.totalCompressed,
      message: hasRegression ? 
        `Bundle size increased by ${(changePercent * 100).toFixed(1)}%` :
        `Bundle size change: ${(changePercent * 100).toFixed(1)}%`,
    };

  } catch (error) {
    return {
      hasRegression: false,
      message: 'Could not check regression',
      error: error.message,
    };
  }
}

/**
 * Generate comprehensive final report
 */
async function generateFinalReport(results) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = `complete-performance-report-${timestamp}.json`;

  // Save detailed JSON report
  writeFileSync(reportPath, JSON.stringify(results, null, 2));

  // Generate human-readable summary
  console.log('\n🎯 COMPLETE PERFORMANCE TEST RESULTS');
  console.log('=====================================');
  console.log(`Execution Time: ${results.summary.duration}`);
  console.log(`Tests Run: ${results.summary.totalTests}`);
  console.log(`Passed: ${results.summary.passed}`);
  console.log(`Failed: ${results.summary.failed}`);
  console.log(`Overall Result: ${results.summary.overallResult}\n`);

  console.log('Test Details:');
  Object.entries(results.tests).forEach(([testName, result]) => {
    const icon = result.status === 'PASSED' ? '✅' : '❌';
    console.log(`  ${icon} ${testName.toUpperCase()}: ${result.status}`);
    console.log(`     ${result.message}`);
    if (result.error) {
      console.log(`     Error: ${result.error}`);
    }
  });

  console.log(`\n📄 Detailed report saved: ${reportPath}`);

  // Performance summary
  if (results.summary.overallResult === 'PASSED') {
    console.log('\n🎉 All performance tests passed!');
    console.log('✨ SlotMachineWheel is ready for production');
    console.log('🚀 Performance targets achieved across all metrics');
  } else {
    console.log('\n⚠️  Some performance tests failed');
    console.log('🔧 Review the detailed report for optimization recommendations');
    
    // Generate recommendations
    const failedTests = Object.entries(results.tests).filter(([_, result]) => result.status === 'FAILED');
    if (failedTests.length > 0) {
      console.log('\n🛠️  Immediate Actions Required:');
      failedTests.forEach(([testName, result]) => {
        console.log(`   - Fix ${testName} issues: ${result.message}`);
      });
    }
  }
}

/**
 * Performance test summary for CI
 */
function generateCISummary(results) {
  return {
    passed: results.summary.overallResult === 'PASSED',
    summary: `${results.summary.passed}/${results.summary.totalTests} tests passed`,
    duration: results.summary.duration,
    failedTests: Object.entries(results.tests)
      .filter(([_, result]) => result.status === 'FAILED')
      .map(([name]) => name),
  };
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  runCompletePerformanceTests()
    .then(success => {
      const exitCode = success ? 0 : 1;
      console.log(`\n🏁 Performance testing completed with exit code ${exitCode}`);
      process.exit(exitCode);
    })
    .catch(error => {
      console.error('💥 Performance test suite crashed:', error);
      process.exit(1);
    });
}

export { 
  runCompletePerformanceTests, 
  validateBundleSize, 
  BUNDLE_SIZE_LIMITS,
  generateCISummary 
};