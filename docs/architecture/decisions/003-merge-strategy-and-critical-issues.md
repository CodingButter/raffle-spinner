# ADR-003: Merge Strategy and Critical Issues Resolution

## Status
Accepted

## Context
Multiple team members have been working on parallel branches with significant changes:
- Emily's critical refactoring (emily/critical-refactoring)
- Robert's Stripe integration (worktree/stripe-subscription-expert)
- Michael's performance optimization (michael/performance-optimization)
- David's security architecture (on development branch)

During architecture review, critical issues were discovered:
1. **File Size Violations**: SlotMachineWheel.tsx (579 lines) and SlotMachineWheelFixed.tsx (557 lines) still violate the 200-line limit despite refactoring attempts
2. **Security Architecture Removal**: Emily's branch inadvertently removed the security package during refactoring
3. **Missing Turbo Configuration**: turbo.json is missing, breaking monorepo build orchestration
4. **Incomplete Refactoring**: Commit messages claim 73% reduction in file sizes, but actual files remain unchanged

## Decision
We will implement a controlled merge strategy with critical fixes:

### Immediate Actions (P0 - Blocking)
1. **Preserve Security Architecture**: Maintain the @drawday/security package from development
2. **Complete SlotMachine Refactoring**: Actually reduce files to <200 lines as claimed
3. **Restore Turbo Configuration**: Add turbo.json for proper monorepo builds
4. **Fix Architectural Tests**: Ensure tests can run and validate boundaries

### Merge Order
1. **Phase 1 - Critical Fixes** (Today)
   - Fix SlotMachineWheel components to actually be <200 lines
   - Restore security architecture
   - Add turbo.json configuration
   
2. **Phase 2 - Integration** (After fixes)
   - Merge Emily's UI extractions (if properly refactored)
   - Integrate Robert's Stripe work
   - Apply Michael's performance optimizations
   
3. **Phase 3 - Validation**
   - Run full test suite
   - Verify no circular dependencies
   - Check bundle sizes
   - Validate security measures

## Consequences

### Positive
- Maintains code quality standards (200-line limit)
- Preserves critical security infrastructure
- Ensures proper monorepo build orchestration
- Prevents technical debt accumulation
- Maintains reversibility of all changes

### Negative
- Requires immediate rework of Emily's refactoring
- May delay feature delivery by 1-2 days
- Requires coordination across team members
- Some work may need to be redone

## Alternatives Considered
1. **Merge as-is and fix later**: Rejected - violates our quality standards and creates technical debt
2. **Revert all changes**: Rejected - loses valuable work from team members
3. **Cherry-pick specific commits**: Rejected - too complex with interdependencies

## Rollback Plan
1. All work is in feature branches, main is protected
2. Development branch can be reset if needed
3. Each phase can be reverted independently
4. Git worktrees ensure clean separation

## Success Metrics
- All files <200 lines (enforced by ESLint)
- Zero circular dependencies
- Security package intact and functional
- All architectural tests passing
- Bundle size increase <5%
- Build time <30 seconds
- Test coverage >80% for critical paths

## Implementation Steps
1. Create new branch from development
2. Actually extract SlotMachine components to utils
3. Verify security package is intact
4. Add turbo.json with proper task pipeline
5. Run all quality checks
6. Merge to development
7. Coordinate team member rebases

## Team Coordination Required
- **Emily**: Needs to verify her refactoring actually reduces file sizes
- **Robert**: Needs to rebase after security fixes
- **Michael**: Performance work should be tested after refactoring
- **Sarah**: Update sprint timeline for 1-2 day delay
- **Jamie**: Approve deviation from original timeline for quality

## Risk Mitigation
- All changes reversible via git
- Feature flags for risky changes
- Incremental merging with validation
- Maintain audit trail in Memento