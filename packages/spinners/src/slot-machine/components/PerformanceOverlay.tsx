/**
 * Performance Overlay Component
 * 
 * Real-time performance metrics display for development
 */

import React, { useState, useEffect } from 'react';
import { performanceMonitor } from '../utils/SlotMachinePerformance';

/**
 * Performance overlay component for development monitoring
 */
export function PerformanceOverlay() {
  const [metrics, setMetrics] = useState(performanceMonitor.getMetrics());

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(performanceMonitor.getMetrics());
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        top: 10,
        right: 10,
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '8px',
        borderRadius: '4px',
        fontSize: '11px',
        fontFamily: 'monospace',
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    >
      <div>FPS: {metrics.fps.toFixed(1)}</div>
      <div>Avg: {metrics.averageFps.toFixed(1)}</div>
      <div>Render: {metrics.renderTime.toFixed(1)}ms</div>
      <div>Mem: {metrics.memoryUsage.toFixed(1)}MB</div>
      {metrics.frameDrops > 0 && <div>Drops: {metrics.frameDrops}</div>}
    </div>
  );
}