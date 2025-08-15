/**
 * Performance Monitoring Hook for Slot Machine
 * 
 * Provides real-time performance monitoring during spinner animation
 * with automatic warnings for performance degradation.
 * 
 * @module usePerformanceMonitor
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PerformanceBenchmark, PerformanceMetrics } from '../utils/performance-benchmark';

export interface UsePerformanceMonitorOptions {
  enabled?: boolean;
  logInterval?: number; // How often to log metrics (ms)
  warnThreshold?: number; // FPS below this triggers warning
  participantCount: number;
  subsetSize?: number;
}

export interface UsePerformanceMonitorReturn {
  metrics: PerformanceMetrics | null;
  isMonitoring: boolean;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  resetMetrics: () => void;
}

/**
 * Hook for monitoring spinner performance
 */
export function usePerformanceMonitor({
  enabled = false,
  logInterval = 2000,
  warnThreshold = 50,
  participantCount,
  subsetSize = 100,
}: UsePerformanceMonitorOptions): UsePerformanceMonitorReturn {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const benchmarkRef = useRef<PerformanceBenchmark | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize benchmark
  useEffect(() => {
    if (!benchmarkRef.current) {
      benchmarkRef.current = new PerformanceBenchmark();
    }
    
    return () => {
      if (benchmarkRef.current) {
        benchmarkRef.current.stop();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  // Start monitoring
  const startMonitoring = useCallback(() => {
    if (!benchmarkRef.current) return;
    
    console.log(`🎯 Performance monitoring started (${participantCount.toLocaleString()} participants)`);
    
    benchmarkRef.current.start();
    setIsMonitoring(true);
    
    // Set up periodic metric updates
    intervalRef.current = setInterval(() => {
      if (!benchmarkRef.current) return;
      
      const currentMetrics = benchmarkRef.current.getMetrics(participantCount, subsetSize);
      setMetrics(currentMetrics);
      
      // Warn if performance is degraded
      if (currentMetrics.averageFps < warnThreshold) {
        console.warn(
          `⚠️ Performance Warning: FPS dropped to ${currentMetrics.averageFps} (target: ${warnThreshold}+)`
        );
      }
      
      // Log detailed metrics periodically
      if (process.env.NODE_ENV === 'development') {
        benchmarkRef.current.logReport(participantCount, subsetSize);
      }
    }, logInterval);
  }, [participantCount, subsetSize, logInterval, warnThreshold]);
  
  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    if (!benchmarkRef.current) return;
    
    benchmarkRef.current.stop();
    setIsMonitoring(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Final report
    const finalMetrics = benchmarkRef.current.getMetrics(participantCount, subsetSize);
    setMetrics(finalMetrics);
    
    console.log('🏁 Performance monitoring stopped');
    benchmarkRef.current.logReport(participantCount, subsetSize);
  }, [participantCount, subsetSize]);
  
  // Reset metrics
  const resetMetrics = useCallback(() => {
    if (benchmarkRef.current) {
      benchmarkRef.current.reset();
    }
    setMetrics(null);
  }, []);
  
  // Auto-start if enabled
  useEffect(() => {
    if (enabled && !isMonitoring) {
      startMonitoring();
    } else if (!enabled && isMonitoring) {
      stopMonitoring();
    }
  }, [enabled, isMonitoring, startMonitoring, stopMonitoring]);
  
  return {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    resetMetrics,
  };
}

/**
 * Performance overlay component for development
 */
export function PerformanceOverlay({ metrics }: { metrics: PerformanceMetrics | null }): JSX.Element | null {
  if (!metrics || process.env.NODE_ENV !== 'development') return null;
  
  const fpsColor = metrics.averageFps >= 55 ? '#10b981' : 
                   metrics.averageFps >= 45 ? '#f59e0b' : '#ef4444';
  
  return (
    <div
      style={{
        position: 'fixed',
        top: 10,
        right: 10,
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontFamily: 'monospace',
        fontSize: '12px',
        zIndex: 9999,
        minWidth: '200px',
      }}
    >
      <div style={{ marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>
        Performance Monitor
      </div>
      <div>Participants: {metrics.participantCount.toLocaleString()}</div>
      <div style={{ color: fpsColor, fontWeight: 'bold' }}>
        FPS: {metrics.fps} (avg: {metrics.averageFps})
      </div>
      <div>Frame Time: {metrics.frameTime}ms</div>
      <div>Dropped: {metrics.droppedFrames}/{metrics.totalFrames}</div>
      {metrics.memoryUsed && (
        <div>Memory: {(metrics.memoryUsed / 1024 / 1024).toFixed(1)}MB</div>
      )}
    </div>
  );
}