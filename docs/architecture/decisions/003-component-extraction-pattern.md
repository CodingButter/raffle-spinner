# ADR-003: Component Extraction Pattern for File Size Compliance

## Status
Accepted

## Context
We enforce a strict 200-line file size limit across the codebase to maintain readability and enforce separation of concerns. The `SidePanelWithPersistence.tsx` file was 374 lines, violating this architectural constraint by 87%. This file contained mixed concerns: UI rendering, business logic, state management, and theme conversion.

## Decision
We established a systematic extraction pattern for refactoring large components:

1. **Component Extraction**: Extract distinct UI sections into separate components
   - BrandingHeader: 93 lines (brand display logic)
   - WinnerOverlay: 45 lines (winner announcement UI)
   - SpinControls: 61 lines (input controls)

2. **Business Logic Extraction**: Move business logic to custom hooks
   - useSpinHandler: 130 lines (spin state management, winner tracking)

3. **Utility Extraction**: Extract pure functions to utility modules
   - theme-converter: 36 lines (theme transformation logic)

4. **Complexity Reduction**: Use helper functions to reduce cyclomatic complexity
   - Extract switch statements to dedicated functions
   - Pre-calculate boolean conditions for cleaner JSX

## Consequences

### Positive
- **Improved Maintainability**: Each file now has a single, clear responsibility
- **Better Testability**: Components and hooks can be tested in isolation
- **Enhanced Reusability**: Extracted components can be used elsewhere
- **Cleaner Architecture**: Clear separation between UI, business logic, and utilities
- **Compliance**: Main file reduced from 374 to 197 lines (47% reduction)
- **Type Safety**: All TypeScript errors resolved with proper imports

### Negative
- **More Files**: Increased from 1 to 6 files (5 new files created)
- **Import Complexity**: More import statements required
- **Navigation Overhead**: Developers need to navigate between files

## Alternatives Considered

1. **Single Large File with Comments**: Keep everything in one file with section comments
   - Rejected: Violates our file size policy and makes testing difficult

2. **Barrel Exports**: Create index files for grouped exports
   - Rejected: Adds unnecessary abstraction for internal components

3. **Lazy Loading**: Use dynamic imports for heavy components
   - Rejected: Unnecessary complexity for extension context

## Rollback Plan

If this pattern causes issues:

1. Git revert the refactoring commit
2. Re-combine components into the original file
3. Accept the ESLint warning temporarily
4. Document exception in tech debt log

## Success Metrics
- **File Size**: All files < 200 lines ✅
- **Build Success**: Extension builds without errors ✅
- **Type Safety**: No TypeScript errors ✅
- **Complexity**: All functions < 10 cyclomatic complexity ✅
- **Test Coverage**: Maintained at previous levels

## Implementation Pattern

When encountering files > 200 lines:

```typescript
// 1. Identify logical boundaries
// - UI sections → Components
// - State logic → Hooks
// - Calculations → Utils

// 2. Extract with clear interfaces
interface ComponentProps {
  // Minimal, explicit props
}

// 3. Maintain type safety
import type { RequiredTypes } from 'package';

// 4. Document extraction rationale
/**
 * ComponentName
 * 
 * Purpose: [Why extracted]
 * Extracted from: [Original file]
 * 
 * Architecture Decision:
 * - [Key design choices]
 */
```

## Related Patterns
- ADR-001: Monorepo Package Structure
- ADR-002: Chrome Extension Architecture
- Code Quality Standards (CLAUDE.md)

## References
- Original PR: #[TBD]
- ESLint Config: packages/@drawday/eslint-config
- File Size Analysis: mcp__code-health tools

---
Date: 2025-08-18
Author: David Miller (Lead Developer Architect)
Review: Pending