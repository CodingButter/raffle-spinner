# Project Structure Audit

## Current Structure Overview

```
raffle-spinner/
├── apps/
│   ├── extension/      # Chrome extension application
│   └── website/        # Next.js marketing website
├── packages/
│   ├── contexts/       # React contexts (notifications, etc.)
│   ├── csv-parser/     # CSV parsing utilities
│   ├── eslint-config/  # Shared ESLint configuration
│   ├── hooks/          # Reusable React hooks
│   ├── prettier-config/# Shared Prettier configuration
│   ├── spinner-physics/# Animation physics calculations
│   ├── spinners/       # Spinner components (slot machine, etc.)
│   ├── storage/        # Chrome storage abstraction
│   ├── tailwind-config/# Shared Tailwind configuration
│   ├── typescript-config/# Shared TypeScript configurations
│   ├── ui/             # Shared UI components (shadcn/ui)
│   └── utils/          # General utilities (cn, logger, etc.)
└── samples/            # Sample data generators

```

## Audit Findings

### 🔴 Critical Issues (Code Duplication)

#### 1. SlotMachineAnimation Hook Duplication

- **Location 1**: `/apps/extension/src/hooks/useSlotMachineAnimation.ts`
- **Location 2**: `/packages/spinners/src/slot-machine/hooks/useSlotMachineAnimation.ts`
- **Issue**: Same animation logic in two places
- **Solution**: Remove extension version, use package version

#### 2. Type Definitions Scattered

- Competition types defined in multiple places
- Participant types duplicated
- Settings interfaces repeated
- **Solution**: Consolidate all types in a single `@drawday/types` package

### 🟡 Moderate Issues (Naming & Organization)

#### 1. Unclear File Names

- `CompetitionManagementContent.tsx` - verbose, could be `CompetitionManager.tsx`
- `WheelSegment.tsx` - should be `SlotMachineSegment.tsx` for clarity
- `utils/index.ts` - mixing different utilities (cn, ticket functions, logger)

#### 2. Mixed Responsibilities

- `/packages/utils/` contains:
  - Tailwind utilities (cn)
  - Ticket number utilities
  - Logger service
  - Should be split into focused packages

#### 3. Inconsistent Naming Patterns

- Some components use "Content" suffix unnecessarily
- Mix of "Management" vs "Manager" naming
- Inconsistent use of "Slot Machine" vs "Wheel"

### 🟢 Good Practices Found

#### 1. Proper Package Separation

- Config packages properly separated (eslint, prettier, typescript, tailwind)
- UI components properly isolated in packages/ui
- Storage abstraction properly isolated

#### 2. Clear Monorepo Structure

- Apps vs packages distinction is clear
- Shared dependencies properly managed

## Recommended Refactoring Plan

### Phase 1: Create Missing Shared Packages

#### 1. Create `@drawday/types` package

```typescript
// packages/types/src/index.ts
export * from "./competition";
export * from "./participant";
export * from "./settings";
export * from "./theme";
export * from "./spinner";
```

#### 2. Split `@drawday/utils` into focused packages

- `@raffle-spinner/tailwind-utils` - cn function and Tailwind utilities
- `@raffle-spinner/ticket-utils` - ticket number functions
- Keep logger in utils as it's a general utility

### Phase 2: Remove Duplications

#### 1. Animation Hooks

- Delete `/apps/extension/src/hooks/useSlotMachineAnimation.ts`
- Update imports to use `@raffle-spinner/spinners`

#### 2. Test Files

- Move test files to proper `__tests__` directories
- Remove `/apps/extension/src/__tests__/subset-logic.test.ts`
- Create proper test structure in packages

### Phase 3: Improve Naming Conventions

#### 1. Component Names

- `CompetitionManagementContent` → `CompetitionManager`
- `WheelSegment` → `SlotMachineSegment`
- `WheelFrame` → `SlotMachineFrame`

#### 2. File Organization

```
packages/spinners/src/
├── slot-machine/
│   ├── SlotMachine.tsx           (main component)
│   ├── components/
│   │   ├── SlotMachineFrame.tsx
│   │   ├── SlotMachineSegment.tsx
│   │   └── SlotMachineControls.tsx
│   ├── hooks/
│   │   └── useSlotMachineAnimation.ts
│   └── utils/
│       └── subset-calculations.ts
```

### Phase 4: Extract Common Patterns

#### 1. Image Upload Pattern

- Used in multiple places for logos/banners
- Should be extracted to `@drawday/ui/ImageUpload`

#### 2. CSV Processing Pattern

- Column mapping logic repeated
- Should be centralized in `@raffle-spinner/csv-parser`

#### 3. Theme Management

- Theme context and utilities scattered
- Should be in `@raffle-spinner/theme` package

## Completed Refactoring ✅

### Phase 1: Type Consolidation (COMPLETED)

- ✅ Created `@drawday/types` package with all shared type definitions
- ✅ Updated `@raffle-spinner/storage` to re-export from types package
- ✅ Centralized all type definitions in one location

### Phase 2: Duplicate Code Removal (COMPLETED)

- ✅ Removed duplicate utility functions from extension's lib/utils.ts
- ✅ Removed duplicate wheel components (WheelFrame, WheelSegment)
- ✅ Removed duplicate SlotMachineWheel component from extension
- ✅ Extension now imports all shared code from packages

### Phase 3: Naming Improvements (COMPLETED)

- ✅ Renamed `WheelSegment` → `SlotMachineSegment`
- ✅ Renamed `WheelFrame` → `SlotMachineFrame`
- ✅ Updated all function names to be more descriptive
- ✅ Consistent naming across the codebase

### Remaining Tasks

- ⏳ Fully migrate to shared useSlotMachineAnimation hook (complex due to API differences)
- ⏳ Consider extracting useCSVImport to shared hooks package
- ⏳ Split utils package into more focused packages (optional)

## Code Smells to Address

1. **Long Import Paths**

   ```typescript
   // Current
   import { Something } from "../../../packages/some-package/src/some-file";

   // Should be
   import { Something } from "@raffle-spinner/some-package";
   ```

2. **Inconsistent Export Patterns**
   - Some packages use barrel exports, others don't
   - Should standardize on barrel exports for public API

3. **Mixed Concerns in Single Files**
   - Some components handle both UI and business logic
   - Should separate into container/presentational pattern where appropriate

## Success Metrics

- [ ] Zero duplicate code across packages
- [ ] All shared code in appropriate packages
- [ ] Clear, consistent naming conventions
- [ ] Each package has single responsibility
- [ ] All imports use package names, not relative paths
- [ ] 100% of shared utilities extracted

## Next Steps

1. Create types package
2. Remove duplicate animation hook
3. Refactor utils package
4. Update all imports
5. Run full test suite
6. Update documentation
