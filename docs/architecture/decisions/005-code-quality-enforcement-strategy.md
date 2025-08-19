# ADR-005: Code Quality Enforcement Strategy

## Status
Accepted

## Context
Following the successful merge of Performance Testing Infrastructure (PR #107) and Testing Documentation (PR #108), we have identified critical code quality issues that are blocking development:
- 89 ESLint errors preventing builds
- 8+ files exceeding the 200-line maximum limit
- Multiple functions exceeding 100-line limit
- Cyclomatic complexity violations (>10)
- TypeScript dependency resolution failures

## Decision
Implement a phased approach to resolve code quality issues:

### Phase 1: Critical Blockers (Immediate)
1. Fix TypeScript dependency resolution issues
2. Temporarily disable ESLint rules for test files
3. Create override configuration for legacy files

### Phase 2: Refactoring (Short-term)
1. Break down large components into smaller, focused modules
2. Extract complex logic into custom hooks
3. Split test files into logical groups
4. Reduce cyclomatic complexity through decomposition

### Phase 3: Enforcement (Long-term)
1. Maintain strict ESLint rules for new code
2. Gradually refactor legacy code to meet standards
3. Implement pre-commit hooks to prevent violations

## Implementation Strategy

### Immediate Actions
```javascript
// .eslintrc.override.js
module.exports = {
  overrides: [
    {
      files: ['**/__tests__/**', '**/*.test.ts', '**/*.test.tsx'],
      rules: {
        'max-lines-per-function': ['error', { max: 200 }], // Relaxed for tests
        'max-lines': ['error', { max: 500 }] // Relaxed for test files
      }
    },
    {
      files: [
        // Legacy files pending refactor
        'apps/spinner-extension/src/components/options/ColumnMapper.tsx',
        'apps/spinner-extension/src/pages/SidePanel.tsx',
        // Add other large files here
      ],
      rules: {
        'max-lines': 'warn', // Warn instead of error
        'max-lines-per-function': 'warn',
        'complexity': 'warn'
      }
    }
  ]
};
```

### Refactoring Targets
Priority files for immediate refactoring:
1. `ColumnMapper.tsx` (318 lines, complexity 19)
2. `SidePanel.tsx` (259 lines, complexity 20)
3. `subscription-status.tsx` (complexity 23)
4. Test files exceeding 500 lines

## Consequences

### Positive
- Unblocks immediate development work
- Provides clear path to code quality improvement
- Maintains high standards for new code
- Reduces technical debt systematically

### Negative
- Temporary relaxation of standards for test files
- Legacy files remain non-compliant short-term
- Requires dedicated refactoring effort

## Alternatives Considered

1. **Disable all ESLint rules temporarily**
   - Rejected: Would allow quality to degrade further

2. **Immediate full refactor**
   - Rejected: Would block all feature development

3. **Permanent relaxation of limits**
   - Rejected: Would compromise code maintainability

## Rollback Plan
1. Remove override configuration
2. Revert to strict ESLint rules
3. Address violations through pair programming sessions

## Success Metrics
- Zero ESLint errors in CI/CD pipeline
- All new files under 200 lines
- All new functions under 100 lines
- Complexity score <10 for new code
- 50% reduction in violations within 2 sprints

## Team Assignments
- **Emily (Frontend)**: Refactor UI components
- **Michael (Performance)**: Optimize complex functions
- **Robert (Integration)**: Fix TypeScript dependencies
- **David (Architecture)**: Oversee refactoring patterns
- **Sarah (PM)**: Track refactoring progress

## Next Steps
1. Apply ESLint override configuration
2. Fix TypeScript dependency issues
3. Begin systematic refactoring of largest files
4. Document refactoring patterns for team reference