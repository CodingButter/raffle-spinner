# ADR-001: Website Extension Pages Architecture

## Status

Accepted

## Context

We are migrating the Chrome extension functionality to be available as website pages at `/extension/options` and `/extension/sidepanel`. This allows users to access the raffle spinner functionality without installing a browser extension, improving accessibility and reducing friction.

Key challenges:

1. SidePanel.tsx is 319 lines (violates 200-line limit)
2. Options page is not fully implemented (stub only)
3. Need to maintain 60fps spinner performance
4. Must handle SSR constraints for Canvas components
5. Data persistence needs to use localStorage instead of chrome.storage

## Decision

### 1. Component Architecture

Split large components into focused, reusable units:

#### SidePanel Refactoring (319 → <200 lines)

```
/extension/sidepanel/
├── page.tsx (5 lines - Next.js page)
├── SidePanel.tsx (<150 lines - main orchestrator)
├── components/
│   ├── BrandingHeader.tsx (<80 lines)
│   ├── SpinnerSection.tsx (<100 lines)
│   ├── SessionManager.tsx (<80 lines)
│   └── WinnerExporter.tsx (<50 lines)
└── hooks/
    ├── useConfettiEffect.ts (<40 lines)
    ├── useSpinnerHandlers.ts (<60 lines)
    └── useSessionWinners.ts (<50 lines)
```

#### Options Page Implementation

```
/extension/options/
├── page.tsx (5 lines - Next.js page)
├── Options.tsx (<150 lines - main orchestrator)
├── components/
│   ├── CompetitionList.tsx (<100 lines)
│   ├── CSVImporter.tsx (<80 lines)
│   ├── ColumnMapper.tsx (<100 lines)
│   └── DuplicateHandler.tsx (<60 lines)
└── hooks/
    ├── useCompetitionStorage.ts (<50 lines)
    └── useCSVProcessing.ts (<80 lines)
```

### 2. Data Flow Architecture

```
localStorage (Browser Storage)
    ↓
Context Providers (Client-side only)
    ↓
Page Components ('use client')
    ↓
UI Components (Modular & Focused)
```

### 3. Performance Optimizations

- Dynamic imports for Canvas components
- React.memo for expensive re-renders
- useCallback for stable references
- RequestAnimationFrame for 60fps animations
- Virtual scrolling for large participant lists

### 4. SSR Handling

```typescript
// Dynamic import pattern for Canvas components
const SlotMachineWheel = dynamic(
  () => import('@raffle-spinner/spinners').then(mod => mod.SlotMachineWheel),
  {
    ssr: false,
    loading: () => <SpinnerSkeleton />
  }
);
```

## Consequences

### Positive

- Clean separation of concerns
- All files under 200-line limit
- Improved testability
- Better performance through code splitting
- Easier maintenance and debugging
- Reusable components across pages

### Negative

- More files to manage
- Slightly increased complexity in file navigation
- Need to ensure consistent state management across components

## Alternatives Considered

1. **Single large file approach**: Rejected due to 200-line limit violation and maintenance concerns
2. **Server components**: Rejected due to need for client-side localStorage and real-time interactions
3. **Iframe embedding extension**: Rejected due to performance overhead and communication complexity

## Rollback Plan

1. Keep original spinner-extension code unchanged
2. If website version fails, redirect users to extension installation
3. Feature flag to toggle between implementations:
   ```typescript
   const USE_WEBSITE_VERSION = process.env.NEXT_PUBLIC_USE_WEBSITE_VERSION === 'true';
   ```
4. Gradual rollout with monitoring
5. Revert deployment if performance degrades below 60fps

## Success Metrics

- Build time: <30 seconds
- Bundle size: <500kb for extension pages
- Performance: 60fps during spinner animation
- Load time: <2 seconds
- Test coverage: >80% for critical paths
- Zero circular dependencies
