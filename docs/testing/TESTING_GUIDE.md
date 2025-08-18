# DrawDay Spinner Extension Testing Guide

## Overview

This guide provides comprehensive documentation for testing the DrawDay Spinner Chrome extension. Our testing infrastructure supports multiple testing modes and levels, from unit tests to full E2E testing.

## Table of Contents

1. [Testing Architecture](#testing-architecture)
2. [Quick Start](#quick-start)
3. [Testing Modes](#testing-modes)
4. [Chrome API Mocking](#chrome-api-mocking)
5. [Writing Tests](#writing-tests)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

## Testing Architecture

Our testing infrastructure consists of multiple layers:

```
┌─────────────────────────────────────────┐
│            E2E Tests (Playwright)       │
├─────────────────────────────────────────┤
│     Component Tests (Storybook)         │
├─────────────────────────────────────────┤
│    Integration Tests (Vitest + RTL)     │
├─────────────────────────────────────────┤
│        Unit Tests (Vitest)              │
├─────────────────────────────────────────┤
│     Chrome API Mock Layer               │
└─────────────────────────────────────────┘
```

## Quick Start

### Running All Tests

```bash
# Run all unit and integration tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e

# Open Storybook for component testing
pnpm storybook

# Run standalone dev mode
pnpm dev:standalone
```

### Testing a Specific Component

```bash
# Run tests for a specific file
pnpm test src/components/MyComponent.test.tsx

# Run tests in watch mode
pnpm test --watch

# Debug a specific test
pnpm test:e2e:debug
```

## Testing Modes

### 1. Standalone Development Mode

The standalone mode allows running the extension outside of Chrome for rapid development:

```bash
pnpm dev:standalone
```

Features:
- Hot module replacement
- Chrome API mocking
- Debug panel with storage viewer
- Quick mock data loading

Access at: `http://localhost:5173/src/dev/standalone.html`

### 2. Storybook Component Playground

Storybook provides isolated component development and testing:

```bash
pnpm storybook
```

Features:
- Visual component testing
- Interactive props exploration
- Documentation generation
- Accessibility testing

Access at: `http://localhost:6006`

### 3. Unit & Integration Testing

Using Vitest with React Testing Library:

```bash
# Run once
pnpm test:run

# Watch mode
pnpm test

# With coverage
pnpm test:coverage
```

### 4. E2E Testing

Using Playwright for full end-to-end testing:

```bash
# Run all E2E tests
pnpm test:e2e

# Interactive UI mode
pnpm test:e2e:ui

# Debug mode
pnpm test:e2e:debug
```

## Chrome API Mocking

### Using Chrome Storage Mock

```typescript
import { chromeStorageMock } from '@/test/mocks/chrome-storage';

// Set initial data
chromeStorageMock._setData({
  competitions: [...],
  settings: {...}
});

// Test storage operations
await chrome.storage.local.set({ key: 'value' });
const result = await chrome.storage.local.get('key');

// Reset for next test
chromeStorageMock._reset();
```

### Using Chrome Runtime Mock

```typescript
import { chromeRuntimeMock } from '@/test/mocks/chrome-runtime';

// Simulate a message
chromeRuntimeMock._simulateMessage({ type: 'ACTION' });

// Test message sending
chrome.runtime.sendMessage({ type: 'REQUEST' });

// Reset for next test
chromeRuntimeMock._reset();
```

## Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect, vi } from 'vitest';
import { calculateWinner } from '@/utils/spinner';

describe('calculateWinner', () => {
  it('should select a winner based on position', () => {
    const participants = [
      { firstName: 'Alice', lastName: 'Test', ticketNumber: 'T001' },
      { firstName: 'Bob', lastName: 'Test', ticketNumber: 'T002' },
    ];
    
    const winner = calculateWinner(participants, 0.25); // 25% position
    expect(winner).toEqual(participants[0]);
  });
});
```

### Component Test Example

```typescript
import { render, screen, fireEvent } from '@/test/utils/render';
import { SpinButton } from '@/components/SpinButton';

describe('SpinButton', () => {
  it('should trigger spin action when clicked', async () => {
    const onSpin = vi.fn();
    render(<SpinButton onSpin={onSpin} />);
    
    const button = screen.getByRole('button', { name: /spin/i });
    fireEvent.click(button);
    
    expect(onSpin).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Test Example

```typescript
import { renderWithProviders, waitForStorage } from '@/test/utils/render';
import { CompetitionSelector } from '@/components/CompetitionSelector';
import { setupStorage } from '@/test/utils/render';

describe('CompetitionSelector Integration', () => {
  it('should load and display competitions from storage', async () => {
    // Setup mock storage
    setupStorage({
      competitions: [
        { id: '1', name: 'Test Competition', participants: [] }
      ]
    });
    
    // Render with providers
    const { getByText } = renderWithProviders(<CompetitionSelector />);
    
    // Wait for storage operations
    await waitForStorage();
    
    // Verify competition is displayed
    expect(getByText('Test Competition')).toBeInTheDocument();
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test('should complete a full raffle workflow', async ({ page }) => {
  // Navigate to standalone mode
  await page.goto('/src/dev/standalone.html');
  
  // Load mock data
  await page.click('button:has-text("Load Mock Data")');
  
  // Trigger spin
  await page.click('button:has-text("Spin")');
  
  // Wait for animation
  await page.waitForTimeout(3000);
  
  // Verify winner is displayed
  await expect(page.locator('.winner-display')).toBeVisible();
});
```

## Best Practices

### 1. Test Organization

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx      # Unit tests
│   │   └── Button.stories.tsx   # Storybook stories
├── test/
│   ├── e2e/                     # E2E tests
│   ├── integration/             # Integration tests
│   ├── fixtures/                # Test data
│   ├── mocks/                   # API mocks
│   └── utils/                   # Test utilities
```

### 2. Test Naming Conventions

- **Unit tests**: `ComponentName.test.tsx`
- **Integration tests**: `FeatureName.integration.test.tsx`
- **E2E tests**: `workflow.spec.ts`
- **Test descriptions**: Use descriptive, behavior-focused names

### 3. Mock Data Management

Use factories for consistent test data:

```typescript
import { CompetitionFactory } from '@/test/utils/factories';

const competition = CompetitionFactory.create({
  name: 'Custom Competition'
});

const largeCompetition = CompetitionFactory.createWithParticipants(1000);
```

### 4. Assertion Best Practices

Use custom assertions for domain-specific checks:

```typescript
import { expectValidCompetition, expectNoDuplicateTickets } from '@/test/utils/assertions';

expectValidCompetition(competition);
expectNoDuplicateTickets(competition.participants);
```

### 5. Performance Testing

Monitor component render performance:

```typescript
import { measureRender } from '@/test/utils/performance';

test('should render large list efficiently', async () => {
  const renderTime = await measureRender(
    <ParticipantList participants={largeDataSet} />
  );
  
  expect(renderTime).toBeLessThan(100); // ms
});
```

## Troubleshooting

### Common Issues

#### Chrome APIs not available in tests

**Solution**: Ensure test setup file is imported:
```typescript
import '@/test/setup';
```

#### Storage operations not working

**Solution**: Reset mocks between tests:
```typescript
beforeEach(() => {
  chromeStorageMock._reset();
});
```

#### Storybook not loading

**Solution**: Check that all dependencies are installed:
```bash
pnpm install
```

#### E2E tests failing to load extension

**Solution**: Build the extension first:
```bash
pnpm build
pnpm test:e2e
```

### Debug Tips

1. **Use debug mode for E2E tests**:
   ```bash
   pnpm test:e2e:debug
   ```

2. **Enable verbose logging**:
   ```typescript
   console.log('Storage state:', chromeStorageMock._getData());
   ```

3. **Use Playwright trace viewer**:
   ```bash
   npx playwright show-trace trace.zip
   ```

4. **Check React DevTools in standalone mode**:
   - Install React DevTools extension
   - Open standalone mode
   - Inspect component tree

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test:coverage
      - run: pnpm build
      - run: pnpm test:e2e
      
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: test-results
          path: |
            test-results/
            playwright-report/
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [Storybook Documentation](https://storybook.js.org/)
- [Chrome Extension Testing Guide](https://developer.chrome.com/docs/extensions/mv3/unit-testing/)

## Support

For questions or issues with testing:
1. Check this guide first
2. Review existing test examples
3. Ask in the team Slack channel
4. Create an issue with the `testing` label