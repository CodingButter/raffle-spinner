# ADR-001: Chrome API Mock Architecture for Standalone Development

## Status
Accepted

## Context
The spinner extension requires Chrome Extension APIs (storage, runtime, tabs, sidePanel) to function. During standalone development (outside of Chrome extension context), React components fail to initialize because `window.chrome` is undefined. We need a robust mock system that:
- Provides all required Chrome APIs before React components mount
- Works in regular browser environment without build tools
- Maintains API compatibility with real Chrome APIs
- Provides debugging and development utilities

## Decision
We have created a browser-compatible Chrome API mock system with the following architecture:

1. **chrome-mocks.js**: Core mock implementations that mirror Chrome API behavior
   - ChromeStorageMock: Full storage API with persistence and change listeners
   - ChromeRuntimeMock: Message passing and extension lifecycle
   - ChromeTabsMock: Tab management operations
   - No dependencies on test frameworks (vitest removed)

2. **setup-mocks.js**: Mock initialization and verification
   - Sets up window.chrome before components load
   - Verifies all required APIs are available
   - Provides development utilities via window.__chromeMocks

3. **verify-mocks.js**: Runtime verification for React components
   - Checks mock availability when components mount
   - Provides detailed error reporting
   - Shows visual warnings in development mode

4. **standalone.html**: Development environment
   - Loads mocks before React scripts
   - Provides UI controls for testing
   - Shows real-time storage state

## Consequences

### Positive
- Components work seamlessly in standalone development
- Full Chrome API compatibility without extension context
- Detailed logging for debugging API interactions
- Visual feedback when mocks aren't properly initialized
- Development utilities for testing different scenarios
- No build tool dependencies - works with standard ES modules

### Negative
- Additional code to maintain for development environment
- Mock behavior may diverge from real Chrome APIs if not kept in sync
- Extra verification overhead in development builds

## Alternatives Considered

1. **Using Chrome Extension Developer Mode**: Rejected because it requires Chrome-specific setup and doesn't work in other browsers
2. **Conditional API Calls**: Rejected because it would require modifying all components to check for Chrome API availability
3. **Build-time Injection**: Rejected because it complicates the build process and doesn't work with hot module replacement

## Rollback Plan
1. Remove mock imports from React entry points (sidepanel.tsx, options.tsx)
2. Delete dev/chrome-mocks.js, setup-mocks.js, verify-mocks.js
3. Revert standalone.html to previous version
4. Components will only work in Chrome extension context

## Success Metrics
- Zero Chrome API errors in standalone development
- All storage operations work correctly
- Mock verification passes 100% of the time
- Development iteration speed increased by 50%