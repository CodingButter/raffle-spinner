/**
 * Storage Performance Benchmark
 * 
 * Purpose: Measure current chrome.storage.local performance to establish
 * baseline metrics for optimization efforts. Focuses on operations that
 * impact user experience during live drawing sessions.
 */

/* eslint-disable no-console, max-lines */

import { ChromeStorageAdapter } from './chrome-storage-adapter';
import { Competition, SpinnerSettings, SpinnerSession } from './types';

export interface BenchmarkResult {
  operation: string;
  duration: number;
  iterations: number;
  avgTime: number;
  p95Time: number;
  p99Time: number;
}

export interface BenchmarkSuite {
  suiteName: string;
  results: BenchmarkResult[];
  totalDuration: number;
  passed: boolean;
  target: number; // Target time in ms
}

/**
 * Performance benchmark class for storage operations
 */
export class StorageBenchmark {
  private storage = new ChromeStorageAdapter();
  private testCompetitions: Competition[] = [];
  private testSettings: SpinnerSettings = {
    minSpinDuration: 3,
    decelerationRate: 'medium'
  };

  /**
   * Generate test data for benchmarking
   */
  private generateTestData() {
    // Generate competitions with various participant counts
    const sizes = [10, 100, 1000, 5000];
    
    sizes.forEach((size, index) => {
      const competition: Competition = {
        id: `test-comp-${index}`,
        name: `Test Competition ${size}`,
        participants: Array.from({ length: size }, (_, i) => ({
          firstName: `First${i}`,
          lastName: `Last${i}`,
          ticketNumber: `T${i.toString().padStart(6, '0')}`
        })),
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      this.testCompetitions.push(competition);
    });
  }

  /**
   * Measure operation performance with multiple iterations
   */
  private async measureOperation(
    operationName: string,
    operation: () => Promise<void>,
    iterations: number = 10
  ): Promise<BenchmarkResult> {
    const times: number[] = [];
    
    // Warm-up runs
    for (let i = 0; i < 3; i++) {
      await operation();
    }
    
    // Actual measurements
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await operation();
      const end = performance.now();
      times.push(end - start);
    }
    
    times.sort((a, b) => a - b);
    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const p95Time = times[Math.floor(times.length * 0.95)];
    const p99Time = times[Math.floor(times.length * 0.99)];
    
    return {
      operation: operationName,
      duration: times.reduce((sum, time) => sum + time, 0),
      iterations,
      avgTime,
      p95Time,
      p99Time
    };
  }

  /**
   * Benchmark core read operations
   */
  async benchmarkReadOperations(): Promise<BenchmarkSuite> {
    console.log('🔍 Benchmarking READ operations...');
    
    const results: BenchmarkResult[] = [];
    const target = 10; // 10ms target
    
    // Setup test data
    await this.storage.clear();
    await this.storage.saveCompetition(this.testCompetitions[0]); // 10 participants
    await this.storage.saveCompetition(this.testCompetitions[1]); // 100 participants
    await this.storage.saveCompetition(this.testCompetitions[2]); // 1000 participants
    
    // Benchmark getCompetitions
    const getCompetitionsResult = await this.measureOperation(
      'getCompetitions()',
      async () => {
        await this.storage.getCompetitions();
      },
      20
    );
    results.push(getCompetitionsResult);
    
    // Benchmark getCompetition
    const getCompetitionResult = await this.measureOperation(
      'getCompetition(id)',
      async () => {
        await this.storage.getCompetition(this.testCompetitions[0].id);
      },
      20
    );
    results.push(getCompetitionResult);
    
    // Benchmark getSettings
    const getSettingsResult = await this.measureOperation(
      'getSettings()',
      async () => {
        await this.storage.getSettings();
      },
      20
    );
    results.push(getSettingsResult);

    const totalDuration = results.reduce((sum, result) => sum + result.duration, 0);
    const passed = results.every(result => result.p95Time <= target);
    
    return {
      suiteName: 'Read Operations',
      results,
      totalDuration,
      passed,
      target
    };
  }

  /**
   * Benchmark core write operations
   */
  async benchmarkWriteOperations(): Promise<BenchmarkSuite> {
    console.log('✏️ Benchmarking WRITE operations...');
    
    const results: BenchmarkResult[] = [];
    const target = 10; // 10ms target
    
    await this.storage.clear();
    
    // Benchmark saveCompetition (small)
    const saveSmallResult = await this.measureOperation(
      'saveCompetition(10 participants)',
      async () => {
        await this.storage.saveCompetition(this.testCompetitions[0]);
      },
      15
    );
    results.push(saveSmallResult);
    
    // Benchmark saveCompetition (large)
    const saveLargeResult = await this.measureOperation(
      'saveCompetition(1000 participants)',
      async () => {
        await this.storage.saveCompetition(this.testCompetitions[2]);
      },
      10
    );
    results.push(saveLargeResult);
    
    // Benchmark saveSettings
    const saveSettingsResult = await this.measureOperation(
      'saveSettings()',
      async () => {
        await this.storage.saveSettings(this.testSettings);
      },
      15
    );
    results.push(saveSettingsResult);

    const totalDuration = results.reduce((sum, result) => sum + result.duration, 0);
    const passed = results.every(result => result.p95Time <= target);
    
    return {
      suiteName: 'Write Operations',
      results,
      totalDuration,
      passed,
      target
    };
  }

  /**
   * Benchmark high-frequency operations during live sessions
   */
  async benchmarkLiveSessionOperations(): Promise<BenchmarkSuite> {
    console.log('🎯 Benchmarking LIVE SESSION operations...');
    
    const results: BenchmarkResult[] = [];
    const target = 5; // 5ms target for live session operations
    
    await this.storage.clear();
    
    // Set up session data
    const session: SpinnerSession = {
      selectedCompetitionId: 'test-comp-0',
      sessionWinners: [],
      currentTicketNumber: 'T000001',
      isSpinning: false,
      spinTarget: 'T000005',
      sessionStartTime: Date.now(),
      lastActivity: Date.now()
    };
    
    // Benchmark session reads (critical during spinning)
    const getSessionResult = await this.measureOperation(
      'getSession()',
      async () => {
        await this.storage.getSession();
      },
      30
    );
    results.push(getSessionResult);
    
    // Benchmark session saves (happens during winner selection)
    const saveSessionResult = await this.measureOperation(
      'saveSession()',
      async () => {
        session.lastActivity = Date.now();
        await this.storage.saveSession(session);
      },
      20
    );
    results.push(saveSessionResult);
    
    // Benchmark raffle count increment (happens after each spin)
    const incrementRaffleResult = await this.measureOperation(
      'incrementRaffleCount()',
      async () => {
        await this.storage.incrementRaffleCount();
      },
      20
    );
    results.push(incrementRaffleResult);

    const totalDuration = results.reduce((sum, result) => sum + result.duration, 0);
    const passed = results.every(result => result.p95Time <= target);
    
    return {
      suiteName: 'Live Session Operations',
      results,
      totalDuration,
      passed,
      target
    };
  }

  /**
   * Benchmark bulk operations that affect UI responsiveness
   */
  async benchmarkBulkOperations(): Promise<BenchmarkSuite> {
    console.log('📦 Benchmarking BULK operations...');
    
    const results: BenchmarkResult[] = [];
    const target = 50; // 50ms target for bulk operations
    
    await this.storage.clear();
    
    // Benchmark saving multiple competitions (CSV import scenario)
    const saveBulkResult = await this.measureOperation(
      'saveBulkCompetitions(4 competitions)',
      async () => {
        for (const competition of this.testCompetitions) {
          await this.storage.saveCompetition(competition);
        }
      },
      5
    );
    results.push(saveBulkResult);
    
    // Benchmark loading all competitions (UI load scenario)
    const loadAllResult = await this.measureOperation(
      'loadAllWithCompetitions()',
      async () => {
        await this.storage.getCompetitions();
        await this.storage.getSettings();
        await this.storage.getSavedMappings();
        await this.storage.getSession();
      },
      10
    );
    results.push(loadAllResult);

    const totalDuration = results.reduce((sum, result) => sum + result.duration, 0);
    const passed = results.every(result => result.p95Time <= target);
    
    return {
      suiteName: 'Bulk Operations',
      results,
      totalDuration,
      passed,
      target
    };
  }

  /**
   * Run complete benchmark suite
   */
  async runFullBenchmark(): Promise<{
    suites: BenchmarkSuite[];
    overallPassed: boolean;
    summary: string;
  }> {
    console.log('🚀 Starting Storage Performance Benchmark Suite...');
    const startTime = performance.now();
    
    // Generate test data
    this.generateTestData();
    
    // Run benchmark suites
    const suites: BenchmarkSuite[] = [];
    
    suites.push(await this.benchmarkReadOperations());
    suites.push(await this.benchmarkWriteOperations());
    suites.push(await this.benchmarkLiveSessionOperations());
    suites.push(await this.benchmarkBulkOperations());
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    const overallPassed = suites.every(suite => suite.passed);
    
    const summary = this.generateSummaryReport(suites, totalTime, overallPassed);
    
    return {
      suites,
      overallPassed,
      summary
    };
  }

  /**
   * Generate human-readable summary report
   */
  private generateSummaryReport(
    suites: BenchmarkSuite[],
    totalTime: number,
    passed: boolean
  ): string {
    let report = '\\n📊 STORAGE PERFORMANCE BENCHMARK RESULTS\\n';
    report += '================================================\\n\\n';
    
    suites.forEach(suite => {
      report += `${suite.suiteName}:\\n`;
      report += `  Status: ${suite.passed ? '✅ PASSED' : '❌ FAILED'} (Target: <${suite.target}ms)\\n`;
      report += `  Duration: ${suite.totalDuration.toFixed(2)}ms\\n\\n`;
      
      suite.results.forEach(result => {
        report += `  ${result.operation}:\\n`;
        report += `    Avg: ${result.avgTime.toFixed(2)}ms\\n`;
        report += `    P95: ${result.p95Time.toFixed(2)}ms\\n`;
        report += `    P99: ${result.p99Time.toFixed(2)}ms\\n\\n`;
      });
    });
    
    report += `\\nOVERALL RESULT: ${passed ? '✅ PASSED' : '❌ FAILED'}\\n`;
    report += `Total Benchmark Time: ${totalTime.toFixed(2)}ms\\n`;
    
    return report;
  }

  /**
   * Clean up test data
   */
  async cleanup(): Promise<void> {
    await this.storage.clear();
  }
}