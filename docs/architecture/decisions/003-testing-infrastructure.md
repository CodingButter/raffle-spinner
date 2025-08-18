# ADR-003: Comprehensive Testing Infrastructure for Chrome Extension

## Status
Accepted

## Context
The DrawDay Spinner extension currently lacks a comprehensive testing infrastructure. The extension cannot be easily tested without being installed in Chrome, making development slow and error-prone. We need:
- Standalone development mode for testing components outside Chrome
- Mocked Chrome APIs for unit and integration testing
- Component playground for visual testing
- E2E testing capabilities without Chrome extension installation
- Professional testing patterns and documentation

## Decision
We will implement a multi-layered testing infrastructure that enables both isolated and integrated testing of the Chrome extension components.

### 1. Chrome API Mock Layer
- Comprehensive mock implementation of all Chrome APIs used by the extension
- Configurable mock responses for different test scenarios
- Mock state management for storage operations
- Event simulation for chrome.runtime messages

### 2. Standalone Dev Mode
- Vite-based development server for running extension components outside Chrome
- React DevTools integration for debugging
- Hot module replacement for rapid development
- Environment switching between Chrome and standalone modes

### 3. Testing Framework Stack
- **Unit Testing**: Vitest with React Testing Library
- **Component Testing**: Storybook for visual component development
- **Integration Testing**: Playwright with mock Chrome APIs
- **E2E Testing**: Playwright with actual Chrome extension loading
- **Visual Regression**: Playwright screenshots with Percy/Chromatic

### 4. Test Organization Structure
```
apps/spinner-extension/
├── src/
│   ├── test/
│   │   ├── setup.ts              # Global test setup
│   │   ├── mocks/                # Chrome API mocks
│   │   │   ├── chrome-storage.ts
│   │   │   ├── chrome-runtime.ts
│   │   │   └── chrome-tabs.ts
│   │   ├── fixtures/             # Test data fixtures
│   │   │   ├── competitions.ts
│   │   │   ├── participants.ts
│   │   │   └── settings.ts
│   │   ├── utils/                # Test utilities
│   │   │   ├── render.tsx        # Custom render with providers
│   │   │   ├── factories.ts      # Data factories
│   │   │   └── assertions.ts     # Custom assertions
│   │   └── e2e/                  # E2E test specs
│       └── integration/          # Integration test specs
├── .storybook/                   # Storybook configuration
└── playwright/                   # Playwright configuration
```

## Consequences

### Positive
- **Faster Development**: Hot reload without Chrome reinstallation
- **Better Test Coverage**: Can test all layers independently
- **Visual Testing**: Component playground for UI development
- **CI/CD Ready**: Automated testing in pipelines
- **Documentation**: Living documentation through Storybook
- **Debugging**: Better error messages and stack traces
- **Regression Prevention**: Visual and functional regression tests

### Negative
- **Initial Setup Time**: 2-3 days for full implementation
- **Maintenance Overhead**: Mock layer needs updates with Chrome API changes
- **Learning Curve**: Team needs to learn new testing patterns
- **Build Complexity**: Additional build configurations for different modes

## Alternatives Considered

1. **Chrome Extension Testing Framework Only**
   - Why rejected: Limited to Chrome environment, slow feedback loop

2. **Manual Testing Only**
   - Why rejected: Not scalable, error-prone, no regression prevention

3. **Puppeteer with Extension Loading**
   - Why rejected: Slower than Playwright, less feature-rich

## Rollback Plan
1. Keep existing minimal test setup as fallback
2. New infrastructure is additive, not replacing
3. Can disable new test suites if issues arise
4. Gradual adoption - teams can migrate at their own pace

## Success Metrics
- **Test Execution Time**: <2 minutes for full suite
- **Test Coverage**: >80% for critical paths
- **Developer Productivity**: 50% reduction in bug fix time
- **Regression Rate**: <5% of fixed bugs reoccur
- **Development Speed**: 30% faster feature delivery