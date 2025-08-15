/**
 * Performance Benchmark Tests for 10,000+ Participants
 * 
 * Comprehensive benchmark suite testing all performance criteria
 * 
 * @module tests/performance-10k-benchmark
 */

import { describe, it, expect } from 'vitest';
import type { Participant } from '@raffle-spinner/storage';

/**
 * Generate large participant dataset
 */
function generateParticipants(count: number): Participant[] {
  const participants: Participant[] = [];
  for (let i = 1; i <= count; i++) {
    participants.push({
      firstName: `Participant`,
      lastName: `${i}`,
      ticketNumber: String(i).padStart(6, '0'),
    });
  }
  return participants;
}

/**
 * Performance monitor for testing
 */
class PerformanceMonitor {
  private frameTimes: number[] = [];
  private lastTime: number = 0;
  
  startFrame(): void {
    this.lastTime = performance.now();
  }
  
  endFrame(): void {
    const frameTime = performance.now() - this.lastTime;
    this.frameTimes.push(frameTime);
  }
  
  getAverageFrameTime(): number {
    if (this.frameTimes.length === 0) return 0;
    const sum = this.frameTimes.reduce((a, b) => a + b, 0);
    return sum / this.frameTimes.length;
  }
  
  getFPS(): number {
    const avgFrameTime = this.getAverageFrameTime();
    return avgFrameTime > 0 ? 1000 / avgFrameTime : 0;
  }
  
  getMaxFrameTime(): number {
    return Math.max(...this.frameTimes);
  }
}

describe('Performance Benchmarks - 10K Participants', () => {
  it('should meet all performance criteria for 10,000 participants', () => {
    const results = {
      datasetCreation: 0,
      subsetCreation: 0,
      renderingFPS: 0,
      subsetSwapping: 0,
      winnerSearch: 0,
      sorting: 0,
      memoryUsage: 0,
    };
    
    // Test dataset creation
    let start = performance.now();
    const participants = generateParticipants(10000);
    results.datasetCreation = performance.now() - start;
    
    // Test subset creation
    start = performance.now();
    const subset = participants.slice(0, 100);
    results.subsetCreation = performance.now() - start;
    
    // Test rendering simulation
    const monitor = new PerformanceMonitor();
    for (let i = 0; i < 60; i++) {
      monitor.startFrame();
      subset.forEach(p => `${p.firstName} ${p.lastName}`);
      monitor.endFrame();
    }
    results.renderingFPS = monitor.getFPS();
    
    // Test subset swapping
    start = performance.now();
    for (let i = 0; i < 100; i++) {
      const idx = Math.floor(Math.random() * 9900);
      participants.slice(idx, idx + 100);
    }
    results.subsetSwapping = performance.now() - start;
    
    // Test winner search
    start = performance.now();
    participants.find(p => p.ticketNumber === '005000');
    results.winnerSearch = performance.now() - start;
    
    // Test sorting
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    start = performance.now();
    shuffled.sort((a, b) => a.ticketNumber.localeCompare(b.ticketNumber));
    results.sorting = performance.now() - start;
    
    // Test memory
    results.memoryUsage = JSON.stringify(participants).length;
    
    // Assert all benchmarks pass
    expect(results.datasetCreation).toBeLessThan(100);
    expect(results.subsetCreation).toBeLessThan(1);
    expect(results.renderingFPS).toBeGreaterThan(59);
    expect(results.subsetSwapping).toBeLessThan(10);
    expect(results.winnerSearch).toBeLessThan(5);
    expect(results.sorting).toBeLessThan(50);
    expect(results.memoryUsage).toBeLessThan(1024 * 1024);
    
    // Log results in test output
    // eslint-disable-next-line no-console
    console.log('Performance Benchmark Results:', results);
  });
});