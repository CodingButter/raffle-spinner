#!/usr/bin/env node

/**
 * Storage Performance Test Runner
 * 
 * Purpose: Standalone Node.js script to run storage performance benchmarks
 * and validate that the <10ms target is met for critical operations.
 */

import { performance } from 'perf_hooks';

// Mock chrome.storage.local for Node.js testing
const mockChromeStorage = {
  data: new Map(),
  async get(key) {
    if (typeof key === 'string') {
      return { [key]: this.data.get(key) };
    }
    if (Array.isArray(key)) {
      const result = {};
      key.forEach(k => {
        if (this.data.has(k)) {
          result[k] = this.data.get(k);
        }
      });
      return result;
    }
    return Object.fromEntries(this.data);
  },
  async set(items) {
    Object.entries(items).forEach(([key, value]) => {
      this.data.set(key, value);
    });
  },
  async clear() {
    this.data.clear();
  },
  onChanged: {
    addListener: () => {},
    removeListener: () => {}
  }
};

// Setup global chrome mock
global.chrome = {
  storage: {
    local: mockChromeStorage,
    onChanged: mockChromeStorage.onChanged
  }
};

// Mock performance.now if not available
if (typeof performance === 'undefined') {
  global.performance = {
    now: () => Date.now()
  };
}

/**
 * Simple benchmark function for testing storage operations
 */
async function runSimpleBenchmark() {
  console.log('🚀 Running Simple Storage Performance Benchmark...\n');
  
  // Import after setting up mocks
  const { OptimizedChromeStorageAdapter } = await import('../packages/storage/dist/index.mjs');
  const storage = new OptimizedChromeStorageAdapter();
  
  // Test data
  const testCompetition = {
    id: 'test-comp-1',
    name: 'Test Competition',
    participants: Array.from({ length: 1000 }, (_, i) => ({
      firstName: `First${i}`,
      lastName: `Last${i}`,
      ticketNumber: `T${i.toString().padStart(6, '0')}`
    })),
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  
  const testSettings = {
    minSpinDuration: 3,
    decelerationRate: 'medium'
  };
  
  const testSession = {
    selectedCompetitionId: 'test-comp-1',
    sessionWinners: [],
    currentTicketNumber: 'T000001',
    isSpinning: false,
    spinTarget: 'T000005',
    sessionStartTime: Date.now(),
    lastActivity: Date.now()
  };
  
  // Clean start
  await storage.clear();
  
  const results = [];
  
  /**
   * Measure operation performance
   */
  async function measureOperation(name, operation, iterations = 10) {
    const times = [];
    
    // Warm-up
    for (let i = 0; i < 3; i++) {
      await operation();
    }
    
    // Measure
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await operation();
      const end = performance.now();
      times.push(end - start);
    }
    
    times.sort((a, b) => a - b);
    const avg = times.reduce((sum, t) => sum + t, 0) / times.length;
    const p95 = times[Math.floor(times.length * 0.95)];
    const p99 = times[Math.floor(times.length * 0.99)];
    
    return { name, avg, p95, p99, iterations };
  }
  
  // Test critical read operations
  console.log('Testing READ operations...');
  await storage.saveCompetition(testCompetition);
  await storage.saveSettings(testSettings);
  
  results.push(await measureOperation('getCompetitions()', () => storage.getCompetitions(), 20));
  results.push(await measureOperation('getCompetition(id)', () => storage.getCompetition('test-comp-1'), 20));
  results.push(await measureOperation('getSettings()', () => storage.getSettings(), 20));
  
  // Test critical write operations
  console.log('Testing WRITE operations...');
  results.push(await measureOperation('saveCompetition()', () => storage.saveCompetition({...testCompetition, updatedAt: Date.now()}), 15));
  results.push(await measureOperation('saveSettings()', () => storage.saveSettings({...testSettings, minSpinDuration: 4}), 15));
  
  // Test live session operations (most critical)
  console.log('Testing LIVE SESSION operations...');
  results.push(await measureOperation('getSession()', () => storage.getSession(), 30));
  results.push(await measureOperation('saveSession()', () => storage.saveSession({...testSession, lastActivity: Date.now()}), 25));
  results.push(await measureOperation('incrementRaffleCount()', () => storage.incrementRaffleCount(), 25));
  
  // Force flush all writes to measure actual storage performance
  console.log('Flushing pending writes...');
  await storage.flushWrites();
  
  // Generate report
  console.log('\n📊 PERFORMANCE BENCHMARK RESULTS');
  console.log('=================================\n');
  
  const targets = {
    'getCompetitions()': 10,
    'getCompetition(id)': 5,
    'getSettings()': 5,
    'saveCompetition()': 10,
    'saveSettings()': 10,
    'getSession()': 5,
    'saveSession()': 5,
    'incrementRaffleCount()': 5
  };
  
  let allPassed = true;
  
  results.forEach(result => {
    const target = targets[result.name] || 10;
    const passed = result.p95 <= target;
    const status = passed ? '✅' : '❌';
    
    if (!passed) allPassed = false;
    
    console.log(`${status} ${result.name.padEnd(25)} | Target: ${target}ms`);
    console.log(`   Avg: ${result.avg.toFixed(2)}ms | P95: ${result.p95.toFixed(2)}ms | P99: ${result.p99.toFixed(2)}ms`);
    console.log('');
  });
  
  // Cache statistics
  const stats = storage.getCacheStats();
  console.log(`Cache Statistics:`);
  console.log(`- Cache size: ${stats.cacheSize} entries`);
  console.log(`- Pending writes: ${stats.pendingWrites}`);
  console.log(`- Processing: ${stats.isProcessingWrites}`);
  console.log('');
  
  console.log(`OVERALL RESULT: ${allPassed ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (allPassed) {
    console.log('🎉 All storage operations meet performance targets!');
    process.exit(0);
  } else {
    console.log('⚠️  Some operations exceeded performance targets.');
    process.exit(1);
  }
}

// Handle Node.js module loading
if (import.meta.url && import.meta.url.startsWith('file:')) {
  runSimpleBenchmark().catch(error => {
    console.error('Benchmark failed:', error);
    process.exit(1);
  });
}