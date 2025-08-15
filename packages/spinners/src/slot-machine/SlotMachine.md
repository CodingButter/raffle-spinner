# Slot Machine Component Documentation

## Overview

The slot machine spinner is a high-performance component that displays participants in a vertical scrolling list. It uses **subset swapping** to handle large participant lists (5000+) while maintaining 60fps performance.

## Critical Problem

**The slot machine is landing on the wrong ticket numbers**. Examples:

- Target: 1500 → Lands on: 1476 (24 tickets off)
- Target: 1502 → Lands on: 1541 (39 tickets off)
- Target: 1852 → Lands on: 1818 (34 tickets off)

After spinning stops, the wheel sometimes snaps back to the first ticket.

## Architecture

### Core Components

1. **SlotMachineWheelFixed.tsx** - Main component
2. **useSlotMachineAnimation.ts** - Animation physics hook
3. **SlotMachineSegment.tsx** - Renders individual participant slots
4. **SlotMachineFrame.tsx** - Renders the golden frame border

### Key Constants

```typescript
ITEM_HEIGHT = 80; // Height of each participant slot in pixels
VISIBLE_ITEMS = 5; // Number of slots visible at once [0,1,CENTER:2,3,4]
VIEWPORT_HEIGHT = 400; // Total visible area (5 × 80)
SUBSET_SIZE = 100; // Maximum participants shown at once
CENTER_INDEX = 2; // The winning position (middle of 5 visible slots)
```

## How It Works

### 1. Initialization Phase

When the component loads with participants:

```typescript
// Sort participants by ticket number
sortedParticipants = [1001, 1002, 1003, ..., 2000]

// Create initial subset (first 50 + last 50)
if (participants.length > 100) {
    displaySubset = [1001...1050, 1951...2000]  // Creates wrap-around illusion
} else {
    displaySubset = [...all participants]
}

// Set initial position
position = -2 * ITEM_HEIGHT = -160  // Centers first ticket at viewport center
```

### 2. Drawing Phase

The `drawWheel` function renders the current view:

```typescript
// Position to participant mapping:
normalizedPos = ((position % wheelCircumference) + wheelCircumference) % wheelCircumference;
topParticipantIndex = Math.floor(normalizedPos / ITEM_HEIGHT);
pixelOffset = normalizedPos % ITEM_HEIGHT;

// Draw participants from index -2 to index 7 (covers viewport + buffer)
for (i = -2; i <= 7; i++) {
  participantIndex = (topParticipantIndex + i) % subset.length;
  yPosition = i * ITEM_HEIGHT - pixelOffset + VIEWPORT_TOP;

  // When i === 2, this is the CENTER position where winner lands
}
```

### 3. Animation Start

When user clicks "Draw Winner":

```typescript
// Find winner in current subset
winnerIndex = subset.findIndex(ticket === targetTicket)

// Calculate target position (winner should be at CENTER_INDEX = 2)
targetPosition = (winnerIndex - CENTER_INDEX) * ITEM_HEIGHT

// Calculate total spin distance
rotations = 5 to 8 (random)
totalDistance = rotations * wheelCircumference + targetPosition
```

### 4. Subset Swap (CRITICAL PHASE)

At 25% animation progress (high velocity):

```typescript
// Swap to winner subset
createWinnerSubset():
    winnerIndex = 500 (example)
    startIdx = 500 - 50 = 450
    winnerSubset = participants[450...549]  // Winner at index 50

// After swap, recalculate physics:
newWinnerIndex = 50  // Winner's position in new subset
newTargetPosition = (50 - 2) * 80 = 3840 pixels
remainingDistance = 2.5 rotations * 8000 + distanceToTarget
```

### 5. Final Landing

Animation completes with easing:

```typescript
finalPosition = startPosition + totalDistance * easeOutCubic(1.0);
// Should position winner at CENTER_INDEX
```

## Identified Issues

### Issue 1: Position Calculation Mismatch

**In SlotMachineWheelFixed.tsx (line 142):**

```typescript
const targetPosition = (winnerIndex - CENTER_INDEX) * itemHeight;
```

**In useSlotMachineAnimation.ts (line 142):**

```typescript
const targetPosition = (winnerIndex - CENTER_INDEX) * itemHeight;
```

Both calculate the same way, but the final position after subset swap might not align correctly.

### Issue 2: Subset Swap Index Confusion

When swapping subsets at max velocity:

1. Initial subset: [1001-1050, 1951-2000]
2. Winner subset: [1450-1549] (for ticket 1500)
3. Winner index changes from -1 (not found) to 50 (new position)

**The problem:** The animation continues using the old physics calculations after the swap, but the wheel has a completely different set of participants.

### Issue 3: Final Position Not Preserved

After animation completes:

```typescript
onSpinComplete: (winner) => {
  // finalPositionRef.current is not being used
  // The wheel might be resetting to initial position
};
```

### Issue 4: Circular Arithmetic Error

The position normalization might be wrapping incorrectly:

```typescript
normalizedPos = ((position % wheelCircumference) + wheelCircumference) % wheelCircumference;
```

When `position` is very large (after multiple rotations), floating-point precision errors accumulate.

## Root Cause Analysis

### Primary Issue: Subset Swap Physics Recalculation

When the subset swaps at 25% progress:

1. The current position is calculated based on the OLD subset
2. The new winner index is found in the NEW subset
3. The physics are recalculated, but the `remainingDistance` calculation is wrong

**In useSlotMachineAnimation.ts (lines 236-246):**

```typescript
const currentNormalized = currentPosition % updatedCircumference;
const targetNormalized = exactFinalPosition % updatedCircumference;

let distanceToTarget = targetNormalized - currentNormalized;
if (distanceToTarget <= 0) {
  distanceToTarget += updatedCircumference;
}
```

**The bug:** `currentPosition` is based on the old subset's coordinate system, but we're normalizing it with the new subset's circumference. This creates a mismatch.

### Secondary Issue: Position Reference Frame

The wheel maintains position as an absolute value that keeps increasing:

- Start: 0
- After 5 rotations: 40,000 pixels
- After swap: Still 40,000 pixels, but subset changed!

The position should be recalculated relative to the new subset's frame of reference.

## Solution Approach

### Fix 1: Correct Subset Swap Position Mapping

```typescript
// When swapping subsets:
// 1. Find what participant is currently at center
const currentCenterIndex = calculateCenterParticipant(currentPosition, oldSubset);
const currentCenterTicket = oldSubset[currentCenterIndex].ticketNumber;

// 2. Find that participant in new subset
const sameParticipantNewIndex = newSubset.findIndex((p) => p.ticketNumber === currentCenterTicket);

// 3. Adjust position to maintain visual continuity
const adjustedPosition = (sameParticipantNewIndex - CENTER_INDEX) * ITEM_HEIGHT;
```

### Fix 2: Precise Final Position Calculation

```typescript
// Calculate exact landing position
const finalWinnerPosition = (winnerIndexInFinalSubset - CENTER_INDEX) * ITEM_HEIGHT;

// Ensure we land EXACTLY here, not approximately
const finalPosition = Math.round(finalWinnerPosition); // Avoid floating point errors
```

### Fix 3: Position State Management

Instead of storing absolute position, store:

```typescript
{
    subsetVersion: number,  // Increments on swap
    relativePosition: number,  // Position within current subset
    currentSubset: Participant[]
}
```

## Testing Scenarios

1. **Small list (< 100 participants)**: No subset swapping needed
2. **Winner in initial subset**: No swap required
3. **Winner requires swap**: Most complex case
4. **Edge cases**: First/last participants, wrap-around positions

## Conclusion

The slot machine is failing because:

1. **Position coordinates change meaning** when subsets swap
2. **Physics recalculation** doesn't account for coordinate system change
3. **Final position** isn't being precisely calculated or preserved

The fix requires:

1. Proper position mapping during subset swaps
2. Exact final position calculation
3. Consistent coordinate system throughout animation
