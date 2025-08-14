/**
 * Spinner Physics Engine
 *
 * Purpose: Core physics calculations for spinner animations including spin timing,
 * rotation calculations, segment visibility optimization, and target positioning.
 *
 * SRS Reference:
 * - FR-2.2: Winner Selection and Animation (spin calculations and targeting)
 * - FR-1.7: Spinner Physics Configuration (configurable physics parameters)
 * - FR-2.2: Performance optimization (visible segment calculation for large datasets)
 */

import { SpinConfig, SpinAnimation, WheelSegment } from './types';
import { easingFunctions } from './easing';

export class SpinnerPhysics {
  calculateSpinAnimation(config: SpinConfig): SpinAnimation {
    const { targetIndex, totalItems, minDuration, decelerationRate } = config;

    // Calculate the angle for each segment
    const segmentAngle = (2 * Math.PI) / totalItems;

    // Target angle (center of the winning segment)
    const targetAngle = targetIndex * segmentAngle + segmentAngle / 2;

    // Add multiple full rotations for visual effect
    const minRotations = 3;
    const maxRotations = 5;
    const rotations = minRotations + Math.random() * (maxRotations - minRotations);

    // Calculate total rotation
    const totalRotation = rotations * 2 * Math.PI + targetAngle;

    // Calculate duration based on settings
    const duration = minDuration * 1000; // Convert to milliseconds

    return {
      duration,
      startAngle: 0,
      endAngle: totalRotation,
      easing: easingFunctions[decelerationRate],
    };
  }

  calculateVisibleSegments(
    currentAngle: number,
    totalItems: number,
    visibleCount: number = 100
  ): number[] {
    const segmentAngle = (2 * Math.PI) / totalItems;
    const normalizedAngle = currentAngle % (2 * Math.PI);

    // Calculate the center index
    const centerIndex = Math.floor(normalizedAngle / segmentAngle);

    // Calculate range of visible segments
    const halfVisible = Math.floor(visibleCount / 2);
    const indices: number[] = [];

    for (let i = -halfVisible; i <= halfVisible; i++) {
      let index = (centerIndex + i) % totalItems;
      if (index < 0) index += totalItems;
      indices.push(index);
    }

    return indices;
  }

  getSegmentAtAngle(angle: number, totalItems: number): number {
    const segmentAngle = (2 * Math.PI) / totalItems;
    const normalizedAngle = angle % (2 * Math.PI);
    return Math.floor(normalizedAngle / segmentAngle);
  }

  createWheelSegments(totalItems: number): WheelSegment[] {
    const segmentAngle = (2 * Math.PI) / totalItems;
    const segments: WheelSegment[] = [];

    for (let i = 0; i < totalItems; i++) {
      segments.push({
        startAngle: i * segmentAngle,
        endAngle: (i + 1) * segmentAngle,
        index: i,
      });
    }

    return segments;
  }
}
