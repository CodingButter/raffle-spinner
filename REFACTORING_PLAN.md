# Codebase Refactoring Plan

## Overview

This document outlines the systematic refactoring needed to improve code organization, documentation, and maintainability across the Raffle Spinner project.

## Priority 1: Large File Refactoring (Files >250 lines)

### Website Components

#### 1. HomePage.tsx (504 lines) → Split into:

- [x] `sections/HeroSection.tsx` - Hero with CTAs and trust badges
- [ ] `sections/StatsSection.tsx` - Animated statistics
- [ ] `sections/FeaturesSection.tsx` - Pain points & solutions grid
- [ ] `sections/TestimonialsSection.tsx` - Customer testimonials
- [ ] `sections/ComplianceSection.tsx` - UK compliance messaging
- [ ] `sections/FAQSection.tsx` - Frequently asked questions
- [ ] `sections/CTASection.tsx` - Final call-to-action
- [ ] `sections/DemoShowcase.tsx` - Demo carousel integration
- [ ] `components/AnimatedCounter.tsx` - Reusable counter component

#### 2. DemoCarousel.tsx (280 lines) → Split into:

- [ ] `carousel/CarouselContainer.tsx` - Main container logic
- [ ] `carousel/CarouselControls.tsx` - Play/pause/navigation
- [ ] `carousel/CarouselSlide.tsx` - Individual slide component
- [ ] `carousel/ThumbnailStrip.tsx` - Thumbnail navigation

### Extension Components

#### 3. OptionsPage.tsx (307 lines) → Already uses composition, needs:

- [ ] Extract modal management logic to custom hook
- [ ] Move delete confirmation logic to separate handler
- [ ] Add proper file header documentation

#### 4. ColumnMapper.tsx (352 lines) → Split into:

- [ ] `mapper/MappingForm.tsx` - Form UI
- [ ] `mapper/SavedMappings.tsx` - Saved mapping selection
- [ ] `mapper/PreviewTable.tsx` - Data preview
- [ ] `hooks/useColumnMapping.ts` - Mapping logic

#### 5. useCSVImport.ts (300 lines) → Split into:

- [ ] `csv/useCSVParser.ts` - CSV parsing logic
- [ ] `csv/useCSVValidation.ts` - Validation logic
- [ ] `csv/useCSVMapping.ts` - Column mapping logic

#### 6. SpinnerCustomization.tsx (292 lines) → Split into:

- [ ] `customization/ColorPicker.tsx` - Color selection
- [ ] `customization/FontSelector.tsx` - Font options
- [ ] `customization/PreviewPane.tsx` - Live preview

#### 7. SidePanel.tsx (285 lines) → Split into:

- [ ] `sidepanel/CompetitionSelector.tsx` - Competition dropdown
- [ ] `sidepanel/SpinnerContainer.tsx` - Spinner wrapper
- [ ] `sidepanel/WinnerDisplay.tsx` - Winner announcement
- [ ] `sidepanel/SpinControls.tsx` - Input and spin button

## Priority 2: Add File Headers

### Template for All Files:

```typescript
/**
 * [Component/Module Name]
 *
 * Purpose: [Brief description]
 *
 * Document Reference:
 * - [SRS/Website Requirements section]
 *
 * @module [module-path]
 * @since [version]
 */
```

### Files Needing Headers (Sample):

- [ ] All components in `/apps/extension/src/components/`
- [ ] All components in `/apps/website/components/`
- [ ] All hooks in `/apps/extension/src/hooks/`
- [ ] All context providers
- [ ] All utility files

## Priority 3: Documentation Standards

### 1. Component Documentation

```typescript
interface ComponentProps {
  /** Description of prop */
  propName: Type;
}

/**
 * Component description
 * @param props - Component properties
 * @returns React component
 */
export function Component({ propName }: ComponentProps) {
  // Implementation
}
```

### 2. Hook Documentation

```typescript
/**
 * Hook description
 * @param param - Parameter description
 * @returns {Object} Return value description
 * @example
 * const { data, loading } = useHook(params);
 */
```

### 3. Utility Function Documentation

```typescript
/**
 * Function description
 * @param {Type} param - Parameter description
 * @returns {Type} Return value description
 * @throws {Error} Error conditions
 */
```

## Priority 4: Code Organization Guidelines

### 1. File Size Limits

- Components: Max 200 lines
- Hooks: Max 150 lines
- Utilities: Max 100 lines per function
- Context Providers: Max 150 lines

### 2. Folder Structure

```
component-folder/
├── index.ts           # Exports
├── Component.tsx      # Main component
├── Component.types.ts # TypeScript types
├── Component.test.tsx # Tests
└── Component.css      # Styles (if needed)
```

### 3. Import Order

```typescript
// 1. React imports
import React, { useState } from "react";

// 2. Third-party libraries
import { Button } from "@raffle-spinner/ui";

// 3. Local imports
import { localFunction } from "./utils";

// 4. Types
import type { ComponentProps } from "./types";

// 5. Styles
import "./styles.css";
```

## Priority 5: Performance Optimizations

### 1. Memoization

- [ ] Add React.memo to pure components
- [ ] Use useMemo for expensive computations
- [ ] Use useCallback for stable function references

### 2. Code Splitting

- [ ] Lazy load heavy components
- [ ] Dynamic imports for routes
- [ ] Separate vendor bundles

### 3. Bundle Size

- [ ] Analyze bundle with webpack-bundle-analyzer
- [ ] Remove unused dependencies
- [ ] Tree-shake imports

## Implementation Timeline

### Phase 1: Week 1

- Refactor largest files (>300 lines)
- Add headers to all new components

### Phase 2: Week 2

- Refactor medium files (250-300 lines)
- Add comprehensive documentation

### Phase 3: Week 3

- Add headers to existing files
- Implement performance optimizations

### Phase 4: Week 4

- Testing and validation
- Documentation review
- Final cleanup

## Success Metrics

- [ ] No file exceeds 250 lines
- [ ] 100% of files have proper headers
- [ ] All exports are documented
- [ ] Bundle size reduced by 20%
- [ ] Test coverage above 80%

## Tools & Scripts

### Automated Header Addition

```bash
# Script to add headers to files missing them
node scripts/add-headers.js
```

### File Size Check

```bash
# Check for files exceeding limits
find src -name "*.tsx" -o -name "*.ts" | xargs wc -l | sort -rn
```

### Documentation Coverage

```bash
# Check documentation coverage
npx typedoc --validation
```

## Review Checklist

Before marking a file as complete:

- [ ] File is under 250 lines
- [ ] Has proper header with references
- [ ] All exports are documented
- [ ] Types are properly defined
- [ ] No console.log statements
- [ ] Follows import order convention
- [ ] Has associated tests (if applicable)

---

**Status:** In Progress
**Last Updated:** December 2024
**Owner:** Development Team
