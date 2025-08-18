# Testing Best Practices Guide
*Author: David Miller, Lead Developer Architect*
*Date: 2025-08-18*

## Executive Summary

This guide establishes testing standards and best practices for the DrawDay platform. Every developer must follow these patterns to ensure code quality, maintainability, and reliability.

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Test Structure](#test-structure)
3. [Unit Testing](#unit-testing)
4. [Integration Testing](#integration-testing)
5. [E2E Testing](#e2e-testing)
6. [Test Examples](#test-examples)
7. [Running Tests](#running-tests)
8. [Coverage Requirements](#coverage-requirements)

## Testing Philosophy

### Core Principles

1. **Test Behavior, Not Implementation**
   - Focus on what the code does, not how it does it
   - Tests should survive refactoring

2. **Arrange-Act-Assert (AAA) Pattern**
   - Arrange: Set up test data and conditions
   - Act: Execute the function/component
   - Assert: Verify the results

3. **One Assertion Per Test**
   - Each test should verify one specific behavior
   - Multiple related assertions are acceptable

4. **Descriptive Test Names**
   - Test names should describe the scenario and expected outcome
   - Format: `should [expected behavior] when [condition]`

## Test Structure

### File Organization

```
src/
├── components/
│   ├── Button.tsx
│   └── __tests__/
│       └── Button.test.tsx
├── hooks/
│   ├── useAuth.ts
│   └── __tests__/
│       └── useAuth.test.ts
└── utils/
    ├── validation.ts
    └── __tests__/
        └── validation.test.ts
```

### Test File Naming

- Unit tests: `[component].test.tsx` or `[module].test.ts`
- Integration tests: `[feature].integration.test.ts`
- E2E tests: `[flow].e2e.test.ts`

## Unit Testing

### Component Testing Example

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button Component', () => {
  describe('Rendering', () => {
    it('should render with text content', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: /click me/i }))
        .toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<Button className="custom">Button</Button>);
      expect(screen.getByRole('button')).toHaveClass('custom');
    });
  });

  describe('Interaction', () => {
    it('should handle click events', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click</Button>);
      
      fireEvent.click(screen.getByRole('button'));
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not trigger click when disabled', () => {
      const handleClick = vi.fn();
      render(
        <Button onClick={handleClick} disabled>
          Disabled
        </Button>
      );
      
      fireEvent.click(screen.getByRole('button'));
      
      expect(handleClick).not.toHaveBeenCalled();
    });
  });
});
```

### Hook Testing Example

```typescript
import { renderHook, act } from '@testing-library/react';
import { useCounter } from '../useCounter';

describe('useCounter Hook', () => {
  it('should initialize with default value', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it('should increment counter', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });
});
```

## Integration Testing

### Storage Integration Example

```typescript
describe('Chrome Storage Integration', () => {
  let storage: StorageManager;

  beforeEach(() => {
    storage = new StorageManager(chromeStorageMock);
  });

  it('should persist and retrieve complex data', async () => {
    const data = {
      competition: { id: '123', participants: [] },
      settings: { theme: 'dark' }
    };

    await storage.set('data', data);
    const retrieved = await storage.get('data');
    
    expect(retrieved).toEqual(data);
  });

  it('should handle concurrent operations', async () => {
    const operations = [
      storage.set('key1', 'value1'),
      storage.set('key2', 'value2'),
      storage.get('key1')
    ];

    const results = await Promise.all(operations);
    expect(results[2]).toBe('value1');
  });
});
```

### API Integration Example

```typescript
describe('Authentication API Integration', () => {
  it('should complete login flow', async () => {
    const auth = new AuthService();
    
    const result = await auth.login('test@example.com', 'password');
    
    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(auth.isAuthenticated()).toBe(true);
  });

  it('should refresh expired tokens', async () => {
    const auth = new AuthService();
    await auth.login('test@example.com', 'password');
    
    // Simulate token expiry
    vi.advanceTimersByTime(3600000);
    
    const refreshed = await auth.refreshToken();
    expect(refreshed).toBe(true);
  });
});
```

## E2E Testing

### Playwright Test Example

```typescript
import { test, expect } from '@playwright/test';

test.describe('Raffle Draw Flow', () => {
  test('should complete full raffle draw', async ({ page }) => {
    // Navigate to extension
    await page.goto('chrome-extension://[id]/sidepanel.html');
    
    // Select competition
    await page.selectOption('[data-testid="competition-select"]', 'Summer Raffle');
    
    // Start spin
    await page.click('[data-testid="spin-button"]');
    
    // Wait for animation
    await page.waitForTimeout(5000);
    
    // Verify winner displayed
    await expect(page.locator('[data-testid="winner-display"]'))
      .toBeVisible();
  });
});
```

## Test Examples

### Created Example Tests

1. **Button Component Unit Test**
   - Location: `/apps/spinner-extension/src/components/ui/__tests__/button.test.tsx`
   - Demonstrates: Component rendering, props, events, accessibility

2. **Chrome Storage Integration Test**
   - Location: `/packages/storage/src/__tests__/chrome-storage-integration.test.ts`
   - Demonstrates: Storage operations, listeners, transactions

3. **Authentication Flow Test**
   - Location: `/packages/@drawday/auth/src/__tests__/authentication-flow.test.ts`
   - Demonstrates: Login flow, token management, session persistence

4. **CSV Import Test**
   - Location: `/packages/csv-parser/src/__tests__/csv-import-flow.test.ts`
   - Demonstrates: Parsing, validation, duplicate detection

## Running Tests

### Commands

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific package tests
pnpm --filter @drawday/spinner-extension test

# Run E2E tests
pnpm test:e2e

# Run tests with UI
pnpm test:ui
```

### Debug Mode

```bash
# Debug with Vitest UI
pnpm vitest --ui

# Debug Playwright tests
pnpm playwright test --debug

# Debug specific test file
pnpm vitest src/components/__tests__/Button.test.tsx
```

## Coverage Requirements

### Minimum Coverage Targets

- **Overall**: 80%
- **Critical Paths**: 90%
- **Utility Functions**: 95%
- **New Code**: 85%

### Coverage Configuration

```javascript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '*.config.ts',
        '**/*.stories.tsx'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
});
```

### Viewing Coverage Reports

```bash
# Generate coverage report
pnpm test:coverage

# Open HTML report
open coverage/index.html
```

## Testing Checklist

### Before Committing

- [ ] All tests pass locally
- [ ] New features have tests
- [ ] Coverage meets requirements
- [ ] No console errors in tests
- [ ] Mocks are properly reset
- [ ] Test descriptions are clear
- [ ] No skipped tests without reason

### Test Quality Checklist

- [ ] Tests are isolated (no dependencies between tests)
- [ ] Tests are deterministic (same result every run)
- [ ] Tests are fast (<100ms for unit tests)
- [ ] Tests use proper assertions
- [ ] Tests cover edge cases
- [ ] Tests verify error scenarios
- [ ] Tests are maintainable

## Common Testing Patterns

### Testing Async Operations

```typescript
it('should handle async operations', async () => {
  const result = await fetchData();
  expect(result).toBeDefined();
});
```

### Testing Error Scenarios

```typescript
it('should handle errors gracefully', async () => {
  const operation = () => throwingFunction();
  await expect(operation).rejects.toThrow('Expected error');
});
```

### Testing with Timers

```typescript
it('should debounce input', async () => {
  vi.useFakeTimers();
  
  const handler = vi.fn();
  const debounced = debounce(handler, 500);
  
  debounced();
  debounced();
  
  vi.advanceTimersByTime(500);
  
  expect(handler).toHaveBeenCalledTimes(1);
  vi.useRealTimers();
});
```

## Troubleshooting

### Common Issues

1. **Tests fail in CI but pass locally**
   - Check timezone differences
   - Verify environment variables
   - Check for race conditions

2. **Flaky tests**
   - Add proper wait conditions
   - Use data-testid attributes
   - Increase timeout for slow operations

3. **Mock not working**
   - Ensure mock is imported before module
   - Check mock path resolution
   - Verify mock reset in afterEach

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
- [Jest Matchers](https://jestjs.io/docs/expect)

## Conclusion

Following these testing best practices ensures our codebase remains reliable, maintainable, and bug-free. Every team member should treat tests as first-class citizens in our development process.

Remember: **A feature without tests is not complete.**