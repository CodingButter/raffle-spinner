# SlotMachineWheel.tsx Refactoring Task

## CRITICAL PRIORITY - Code Quality Violation

**File:** `packages/spinners/src/slot-machine/SlotMachineWheel.tsx`
**Current Size:** 579 lines (VIOLATION - exceeds 200-line mandatory limit by 289%)
**Target:** Break into 5-6 components, each under 200 lines

## Required Component Extraction

### 1. WheelCanvas Component (~150 lines)
**Location:** `packages/spinners/src/slot-machine/components/WheelCanvas.tsx`
**Extract:** Lines 246-404 (drawWheel function and related logic)
**Responsibilities:**
- Canvas rendering and clearing
- Viewport clipping setup
- Background gradient rendering
- Shadow overlay rendering
- Frame drawing orchestration

**Interface:**
```typescript
interface WheelCanvasProps {
  canvasRef: RefObject<HTMLCanvasElement>;
  position: number;
  subset: Participant[];
  theme: InternalTheme;
  canvasWidth: number;
  canvasHeight: number;
  showDebug?: boolean;
}
```

### 2. WheelAnimator Hook (~100 lines)
**Location:** `packages/spinners/src/slot-machine/hooks/useWheelAnimator.ts`
**Extract:** Lines 506-550 (animation control logic)
**Responsibilities:**
- Spin start/stop control
- Animation state management
- Position updates
- Max velocity handling

**Interface:**
```typescript
interface UseWheelAnimatorProps {
  displaySubset: Participant[];
  targetTicketNumber: string;
  settings: AnimationSettings;
  onSpinComplete: (winner: Participant) => void;
  onError: (error: string) => void;
  onMaxVelocity: () => number;
  itemHeight: number;
}
```

### 3. SegmentRenderer Utility (~80 lines)
**Location:** `packages/spinners/src/slot-machine/utils/segmentRenderer.ts`
**Extract:** Lines 296-337 (segment drawing loop)
**Responsibilities:**
- Individual segment positioning
- Participant index calculation
- Debug overlay rendering
- Segment wrapping logic

**Exports:**
```typescript
export function renderSegments(
  ctx: CanvasRenderingContext2D,
  subset: Participant[],
  position: number,
  theme: InternalTheme,
  showDebug: boolean
): void
```

### 4. WinnerCalculator Utility (~120 lines)
**Location:** `packages/spinners/src/slot-machine/utils/winnerCalculator.ts`
**Extract:** Lines 412-498 (winner subset logic)
**Responsibilities:**
- Finding winner in full participant list
- Creating optimized winner subset
- Handling edge cases (wrapping)
- Subset positioning for smooth animation

**Exports:**
```typescript
export function findWinnerInFullList(
  participants: Participant[],
  targetTicketNumber: string
): Participant | undefined

export function createWinnerSubset(
  sortedParticipants: Participant[],
  targetTicketNumber: string,
  subsetSize: number
): Participant[]
```

### 5. SubsetManager Hook (~80 lines)
**Location:** `packages/spinners/src/slot-machine/hooks/useSubsetManager.ts`
**Extract:** Lines 181-237 (subset initialization)
**Responsibilities:**
- Initial subset creation
- Participant change detection
- Subset state management
- Position initialization

**Interface:**
```typescript
interface UseSubsetManagerProps {
  participants: Participant[];
  subsetSize: number;
  itemHeight: number;
}
```

### 6. Theme Utilities (~50 lines)
**Location:** `packages/spinners/src/slot-machine/utils/theme.ts`
**Extract:** Lines 46-110 (theme conversion and color utilities)
**Responsibilities:**
- Theme format conversion
- Color brightness adjustment
- Hex to RGB conversion

**Exports:**
```typescript
export function convertTheme(theme: SpinnerTheme): InternalTheme
export function adjustBrightness(color: string, percent: number): string
export function hexToRgb(hex: string): RGB
```

## Refactored Main Component Structure

After extraction, `SlotMachineWheel.tsx` should be ~180 lines:
- Import statements and type definitions (~30 lines)
- Component declaration and hooks (~50 lines)
- Effect hooks for orchestration (~60 lines)
- Return statement with JSX (~20 lines)
- Constants and configuration (~20 lines)

## Performance Requirements

**CRITICAL:** All refactored components MUST maintain:
- 60fps animation performance with 5,000+ participants
- <2 second initial load time
- No performance regression from current implementation
- Memory usage under 100MB for large datasets

## Testing Requirements

1. Create performance benchmark before refactoring
2. Test each extracted component independently
3. Verify 60fps maintained with Chrome DevTools Performance tab
4. Test with 10,000 participant dataset
5. Ensure subset swapping still works correctly

## Implementation Order

1. **Phase 1 - Utilities** (30 minutes)
   - Extract theme utilities
   - Extract winner calculator
   - Commit: "refactor: extract theme and winner utilities from SlotMachineWheel"

2. **Phase 2 - Hooks** (45 minutes)
   - Extract SubsetManager hook
   - Extract WheelAnimator hook
   - Commit: "refactor: extract animation and subset hooks from SlotMachineWheel"

3. **Phase 3 - Components** (45 minutes)
   - Extract WheelCanvas component
   - Extract SegmentRenderer utility
   - Commit: "refactor: extract canvas and rendering components from SlotMachineWheel"

4. **Phase 4 - Integration** (30 minutes)
   - Update main SlotMachineWheel component
   - Wire up all extracted pieces
   - Commit: "refactor: complete SlotMachineWheel decomposition under 200 lines"

5. **Phase 5 - Testing** (30 minutes)
   - Performance testing
   - Visual regression testing
   - Commit: "test: verify refactored SlotMachineWheel maintains 60fps performance"

## Git Workflow

1. Create feature branch: `git checkout -b refactor/slot-machine-wheel-decomposition`
2. Make atomic commits for each phase
3. Run performance tests after each commit
4. Create PR to `team-dev` branch when complete
5. Include performance metrics in PR description

## Success Criteria

- [ ] SlotMachineWheel.tsx under 200 lines
- [ ] All extracted components under 200 lines
- [ ] Zero performance regression (60fps maintained)
- [ ] All existing functionality preserved
- [ ] No visual differences in rendering
- [ ] Clean separation of concerns
- [ ] Improved testability
- [ ] Clear module boundaries

## Code Quality Checklist

- [ ] Each file has single responsibility
- [ ] No duplicate code between components
- [ ] Clear interfaces and type definitions
- [ ] Proper error handling maintained
- [ ] Comments and documentation preserved
- [ ] ESLint passes with no warnings
- [ ] Prettier formatting applied

## Memento Updates Required

After each phase, update memento with:
1. Component extraction completed
2. Performance metrics
3. Any challenges encountered
4. Refactoring patterns applied
5. File size reductions achieved

## DEADLINE: Complete within 3 hours

This is a CRITICAL priority task as it's our worst code quality violation at 579 lines (289% over limit).