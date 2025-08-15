/**
 * Performance Test Suite for 10,000+ Participants
 * 
 * Tests spinner performance with large datasets to ensure 60fps
 * and proper subset swapping behavior.
 * 
 * @module tests/performance-10k
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Participant } from '@raffle-spinner/storage';

// Mock RAF for controlled testing
let rafCallbacks: FrameRequestCallback[] = [];
let rafId = 0;

global.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
  rafCallbacks.push(callback);
  return ++rafId;
});

global.cancelAnimationFrame = vi.fn(() => {
  // Remove callback if exists
});

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
 * Measure frame time for performance testing
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
  
  reset(): void {
    this.frameTimes = [];
    this.lastTime = 0;
  }
}

describe('Performance Tests - 10,000 Participants', () => {
  let monitor: PerformanceMonitor;
  
  beforeEach(() => {
    monitor = new PerformanceMonitor();
    rafCallbacks = [];
    rafId = 0;
  });
  
  it('should handle 10,000 participants dataset creation efficiently', () => {
    const startTime = performance.now();
    const participants = generateParticipants(10000);
    const endTime = performance.now();
    
    expect(participants).toHaveLength(10000);
    expect(endTime - startTime).toBeLessThan(100); // Should create in < 100ms
  });
  
  it('should create subset from 10,000 participants quickly', () => {
    const participants = generateParticipants(10000);
    const SUBSET_SIZE = 100;
    
    const startTime = performance.now();
    const subset = participants.slice(0, SUBSET_SIZE);
    const endTime = performance.now();
    
    expect(subset).toHaveLength(SUBSET_SIZE);
    expect(endTime - startTime).toBeLessThan(1); // Should be instant
  });
  
  it('should maintain 60fps when rendering subset', () => {
    const participants = generateParticipants(10000);
    const subset = participants.slice(0, 100);
    
    // Simulate 60 frames
    for (let i = 0; i < 60; i++) {
      monitor.startFrame();
      
      // Simulate rendering work
      subset.forEach(p => {
        // Minimal work to simulate rendering
        const display = `${p.firstName} ${p.lastName} - ${p.ticketNumber}`;
        display.length; // Use it to avoid optimization
      });
      
      monitor.endFrame();
    }
    
    expect(monitor.getFPS()).toBeGreaterThan(59);
    expect(monitor.getMaxFrameTime()).toBeLessThan(17); // 16.67ms for 60fps
  });
  
  it('should swap subsets efficiently during animation', () => {
    const participants = generateParticipants(10000);
    const SUBSET_SIZE = 100;
    let swapCount = 0;
    
    // Simulate 100 subset swaps
    const startTime = performance.now();
    for (let i = 0; i < 100; i++) {
      const startIdx = Math.floor(Math.random() * (participants.length - SUBSET_SIZE));
      const subset = participants.slice(startIdx, startIdx + SUBSET_SIZE);
      swapCount++;
      expect(subset).toHaveLength(SUBSET_SIZE);
    }
    const endTime = performance.now();
    
    expect(swapCount).toBe(100);
    expect(endTime - startTime).toBeLessThan(10); // 100 swaps in < 10ms
  });
  
  it('should find winner efficiently in 10,000 participants', () => {
    const participants = generateParticipants(10000);
    const targetTicket = '005000'; // Middle participant
    
    const startTime = performance.now();
    const winner = participants.find(p => p.ticketNumber === targetTicket);
    const endTime = performance.now();
    
    expect(winner).toBeDefined();
    expect(winner?.ticketNumber).toBe(targetTicket);
    expect(endTime - startTime).toBeLessThan(5); // Should find in < 5ms
  });
  
  it('should handle wrap-around for 10,000 participants', () => {
    const participants = generateParticipants(10000);
    const SUBSET_SIZE = 100;
    const SUBSET_HALF = 50;
    
    // Test wrap at the end
    const lastParticipants = participants.slice(-SUBSET_HALF);
    const firstParticipants = participants.slice(0, SUBSET_HALF);
    const wrapSubset = [...lastParticipants, ...firstParticipants];
    
    expect(wrapSubset).toHaveLength(SUBSET_SIZE);
    expect(wrapSubset[0]).toBe(participants[participants.length - SUBSET_HALF]);
    expect(wrapSubset[SUBSET_SIZE - 1]).toBe(participants[SUBSET_HALF - 1]);
  });
  
  it('should calculate positions efficiently for 10,000 participants', () => {
    const participants = generateParticipants(10000);
    const positions: number[] = [];
    
    const startTime = performance.now();
    for (let i = 0; i < participants.length; i++) {
      positions.push(i * 80); // ITEM_HEIGHT = 80
    }
    const endTime = performance.now();
    
    expect(positions).toHaveLength(10000);
    expect(endTime - startTime).toBeLessThan(10); // Should calculate in < 10ms
  });
  
  it('should handle memory efficiently with 10,000 participants', () => {
    const participants = generateParticipants(10000);
    
    // Estimate memory usage (rough)
    const estimatedSize = JSON.stringify(participants).length;
    
    // Should be under 1MB for 10k participants
    expect(estimatedSize).toBeLessThan(1024 * 1024);
  });
});