# ADR-006: Critical System Architecture Gaps and Resolution

## Status

Accepted

## Context

During critical system verification on 2025-08-20, multiple architectural gaps were identified that prevent end-to-end system functionality. The system requires immediate architectural fixes to ensure complete data flow from authentication through to spinner functionality.

### Identified Gaps

1. **Authentication Flow**: Auth system → User session → Protected routes disconnection
2. **Data Persistence**: LocalStorage → React state synchronization issues
3. **Extension Integration**: Website pages not properly connected to extension context
4. **API Connectivity**: Directus returning 403 Forbidden, Stripe marked as DOWN
5. **Code Quality**: 50+ files exceeding 200-line limit (highest: 669 lines)
6. **State Management**: Context providers not properly propagating across routes

## Decision

### Immediate Actions Required

#### 1. Authentication Bridge

- Implement unified auth provider across website and extension
- Create session persistence layer using chrome.storage.sync
- Add auth state verification at each protected route

#### 2. Data Flow Architecture

```
User Login (Website)
    ↓
Directus Auth → JWT Token
    ↓
Store in chrome.storage.sync
    ↓
Extension reads auth state
    ↓
Options/Sidepanel authenticated
```

#### 3. Storage Layer Abstraction

- Create unified storage interface
- Implement adapters for localStorage, chrome.storage, and memory
- Add state synchronization hooks

#### 4. Extension Context Bridge

```typescript
// Shared context bridge
interface ExtensionBridge {
  auth: AuthState;
  competitions: Competition[];
  settings: Settings;
  subscription: SubscriptionState;
}
```

#### 5. Code Refactoring Priority

- P0: Files >500 lines (3 files)
- P1: Files >300 lines (15 files)
- P2: Files >200 lines (32 files)

## Consequences

### Positive

- Complete end-to-end functionality restored
- Improved code maintainability
- Better separation of concerns
- Reduced technical debt
- Easier testing and debugging

### Negative

- Significant refactoring effort required
- Temporary disruption during migration
- Additional complexity in bridge layers

## Alternatives Considered

1. **Monolithic Approach**: Merge everything into single context
   - Rejected: Would increase complexity and reduce modularity

2. **Message Passing Only**: Use Chrome runtime messages exclusively
   - Rejected: Too complex for state management

3. **Defer Refactoring**: Fix connectivity first, refactor later
   - Rejected: Code quality issues blocking proper fixes

## Rollback Plan

1. Keep current implementation in parallel
2. Feature flag new architecture
3. Gradual migration per component
4. Rollback via feature flag if issues arise

## Success Metrics

- Auth flow works end-to-end: Target 100%
- All files under 200 lines: Target 100%
- Integration tests passing: Target 100%
- Build time under 30 seconds: Current ~25s ✓
- Zero circular dependencies: Current 0 ✓

## Implementation Order

### Phase 1: Critical Fixes (Day 1)

1. Fix Directus authentication (403 error)
2. Implement auth bridge between website and extension
3. Create unified storage layer

### Phase 2: Refactoring (Day 2)

1. Break down files >500 lines
2. Extract shared components to @drawday/ui
3. Implement proper context providers

### Phase 3: Testing & Verification (Day 3)

1. End-to-end Playwright tests
2. Integration tests for all connections
3. Performance verification

## Team Assignments

- **David (Architecture)**: Overall system design and storage layer
- **Emily (Frontend)**: Component refactoring and UI extraction
- **Robert (Integration)**: Directus/Stripe connectivity fixes
- **Michael (Performance)**: Code splitting and optimization
- **Sarah (PM)**: Coordinate sprint and track blockers

## References

- Code health report: 50+ files over 200 lines
- Integration health: Directus 403, Stripe DOWN
- Build status: Successful but with warnings
- Previous ADRs: 001-005 for context
