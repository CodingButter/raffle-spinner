# @raffle-spinner/spinner-physics

Physics engine for the Raffle Winner Spinner wheel animation.

## Overview

This package provides realistic physics simulation for the spinner wheel, including momentum, deceleration, and smooth animations optimized for performance.

## Features

- Realistic spin physics with momentum and friction
- Smooth 60fps animations
- Performance optimized for 5000+ participants
- Configurable spin parameters
- Deterministic winner selection
- Canvas-based rendering
- Touch and mouse input support

## Installation

This package is part of the Raffle Winner Spinner monorepo and is not published to npm.

```bash
pnpm add @raffle-spinner/spinner-physics
```

## Usage

```typescript
import { SpinnerPhysics } from '@raffle-spinner/spinner-physics';
import type { SpinConfig, SpinResult } from '@raffle-spinner/spinner-physics';

// Initialize physics engine
const physics = new SpinnerPhysics({
  wheelRadius: 200,
  segments: participants.length,
  friction: 0.995,
  minSpeed: 0.01,
});

// Start a spin
const config: SpinConfig = {
  initialVelocity: Math.random() * 0.5 + 0.5,
  targetIndex: Math.floor(Math.random() * participants.length),
  duration: 5000,
};

const result = await physics.spin(config);
console.log('Winner index:', result.winnerIndex);
```

## API Reference

### SpinnerPhysics

#### Constructor

```typescript
constructor(options: PhysicsOptions)
```

##### PhysicsOptions

```typescript
interface PhysicsOptions {
  wheelRadius: number; // Radius of the wheel in pixels
  segments: number; // Number of segments (participants)
  friction?: number; // Friction coefficient (0-1, default: 0.995)
  minSpeed?: number; // Minimum speed before stopping (default: 0.01)
  maxSpeed?: number; // Maximum initial speed (default: 1.0)
}
```

#### Methods

##### `spin(config: SpinConfig): Promise<SpinResult>`

Starts a spin animation with the given configuration.

##### `stop(): void`

Immediately stops the current spin.

##### `update(deltaTime: number): void`

Updates the physics simulation. Called automatically during animation.

##### `getCurrentAngle(): number`

Returns the current rotation angle in radians.

##### `getCurrentSpeed(): number`

Returns the current rotation speed.

##### `getWinnerIndex(): number`

Returns the index of the segment at the top position.

### Types

```typescript
interface SpinConfig {
  initialVelocity: number; // Initial spin speed (0-1)
  targetIndex?: number; // Optional predetermined winner
  duration?: number; // Maximum spin duration in ms
  onUpdate?: (angle: number) => void; // Update callback
}

interface SpinResult {
  winnerIndex: number; // Index of winning segment
  finalAngle: number; // Final rotation angle
  totalRotations: number; // Total number of rotations
  duration: number; // Actual spin duration
}

interface PhysicsState {
  angle: number; // Current rotation angle
  velocity: number; // Current angular velocity
  acceleration: number; // Current angular acceleration
  isSpinning: boolean; // Whether wheel is currently spinning
}
```

## Physics Model

### Deceleration

The wheel decelerates using a friction-based model:

```
velocity(t+1) = velocity(t) * friction
```

Where friction is typically 0.995, providing realistic deceleration.

### Winner Determination

The winner is determined by:

1. Calculating the final resting angle
2. Mapping the angle to a segment index
3. Accounting for the pointer position (top of wheel)

### Performance Optimization

- Uses requestAnimationFrame for smooth 60fps
- Efficient angle calculations using modulo arithmetic
- Minimal object allocation during animation
- Canvas rendering optimizations for large segment counts

## Rendering Integration

### Canvas Setup

```typescript
const canvas = document.getElementById('wheel') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

const physics = new SpinnerPhysics({
  wheelRadius: canvas.width / 2,
  segments: participants.length,
});

// Animation loop
function animate() {
  const angle = physics.getCurrentAngle();

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw wheel at current angle
  drawWheel(ctx, angle, participants);

  if (physics.isSpinning) {
    requestAnimationFrame(animate);
  }
}

// Start spin
physics.spin({ initialVelocity: 0.8 }).then((result) => {
  console.log('Winner:', participants[result.winnerIndex]);
});

animate();
```

## Configuration Examples

### Fast Spin

```typescript
const physics = new SpinnerPhysics({
  wheelRadius: 200,
  segments: 100,
  friction: 0.998, // Less friction = longer spin
  maxSpeed: 1.5, // Higher max speed
});
```

### Precise Control

```typescript
// Predetermined winner
const targetWinner = 42;
await physics.spin({
  initialVelocity: 0.7,
  targetIndex: targetWinner,
  duration: 4000,
});
```

### Custom Deceleration

```typescript
const physics = new SpinnerPhysics({
  wheelRadius: 200,
  segments: 50,
  friction: 0.99, // Slower deceleration
  minSpeed: 0.005, // More precise stopping
});
```

## Performance Considerations

### Large Participant Lists

For 5000+ participants:

```typescript
const physics = new SpinnerPhysics({
  wheelRadius: 300, // Larger wheel for visibility
  segments: 5000,
  friction: 0.996, // Balanced deceleration
  minSpeed: 0.008, // Precise stopping
});

// Use segment grouping for rendering
const segmentsPerGroup = Math.ceil(5000 / 360); // ~14 per degree
```

### Memory Optimization

- Reuse physics instance for multiple spins
- Clear references after spin completion
- Use object pooling for frequently created objects

## Development

### Building

```bash
pnpm build
```

### Testing

```bash
pnpm test
```

### Type Checking

```bash
pnpm typecheck
```

## Mathematical Details

### Angle to Segment Mapping

```typescript
segmentIndex = Math.floor((angle % (2 * Math.PI)) / segmentAngle);
```

### Velocity Decay

```typescript
v(t) = v₀ * friction^t
```

### Stopping Condition

```typescript
stopped = velocity < minSpeed || elapsedTime > maxDuration;
```

## Contributing

See the main [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

## License

Part of the Raffle Winner Spinner project.
