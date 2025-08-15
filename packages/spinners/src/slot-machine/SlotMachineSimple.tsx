/**
 * Simplified Slot Machine Component
 * 
 * Key simplifications:
 * 1. Winner always placed at index 0 of subset
 * 2. Wheel always returns to starting position (0)
 * 3. No complex position calculations
 * 4. Configurable rotations instead of duration
 * 5. Bezier curve for speed control
 */

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Participant } from '@raffle-spinner/storage';
import { normalizeTicketNumber } from '@drawday/utils';
import { drawSlotMachineSegment } from './components/SlotMachineSegment';
import { drawSlotMachineFrame } from './components/SlotMachineFrame';
import { BaseSpinnerProps } from '../types';
import type { ThemeSettings } from '@drawday/types';

// Visual constants
const ITEM_HEIGHT = 80;
const VISIBLE_ITEMS = 5;
const VIEWPORT_HEIGHT = VISIBLE_ITEMS * ITEM_HEIGHT;
const VIEWPORT_TOP = 20;
const VIEWPORT_LEFT = 0;
const VIEWPORT_WIDTH = 400;
const WHEEL_WIDTH = 400;
const PERSPECTIVE_SCALE = 1.0;
const SUBSET_SIZE = 100;

// Default bezier curve (ease-in-out)
const DEFAULT_BEZIER = {
  x1: 0.42,
  y1: 0,
  x2: 0.58,
  y2: 1.0
};

export interface SlotMachineSimpleProps extends BaseSpinnerProps {
  rotations?: number; // Number of full rotations (default: 5)
  bezierCurve?: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
  showDebug?: boolean; // Compatibility with old prop
}

// Helper to provide default theme if not provided
function getTheme(theme?: Partial<ThemeSettings>): ThemeSettings {
  const defaultTheme: ThemeSettings = {
    colors: {
      primary: '#3B82F6',
      secondary: '#10B981',
      accent: '#F59E0B',
      background: '#1F2937',
      foreground: '#F9FAFB',
      card: '#374151',
      cardForeground: '#F9FAFB',
      winner: '#10B981',
      winnerGlow: '#34D399',
    },
    spinnerStyle: {
      type: 'slotMachine',
      nameSize: 'large',
      ticketSize: 'extra-large',
      nameColor: '#F9FAFB',
      ticketColor: '#3B82F6',
      backgroundColor: '#1F2937',
      borderColor: '#4B5563',
      highlightColor: '#F59E0B',
    },
    branding: {
      logoPosition: 'center',
      showCompanyName: true,
    },
  };

  if (!theme) return defaultTheme;

  return {
    colors: { ...defaultTheme.colors, ...theme.colors },
    spinnerStyle: { ...defaultTheme.spinnerStyle, ...theme.spinnerStyle },
    branding: { ...defaultTheme.branding, ...theme.branding },
    customCSS: theme.customCSS,
  };
}

// Cubic bezier easing function
function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  return (t: number): number => {
    // Newton-Raphson iteration for cubic bezier
    const epsilon = 0.001;
    let x = t;
    
    for (let i = 0; i < 8; i++) {
      const cx = 3 * x1;
      const bx = 3 * (x2 - x1) - cx;
      const ax = 1 - cx - bx;
      
      const currentX = ax * x * x * x + bx * x * x + cx * x;
      const dx = currentX - t;
      
      if (Math.abs(dx) < epsilon) break;
      
      const currentSlope = 3 * ax * x * x + 2 * bx * x + cx;
      if (Math.abs(currentSlope) < epsilon) break;
      
      x -= dx / currentSlope;
    }
    
    // Calculate y from x
    const cy = 3 * y1;
    const by = 3 * (y2 - y1) - cy;
    const ay = 1 - cy - by;
    
    return ay * x * x * x + by * x * x + cy * x;
  };
}

export function SlotMachineSimple({
  participants,
  targetTicketNumber,
  isSpinning,
  onSpinComplete,
  theme,
  settings,
  rotations = 5,
  bezierCurve = DEFAULT_BEZIER,
}: SlotMachineSimpleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [displaySubset, setDisplaySubset] = useState<Participant[]>([]);
  const [position, setPosition] = useState(0);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const isAnimatingRef = useRef(false);
  
  const internalTheme = getTheme(theme as Partial<ThemeSettings>);
  const canvasWidth = 440;
  const canvasHeight = 440;

  // Sort participants by ticket number
  const sortedParticipants = useMemo(() => {
    return [...participants].sort((a, b) => {
      const aNum = normalizeTicketNumber(a.ticketNumber);
      const bNum = normalizeTicketNumber(b.ticketNumber);
      return aNum.localeCompare(bNum, undefined, { numeric: true });
    });
  }, [participants]);

  // Create subset with winner at index 0
  const createWinnerSubset = useCallback((): Participant[] => {
    if (!targetTicketNumber || sortedParticipants.length === 0) {
      return sortedParticipants.slice(0, SUBSET_SIZE);
    }

    const normalizedTarget = normalizeTicketNumber(targetTicketNumber);
    const winnerIndex = sortedParticipants.findIndex(
      p => normalizeTicketNumber(p.ticketNumber) === normalizedTarget
    );

    if (winnerIndex === -1) {
      console.error('[SlotMachine] Winner not found:', targetTicketNumber);
      return sortedParticipants.slice(0, SUBSET_SIZE);
    }

    const winner = sortedParticipants[winnerIndex];
    let subset: Participant[] = [winner]; // Winner at index 0

    // Fill the rest of the subset
    if (sortedParticipants.length <= SUBSET_SIZE) {
      // Use all participants, starting with winner
      const beforeWinner = sortedParticipants.slice(0, winnerIndex);
      const afterWinner = sortedParticipants.slice(winnerIndex + 1);
      subset = [winner, ...afterWinner, ...beforeWinner];
      
      // Repeat if needed to fill SUBSET_SIZE
      while (subset.length < SUBSET_SIZE) {
        subset.push(...sortedParticipants.slice(0, Math.min(sortedParticipants.length, SUBSET_SIZE - subset.length)));
      }
    } else {
      // Take participants around the winner
      let beforeCount = Math.floor((SUBSET_SIZE - 1) / 2);
      let afterCount = SUBSET_SIZE - 1 - beforeCount;
      
      // Adjust if not enough before or after
      const actualBefore = Math.min(beforeCount, winnerIndex);
      const actualAfter = Math.min(afterCount, sortedParticipants.length - winnerIndex - 1);
      
      // Rebalance if needed
      if (actualBefore < beforeCount) {
        afterCount += (beforeCount - actualBefore);
      }
      if (actualAfter < afterCount) {
        beforeCount += (afterCount - actualAfter);
      }
      
      const startIdx = Math.max(0, winnerIndex - beforeCount);
      const endIdx = Math.min(sortedParticipants.length, winnerIndex + afterCount + 1);
      
      const nearbyParticipants = sortedParticipants.slice(startIdx, endIdx);
      const winnerPosInSlice = winnerIndex - startIdx;
      
      // Rearrange so winner is at index 0
      subset = [
        winner,
        ...nearbyParticipants.slice(winnerPosInSlice + 1),
        ...nearbyParticipants.slice(0, winnerPosInSlice)
      ];
    }

    console.log('[SlotMachine] Created winner subset:', {
      winnerTicket: winner.ticketNumber,
      subsetSize: subset.length,
      firstTicket: subset[0]?.ticketNumber,
      lastTicket: subset[subset.length - 1]?.ticketNumber
    });

    return subset.slice(0, SUBSET_SIZE);
  }, [sortedParticipants, targetTicketNumber]);

  // Initialize subset
  useEffect(() => {
    if (sortedParticipants.length > 0) {
      const subset = createWinnerSubset();
      setDisplaySubset(subset);
      setPosition(0); // Always start at position 0
    }
  }, [sortedParticipants, targetTicketNumber, createWinnerSubset]);

  // Draw the wheel
  const drawWheel = useCallback((currentPosition: number) => {
    const canvas = canvasRef.current;
    if (!canvas || displaySubset.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.save();

    // Background
    if (internalTheme?.spinnerStyle?.backgroundColor && 
        internalTheme.spinnerStyle.backgroundColor !== 'transparent') {
      ctx.fillStyle = internalTheme.spinnerStyle.backgroundColor;
      ctx.fillRect(VIEWPORT_LEFT, VIEWPORT_TOP, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
    }

    const wheelCircumference = displaySubset.length * ITEM_HEIGHT;
    const normalizedPos = ((currentPosition % wheelCircumference) + wheelCircumference) % wheelCircumference;
    const topParticipantIndex = Math.floor(normalizedPos / ITEM_HEIGHT);
    const pixelOffset = normalizedPos % ITEM_HEIGHT;

    // Draw visible participants
    for (let i = -2; i <= VISIBLE_ITEMS + 2; i++) {
      let participantIndex = (topParticipantIndex + i) % displaySubset.length;
      if (participantIndex < 0) {
        participantIndex += displaySubset.length;
      }

      const participant = displaySubset[participantIndex];
      const yPosition = i * ITEM_HEIGHT - pixelOffset + VIEWPORT_TOP;

      drawSlotMachineSegment({
        participant,
        yPos: yPosition,
        itemIndex: participantIndex,
        itemHeight: ITEM_HEIGHT,
        viewportHeight: VIEWPORT_HEIGHT,
        wheelWidth: WHEEL_WIDTH,
        canvasWidth,
        perspectiveScale: PERSPECTIVE_SCALE,
        ctx,
        theme: internalTheme,
      });
    }

    ctx.restore();

    drawSlotMachineFrame({
      ctx,
      canvasWidth,
      viewportHeight: VIEWPORT_HEIGHT,
      theme: internalTheme,
    });
  }, [displaySubset, internalTheme, canvasWidth, canvasHeight]);

  // Redraw when position changes
  useEffect(() => {
    drawWheel(position);
  }, [position, drawWheel]);

  // Handle spinning
  const spin = useCallback(() => {
    if (isAnimatingRef.current || !targetTicketNumber) return;

    isAnimatingRef.current = true;
    startTimeRef.current = performance.now();

    const wheelCircumference = displaySubset.length * ITEM_HEIGHT;
    const totalDistance = rotations * wheelCircumference; // Always return to start
    const duration = (settings?.minSpinDuration || 3) * 1000; // Use duration for total time
    
    // Create easing function from bezier curve
    const ease = cubicBezier(bezierCurve.x1, bezierCurve.y1, bezierCurve.x2, bezierCurve.y2);

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Apply bezier easing
      const easedProgress = ease(progress);
      const currentPosition = totalDistance * easedProgress;
      
      setPosition(currentPosition);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete - we're back at position 0
        setPosition(0);
        isAnimatingRef.current = false;
        animationRef.current = null;
        
        // Winner is at index 0
        const winner = displaySubset[0];
        if (winner) {
          console.log('[SlotMachine] Spin complete:', {
            winner: winner.ticketNumber,
            target: targetTicketNumber,
            finalPosition: 0
          });
          onSpinComplete(winner);
        }
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [displaySubset, targetTicketNumber, rotations, bezierCurve, settings, onSpinComplete]);

  // Handle spin trigger
  useEffect(() => {
    if (isSpinning && !isAnimatingRef.current) {
      spin();
    }
  }, [isSpinning, spin]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="slot-machine-container">
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="slot-machine-canvas"
        style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }}
      />
    </div>
  );
}