/**
 * Slot Machine Style Wheel Component
 *
 * Purpose: Creates a 3D-style vertical spinning wheel like a slot machine reel or
 * Price is Right wheel, showing only a viewport of participants at any time.
 *
 * SRS Reference:
 * - FR-2.2: Winner Selection and Animation
 * - FR-2.2: Performance optimization for large datasets
 * - FR-1.7: Spinner Physics Configuration
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import { Participant, SpinnerSettings } from '@raffle-spinner/storage';
import { SpinnerPhysics } from '@raffle-spinner/spinner-physics';

interface SlotMachineWheelProps {
  participants: Participant[];
  targetTicketNumber: string;
  settings: SpinnerSettings;
  isSpinning: boolean;
  onSpinComplete: (winner: Participant) => void;
}

export function SlotMachineWheel({
  participants,
  targetTicketNumber,
  settings,
  isSpinning,
  onSpinComplete,
}: SlotMachineWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [currentPosition, setCurrentPosition] = useState(0);
  const physics = useRef(new SpinnerPhysics());

  // Constants for the slot machine appearance
  const VISIBLE_ITEMS = 5; // Number of items visible in the viewport
  const ITEM_HEIGHT = 80; // Height of each item on the wheel
  const VIEWPORT_HEIGHT = VISIBLE_ITEMS * ITEM_HEIGHT;
  const WHEEL_WIDTH = 350;
  const PERSPECTIVE_SCALE = 0.15; // How much items shrink at edges

  // Calculate the total wheel circumference
  const wheelCircumference = participants.length * ITEM_HEIGHT;

  const drawSlotMachineWheel = useCallback(
    (ctx: CanvasRenderingContext2D, position: number) => {
      const canvas = ctx.canvas;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background gradient for depth
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, '#1a1a2e');
      bgGradient.addColorStop(0.5, '#0f0f23');
      bgGradient.addColorStop(1, '#1a1a2e');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Calculate which items are visible
      const normalizedPosition =
        ((position % wheelCircumference) + wheelCircumference) % wheelCircumference;
      const startIndex = Math.floor(normalizedPosition / ITEM_HEIGHT);
      const offset = normalizedPosition % ITEM_HEIGHT;

      // Draw the wheel segments
      for (let i = -2; i <= VISIBLE_ITEMS + 2; i++) {
        const itemIndex = (startIndex + i) % participants.length;
        const participant =
          participants[itemIndex < 0 ? itemIndex + participants.length : itemIndex];

        // Calculate Y position and perspective effect
        const yPos = i * ITEM_HEIGHT - offset + 40; // 40px padding from top
        const centerY = VIEWPORT_HEIGHT / 2 + 40;
        const distanceFromCenter = Math.abs(yPos + ITEM_HEIGHT / 2 - centerY);
        const perspectiveFactor =
          1 - (distanceFromCenter / (VIEWPORT_HEIGHT / 2)) * PERSPECTIVE_SCALE;

        // Skip items that are completely outside viewport
        if (yPos > VIEWPORT_HEIGHT + 80 || yPos < -ITEM_HEIGHT) continue;

        // Calculate opacity based on distance from center
        const opacity = Math.max(0.3, 1 - (distanceFromCenter / (VIEWPORT_HEIGHT / 2)) * 0.7);

        // Draw the segment with 3D effect
        ctx.save();

        // Apply perspective transformation
        const scaledWidth = WHEEL_WIDTH * perspectiveFactor;
        const xOffset = (canvas.width - scaledWidth) / 2;

        // Draw segment background with gradient for 3D effect
        const segmentGradient = ctx.createLinearGradient(
          xOffset,
          yPos,
          xOffset + scaledWidth,
          yPos
        );

        // Alternate colors for segments
        const isEven = itemIndex % 2 === 0;
        if (isEven) {
          segmentGradient.addColorStop(0, `rgba(59, 130, 246, ${opacity * 0.8})`);
          segmentGradient.addColorStop(0.5, `rgba(59, 130, 246, ${opacity})`);
          segmentGradient.addColorStop(1, `rgba(59, 130, 246, ${opacity * 0.8})`);
        } else {
          segmentGradient.addColorStop(0, `rgba(30, 64, 175, ${opacity * 0.8})`);
          segmentGradient.addColorStop(0.5, `rgba(30, 64, 175, ${opacity})`);
          segmentGradient.addColorStop(1, `rgba(30, 64, 175, ${opacity * 0.8})`);
        }

        ctx.fillStyle = segmentGradient;
        ctx.fillRect(xOffset, yPos, scaledWidth, ITEM_HEIGHT - 2);

        // Draw borders for depth
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.3})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(xOffset, yPos, scaledWidth, ITEM_HEIGHT - 2);

        // Draw highlight on top edge for 3D effect
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.5})`;
        ctx.beginPath();
        ctx.moveTo(xOffset, yPos);
        ctx.lineTo(xOffset + scaledWidth, yPos);
        ctx.stroke();

        // Draw shadow on bottom edge
        ctx.strokeStyle = `rgba(0, 0, 0, ${opacity * 0.5})`;
        ctx.beginPath();
        ctx.moveTo(xOffset, yPos + ITEM_HEIGHT - 2);
        ctx.lineTo(xOffset + scaledWidth, yPos + ITEM_HEIGHT - 2);
        ctx.stroke();

        // Draw text with perspective scaling
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.font = `bold ${16 * perspectiveFactor}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const name = `${participant.firstName} ${participant.lastName}`;
        const ticket = `Ticket #${participant.ticketNumber}`;

        ctx.fillText(name, canvas.width / 2, yPos + ITEM_HEIGHT / 2 - 12);
        ctx.font = `${14 * perspectiveFactor}px sans-serif`;
        ctx.fillText(ticket, canvas.width / 2, yPos + ITEM_HEIGHT / 2 + 12);

        ctx.restore();
      }

      // Draw viewport frame with glass effect
      ctx.save();

      // Draw outer frame
      const frameGradient = ctx.createLinearGradient(0, 40, 0, VIEWPORT_HEIGHT + 40);
      frameGradient.addColorStop(0, '#2a2a3e');
      frameGradient.addColorStop(0.5, '#1a1a2e');
      frameGradient.addColorStop(1, '#2a2a3e');

      ctx.strokeStyle = frameGradient;
      ctx.lineWidth = 8;
      ctx.strokeRect(20, 40, canvas.width - 40, VIEWPORT_HEIGHT);

      // Draw inner frame highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 2;
      ctx.strokeRect(24, 44, canvas.width - 48, VIEWPORT_HEIGHT - 8);

      // Draw center selection indicator (red arrows pointing to center)
      const centerLineY = VIEWPORT_HEIGHT / 2 + 40;

      // Left arrow
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(10, centerLineY);
      ctx.lineTo(40, centerLineY - 20);
      ctx.lineTo(40, centerLineY + 20);
      ctx.closePath();
      ctx.fill();

      // Right arrow
      ctx.beginPath();
      ctx.moveTo(canvas.width - 10, centerLineY);
      ctx.lineTo(canvas.width - 40, centerLineY - 20);
      ctx.lineTo(canvas.width - 40, centerLineY + 20);
      ctx.closePath();
      ctx.fill();

      // Draw selection line
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(40, centerLineY);
      ctx.lineTo(canvas.width - 40, centerLineY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Add glass reflection effect
      const glassGradient = ctx.createLinearGradient(0, 40, 0, VIEWPORT_HEIGHT / 3 + 40);
      glassGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
      glassGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = glassGradient;
      ctx.fillRect(24, 44, canvas.width - 48, VIEWPORT_HEIGHT / 3);

      ctx.restore();

      // Draw title
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('RAFFLE SPINNER', canvas.width / 2, 25);
    },
    [participants, wheelCircumference]
  );

  const animate = useCallback(() => {
    if (!isSpinning) return;

    const targetIndex = participants.findIndex((p) => p.ticketNumber === targetTicketNumber);
    if (targetIndex === -1) return;

    // Calculate target position (center of viewport)
    const targetPosition = targetIndex * ITEM_HEIGHT;

    const spinConfig = {
      targetIndex,
      totalItems: participants.length,
      minDuration: settings.minSpinDuration,
      decelerationRate: settings.decelerationRate,
    };

    const animation = physics.current.calculateSpinAnimation(spinConfig);
    const startTime = Date.now();
    const startPosition = currentPosition;

    // Add extra rotations for effect
    const extraRotations = 3 + Math.random() * 2;
    const totalDistance =
      extraRotations * wheelCircumference + targetPosition - (startPosition % wheelCircumference);

    const spin = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animation.duration, 1);
      const easedProgress = animation.easing(progress);

      const position = startPosition + totalDistance * easedProgress;
      setCurrentPosition(position);

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawSlotMachineWheel(ctx, position);
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
  }, [
    isSpinning,
    targetTicketNumber,
    participants,
    settings,
    currentPosition,
    wheelCircumference,
    drawSlotMachineWheel,
    onSpinComplete,
  ]);

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

    drawSlotMachineWheel(ctx, currentPosition);
  }, [currentPosition, drawSlotMachineWheel]);

  return (
    <div className="relative w-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black rounded-lg p-4">
      <canvas
        ref={canvasRef}
        width={400}
        height={500}
        className="max-w-full h-auto rounded-lg shadow-2xl"
        style={{ imageRendering: 'crisp-edges' }}
      />
    </div>
  );
}
