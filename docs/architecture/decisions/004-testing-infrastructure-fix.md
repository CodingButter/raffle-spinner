# ADR-004: Testing Infrastructure Fix

## Status
Accepted

## Context
Jamie has identified critical P0 issues blocking testing:
1. Missing monorepo package dependencies preventing test execution
2. ESLint errors blocking build and test processes
3. TypeScript compilation errors preventing type safety validation
4. Testing commands fail due to unresolved dependencies

## Decision
Implement a comprehensive testing infrastructure fix that:
1. Ensures all dependencies are properly installed across the monorepo
2. Fixes or temporarily suppresses non-critical ESLint errors to unblock testing
3. Resolves TypeScript compilation errors with proper type definitions
4. Verifies all test suites can execute successfully
5. Establishes clear testing patterns for unit, integration, and E2E tests

## Implementation Strategy

### 1. Dependency Resolution
```bash
# Install all monorepo dependencies
pnpm install --force

# Verify workspace links
pnpm ls --depth 0

# Rebuild all packages
pnpm -r build
```

### 2. ESLint Configuration
- Temporarily disable max-lines rule for files pending refactor
- Configure overrides for test files
- Ensure all workspace packages use shared ESLint config

### 3. TypeScript Configuration
- Add missing type definitions
- Configure path mappings for workspace packages
- Ensure tsconfig extends shared configuration

### 4. Test Suite Setup
```json
{
  "scripts": {
    "test": "pnpm -r test",
    "test:unit": "vitest run",
    "test:e2e": "playwright test",
    "test:integration": "vitest run --config vitest.integration.config.ts"
  }
}
```

## Consequences

### Positive
- Unblocks development team from testing new features
- Ensures code quality through automated testing
- Provides clear testing patterns for new contributors
- Enables CI/CD pipeline to validate changes

### Negative
- Temporary ESLint suppressions create technical debt
- May need to refactor large files to meet standards
- Initial setup time investment

## Alternatives Considered

1. **Quick Fix Only**: Just install dependencies and ignore linting/type errors
   - Rejected: Would create more technical debt and fragile tests

2. **Complete Refactor First**: Fix all code quality issues before enabling tests
   - Rejected: Would block testing for too long, violating P0 priority

3. **Separate Test Infrastructure**: Create isolated test environment
   - Rejected: Would diverge from production code structure

## Rollback Plan
1. Revert package.json changes
2. Remove temporary ESLint overrides
3. Restore previous TypeScript configuration
4. Document issues encountered for future resolution

## Success Metrics
- All `pnpm test` commands execute without dependency errors
- ESLint passes with configured rules
- TypeScript compilation succeeds
- At least one test from each category (unit, integration, E2E) passes
- CI pipeline can run tests automatically

## Testing Verification Checklist
- [ ] `pnpm install` completes without errors
- [ ] `pnpm lint` passes or has documented suppressions
- [ ] `pnpm typecheck` completes successfully
- [ ] `pnpm test` executes unit tests
- [ ] `pnpm test:e2e` can launch Playwright
- [ ] All workspace packages have test scripts defined

## Next Steps
1. Run dependency installation
2. Fix critical ESLint errors
3. Resolve TypeScript compilation issues
4. Verify test execution
5. Document any remaining issues for follow-up