/**
 * SlotMachineWheelOptimized Component
 *
 * High-performance slot machine wheel optimized for 60fps with 5000+ participants.
 * Refactored from monolithic 579-line component into focused, maintainable architecture.
 *
 * Performance optimizations:
 * - Separated rendering utilities for better performance
 * - Memoized theme conversion and participant sorting
 * - Optimized subset management with intelligent swapping
 * - Real-time performance monitoring
 * - Reduced re-renders through careful state management
 *
 * @module SlotMachineWheelOptimized
 * @category Components
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Participant } from '@raffle-spinner/storage';
import { useSlotMachineAnimation } from './hooks/useSlotMachineAnimation';
import { BaseSpinnerProps, DEFAULT_SPINNER_THEME, SpinnerTheme } from '../types';
import {
  renderWheel,
  ITEM_HEIGHT,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  RenderConfig,
} from './utils/SlotMachineRenderer';
import { convertTheme } from './utils/SlotMachineTheme';
import {
  sortParticipantsByTicket,
  createInitialSubset,
  createWinnerSubset,
  findWinnerInFullList,
  SUBSET_SIZE,
} from './utils/SlotMachineSubset';
import { performanceMonitor } from './utils/SlotMachinePerformance';

export interface SlotMachineWheelOptimizedProps extends BaseSpinnerProps {
  /** Optional width for the canvas */
  canvasWidth?: number;
  /** Optional height for the canvas */
  canvasHeight?: number;
  /** Show debug info (dev only) */
  showDebug?: boolean;
  /** Enable performance monitoring */
  enablePerformanceMonitoring?: boolean;
}

/**
 * SlotMachineWheelOptimized Component
 *
 * High-performance slot machine wheel with advanced optimizations.
 * Maintains 60fps performance with 5000+ participants through intelligent
 * subset management and optimized rendering pipeline.
 */
export function SlotMachineWheelOptimized({
  participants,
  targetTicketNumber = '',
  settings,
  isSpinning,
  onSpinComplete,
  onError,
  theme = DEFAULT_SPINNER_THEME,
  className,
  canvasWidth = CANVAS_WIDTH,
  canvasHeight = CANVAS_HEIGHT,
  showDebug = false,
  enablePerformanceMonitoring = true,
}: SlotMachineWheelOptimizedProps) {
  // Performance monitoring setup
  useEffect(() => {
    if (enablePerformanceMonitoring) {
      performanceMonitor.start();
      return () => performanceMonitor.stop();
    }
  }, [enablePerformanceMonitoring]);

  // Core refs for performance
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isAnimatingRef = useRef(false);
  const hasSwappedRef = useRef(false);
  const hasInitializedRef = useRef(false);
  const lastParticipantsRef = useRef(participants);
  const finalPositionRef = useRef<number | null>(null);

  // State
  const [position, setPosition] = useState(0);
  const [displaySubset, setDisplaySubset] = useState<Participant[]>([]);

  // Memoized theme conversion for performance
  const internalTheme = useMemo(() => convertTheme(theme), [theme]);

  // Memoized render configuration
  const renderConfig: RenderConfig = useMemo(
    () => ({
      canvasWidth,
      canvasHeight,
      showDebug: showDebug && process.env.NODE_ENV === 'development',
    }),
    [canvasWidth, canvasHeight, showDebug]
  );

  // Memoized sorted participants to avoid expensive re-sorting
  const sortedParticipants = useMemo(() => {
    if (participants.length === 0) return [];
    return sortParticipantsByTicket(participants);
  }, [participants]);

  // Initialize wheel with optimized subset
  useEffect(() => {
    const participantsChanged = participants !== lastParticipantsRef.current;

    if (participantsChanged) {
      // Reset state for new competition
      hasInitializedRef.current = false;
      hasSwappedRef.current = false;
      finalPositionRef.current = null;
      lastParticipantsRef.current = participants;
    }

    if (hasInitializedRef.current && !participantsChanged) return;

    if (sortedParticipants.length > 0) {
      hasInitializedRef.current = true;
      const initialSubset = createInitialSubset(sortedParticipants);
      setDisplaySubset(initialSubset);

      if (finalPositionRef.current === null) {
        // Center the first ticket in view
        const startPosition = -2 * ITEM_HEIGHT;
        setPosition(startPosition);
      }
    }
  }, [sortedParticipants]);

  // Optimized winner finding function
  const findWinnerInFullListCallback = useCallback(() => {
    return findWinnerInFullList(participants, targetTicketNumber);
  }, [participants, targetTicketNumber]);

  // Optimized winner subset creation
  const createWinnerSubsetCallback = useCallback(() => {
    return createWinnerSubset(sortedParticipants, targetTicketNumber);
  }, [sortedParticipants, targetTicketNumber]);

  // Optimized max velocity handler for subset swapping
  const handleMaxVelocity = useCallback(() => {
    if (!hasSwappedRef.current) {
      hasSwappedRef.current = true;
      const winnerSubset = createWinnerSubsetCallback();

      // Find winner's new index in the subset
      const winnerValidation = require('./utils/SlotMachineSubset').validateWinnerInSubset(
        winnerSubset,
        targetTicketNumber
      );

      setDisplaySubset(winnerSubset);

      if (enablePerformanceMonitoring && showDebug) {
        console.debug('[Performance] Subset swapped at max velocity', {
          subsetSize: winnerSubset.length,
          winnerIndex: winnerValidation.winnerIndex,
          winnerFound: winnerValidation.isValid,
        });
      }

      return winnerValidation.winnerIndex;
    }
    return -1;
  }, [createWinnerSubsetCallback, targetTicketNumber, enablePerformanceMonitoring, showDebug]);

  // Performance-optimized drawing function
  const drawWheelOptimized = useCallback(
    (currentPosition: number, subset: Participant[]) => {
      const canvas = canvasRef.current;
      if (!canvas || subset.length === 0) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Start performance timing
      if (enablePerformanceMonitoring) {
        performanceMonitor.startRender();
      }

      // Render the wheel
      renderWheel(ctx, currentPosition, subset, internalTheme, renderConfig);

      // End performance timing and record frame
      if (enablePerformanceMonitoring) {
        performanceMonitor.endRender();
        performanceMonitor.recordFrame();
      }
    },
    [internalTheme, renderConfig, enablePerformanceMonitoring]
  );

  // Store current subset in ref for animation access
  const currentSubsetRef = useRef(displaySubset);
  useEffect(() => {
    currentSubsetRef.current = displaySubset;
  }, [displaySubset]);

  // Animation hook integration
  const { spin, cancel } = useSlotMachineAnimation({
    participants: displaySubset,
    targetTicketNumber,
    settings,
    onSpinComplete: (_winner) => {
      const actualWinner = findWinnerInFullListCallback();
      isAnimatingRef.current = false;

      if (actualWinner) {
        // Log performance metrics if enabled
        if (enablePerformanceMonitoring && showDebug) {
          const metrics = performanceMonitor.getMetrics();
          console.debug('[Performance] Spin completed', {
            fps: metrics.fps,
            avgFps: metrics.averageFps,
            frameDrops: metrics.frameDrops,
            renderTime: metrics.renderTime,
            memoryUsage: metrics.memoryUsage,
          });
        }

        onSpinComplete(actualWinner);
      } else {
        onError?.(`Ticket ${targetTicketNumber} not found`);
      }
    },
    onError: (error) => {
      isAnimatingRef.current = false;
      hasSwappedRef.current = false;
      onError?.(error);
    },
    onPositionUpdate: (pos: number) => {
      setPosition(pos);
      finalPositionRef.current = pos;
      drawWheelOptimized(pos, currentSubsetRef.current);
    },
    onMaxVelocity: handleMaxVelocity,
    itemHeight: ITEM_HEIGHT,
    getParticipants: () => currentSubsetRef.current,
  });

  // Handle spin start/stop with performance monitoring
  useEffect(() => {
    if (isSpinning && !isAnimatingRef.current) {
      isAnimatingRef.current = true;
      hasSwappedRef.current = false;

      if (enablePerformanceMonitoring) {
        performanceMonitor.start();
      }

      spin();
    } else if (!isSpinning && isAnimatingRef.current) {
      isAnimatingRef.current = false;
      cancel();

      if (enablePerformanceMonitoring) {
        performanceMonitor.stop();
      }
    }
  }, [isSpinning, spin, cancel, enablePerformanceMonitoring]);

  // Initial and update rendering
  useEffect(() => {
    if (displaySubset.length > 0) {
      const drawPosition = finalPositionRef.current ?? position;
      drawWheelOptimized(drawPosition, displaySubset);
    }
  }, [position, displaySubset, drawWheelOptimized]);

  // Performance warning effect (development only)
  useEffect(() => {
    if (!enablePerformanceMonitoring || !showDebug || process.env.NODE_ENV !== 'development') {
      return;
    }

    const checkPerformance = () => {
      if (!performanceMonitor.isPerformanceGood()) {
        const warnings = performanceMonitor.getPerformanceWarnings();
        console.warn('[Performance] Performance issues detected:', warnings);
      }
    };

    const interval = setInterval(checkPerformance, 2000);
    return () => clearInterval(interval);
  }, [enablePerformanceMonitoring, showDebug]);

  return (
    <div
      className={`inline-flex rounded-xl overflow-hidden ${className || ''}`}
      style={{ background: 'transparent' }}
      data-testid="slot-machine-wheel-optimized"
    >
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="block"
        style={{
          imageRendering: 'crisp-edges',
          background: 'transparent',
        }}
      />
      {enablePerformanceMonitoring && showDebug && process.env.NODE_ENV === 'development' && (
        <PerformanceOverlay />
      )}
    </div>
  );
}

/**
 * Performance overlay component for development monitoring
 */
function PerformanceOverlay() {
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