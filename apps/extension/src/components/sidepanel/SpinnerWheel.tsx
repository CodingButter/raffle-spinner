/**
 * Spinner Wheel Component
 *
 * Purpose: Interactive spinning wheel visualization that renders participant segments,
 * handles physics-based animations, and determines winners based on target ticket numbers.
 *
 * SRS Reference:
 * - FR-2.2: Winner Selection and Animation
 * - FR-2.2: Performance optimization for large datasets
 * - FR-1.7: Spinner Physics Configuration
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import { Participant, SpinnerSettings } from '@raffle-spinner/storage';
import { SpinnerPhysics } from '@raffle-spinner/spinner-physics';

interface SpinnerWheelProps {
  participants: Participant[];
  targetTicketNumber: string;
  settings: SpinnerSettings;
  isSpinning: boolean;
  onSpinComplete: (winner: Participant) => void;
}

export function SpinnerWheel({
  participants,
  targetTicketNumber,
  settings,
  isSpinning,
  onSpinComplete,
}: SpinnerWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [currentAngle, setCurrentAngle] = useState(0);
  const physics = useRef(new SpinnerPhysics());

  const getVisibleParticipants = useCallback(
    (angle: number) => {
      if (participants.length <= 100) return participants;

      const visibleIndices = physics.current.calculateVisibleSegments(
        angle,
        participants.length,
        100
      );

      return visibleIndices.map((i) => participants[i]);
    },
    [participants]
  );

  const drawWheel = useCallback(
    (ctx: CanvasRenderingContext2D, angle: number) => {
      const canvas = ctx.canvas;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY) - 20;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle);

      const visibleParticipants = getVisibleParticipants(angle);
      const segmentAngle = (2 * Math.PI) / participants.length;

      visibleParticipants.forEach((participant, i) => {
        const startAngle = i * segmentAngle;
        const endAngle = startAngle + segmentAngle;

        // Draw segment
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, startAngle, endAngle);
        ctx.closePath();

        // Alternate colors
        ctx.fillStyle = i % 2 === 0 ? '#3b82f6' : '#1e40af';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw text
        ctx.save();
        ctx.rotate(startAngle + segmentAngle / 2);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px sans-serif';

        const text = `${participant.firstName} ${participant.lastName}`;
        const ticketText = `#${participant.ticketNumber}`;

        ctx.fillText(text, radius * 0.7, -10);
        ctx.fillText(ticketText, radius * 0.7, 10);
        ctx.restore();
      });

      ctx.restore();

      // Draw pointer
      ctx.beginPath();
      ctx.moveTo(centerX + radius - 10, centerY);
      ctx.lineTo(centerX + radius + 20, centerY - 15);
      ctx.lineTo(centerX + radius + 20, centerY + 15);
      ctx.closePath();
      ctx.fillStyle = '#ef4444';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    },
    [participants, getVisibleParticipants]
  );

  const animate = useCallback(() => {
    if (!isSpinning) return;

    const targetIndex = participants.findIndex((p) => p.ticketNumber === targetTicketNumber);
    if (targetIndex === -1) return;

    const spinConfig = {
      targetIndex,
      totalItems: participants.length,
      minDuration: settings.minSpinDuration,
      decelerationRate: settings.decelerationRate,
    };

    const animation = physics.current.calculateSpinAnimation(spinConfig);
    const startTime = Date.now();

    const spin = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animation.duration, 1);
      const easedProgress = animation.easing(progress);

      const angle =
        animation.startAngle + (animation.endAngle - animation.startAngle) * easedProgress;
      setCurrentAngle(angle);

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawWheel(ctx, angle);
        }
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(spin);
      } else {
        const winner = participants[targetIndex];
        onSpinComplete(winner);
      }
    };

    spin();
  }, [isSpinning, targetTicketNumber, participants, settings, drawWheel, onSpinComplete]);

  useEffect(() => {
    if (isSpinning) {
      animate();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isSpinning, animate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawWheel(ctx, currentAngle);
  }, [currentAngle, drawWheel]);

  return (
    <div className="relative w-full aspect-square flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
      <canvas ref={canvasRef} width={400} height={400} className="max-w-full h-auto" />
    </div>
  );
}
