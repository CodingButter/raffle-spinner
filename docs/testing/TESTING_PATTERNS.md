# Testing Patterns for Chrome Extension Development

## Chrome API Testing Patterns

### Pattern 1: Storage Testing

```typescript
// ❌ BAD: Direct Chrome API usage without mocking
describe('Settings', () => {
  it('should save settings', async () => {
    await chrome.storage.local.set({ theme: 'dark' }); // Will fail
    const result = await chrome.storage.local.get('theme');
    expect(result.theme).toBe('dark');
  });
});

// ✅ GOOD: Using mock with proper setup
import { chromeStorageMock } from '@/test/mocks/chrome-storage';

describe('Settings', () => {
  beforeEach(() => {
    chromeStorageMock._reset();
  });

  it('should save settings', async () => {
    await chrome.storage.local.set({ theme: 'dark' });
    const result = await chrome.storage.local.get('theme');
    expect(result.theme).toBe('dark');
    
    // Verify the mock was called correctly
    expect(chromeStorageMock.set).toHaveBeenCalledWith(
      { theme: 'dark' },
      expect.any(Function)
    );
  });
});
```

### Pattern 2: Message Passing

```typescript
// ✅ GOOD: Testing message passing between components
describe('Extension Messaging', () => {
  it('should handle inter-component messages', async () => {
    const messageHandler = vi.fn();
    
    // Setup listener
    chrome.runtime.onMessage.addListener(messageHandler);
    
    // Simulate message from another component
    chromeRuntimeMock._simulateMessage(
      { type: 'COMPETITION_UPDATED', data: { id: '123' } },
      { id: 'extension-id', tab: null }
    );
    
    // Verify handler was called
    expect(messageHandler).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'COMPETITION_UPDATED' }),
      expect.any(Object),
      expect.any(Function)
    );
  });
});
```

### Pattern 3: Tab Management

```typescript
// ✅ GOOD: Testing tab operations
describe('Tab Operations', () => {
  beforeEach(() => {
    chromeTabsMock._reset();
  });

  it('should create and query tabs', async () => {
    // Create a tab
    const tab = await chrome.tabs.create({ url: 'https://example.com' });
    expect(tab.id).toBeDefined();
    
    // Query tabs
    const tabs = await chrome.tabs.query({ active: true });
    expect(tabs).toHaveLength(0); // Not active by default
    
    // Update tab to be active
    await chrome.tabs.update(tab.id!, { active: true });
    
    // Query again
    const activeTabs = await chrome.tabs.query({ active: true });
    expect(activeTabs).toHaveLength(1);
    expect(activeTabs[0].id).toBe(tab.id);
  });
});
```

## Component Testing Patterns

### Pattern 4: Provider Testing

```typescript
// ✅ GOOD: Testing components with multiple providers
import { renderWithProviders } from '@/test/utils/render';

describe('CompetitionDashboard', () => {
  it('should render with all necessary providers', () => {
    const { getByTestId } = renderWithProviders(
      <CompetitionDashboard />,
      {
        initialCompetition: mockCompetition,
        initialSettings: mockSettings,
        withProviders: {
          competition: true,
          settings: true,
          theme: true,
          session: true,
          subscription: true,
        }
      }
    );
    
    expect(getByTestId('dashboard')).toBeInTheDocument();
  });
});
```

### Pattern 5: Async Component Testing

```typescript
// ✅ GOOD: Testing components with async data loading
describe('ParticipantList', () => {
  it('should load participants from storage', async () => {
    // Setup storage with test data
    setupStorage({
      participants: createMockParticipants(50)
    });
    
    const { findByText, queryByText } = renderWithProviders(
      <ParticipantList />
    );
    
    // Initially shows loading
    expect(queryByText(/loading/i)).toBeInTheDocument();
    
    // Wait for data to load
    await waitForStorage();
    
    // Verify participants are displayed
    expect(await findByText('First1 Last1')).toBeInTheDocument();
    expect(queryByText(/loading/i)).not.toBeInTheDocument();
  });
});
```

### Pattern 6: User Interaction Testing

```typescript
// ✅ GOOD: Testing complex user interactions
describe('SpinnerWheel', () => {
  it('should handle complete spin workflow', async () => {
    const { getByRole, findByText } = renderWithProviders(
      <SpinnerWheel participants={mockParticipants} />
    );
    
    // Start spin
    const spinButton = getByRole('button', { name: /spin/i });
    fireEvent.click(spinButton);
    
    // Button should be disabled during spin
    expect(spinButton).toBeDisabled();
    
    // Wait for animation to complete
    await waitFor(
      () => expect(spinButton).not.toBeDisabled(),
      { timeout: 5000 }
    );
    
    // Winner should be displayed
    expect(await findByText(/winner/i)).toBeInTheDocument();
  });
});
```

## Integration Testing Patterns

### Pattern 7: Context Integration

```typescript
// ✅ GOOD: Testing context state synchronization
describe('Competition Context Integration', () => {
  it('should sync competition data across components', async () => {
    const { getByTestId, rerender } = renderWithProviders(
      <>
        <CompetitionSelector />
        <CompetitionDisplay />
      </>
    );
    
    // Select a competition
    const selector = getByTestId('competition-selector');
    fireEvent.change(selector, { target: { value: 'comp-1' } });
    
    // Verify display updates
    await waitFor(() => {
      const display = getByTestId('competition-display');
      expect(display).toHaveTextContent('Competition 1');
    });
  });
});
```

### Pattern 8: Storage Sync Testing

```typescript
// ✅ GOOD: Testing storage synchronization
describe('Storage Synchronization', () => {
  it('should sync changes across components', async () => {
    const storageListener = vi.fn();
    chrome.storage.local.onChanged.addListener(storageListener);
    
    // Component 1 updates storage
    const { getByRole } = renderWithProviders(<SettingsPanel />);
    const toggle = getByRole('switch', { name: /sound/i });
    fireEvent.click(toggle);
    
    // Verify storage was updated
    await waitFor(() => {
      expect(storageListener).toHaveBeenCalledWith(
        expect.objectContaining({
          soundEnabled: { oldValue: true, newValue: false }
        }),
        'local'
      );
    });
    
    // Component 2 should reflect the change
    const { getByTestId } = renderWithProviders(<SoundIndicator />);
    expect(getByTestId('sound-status')).toHaveTextContent('Off');
  });
});
```

## E2E Testing Patterns

### Pattern 9: Extension Installation Testing

```typescript
// ✅ GOOD: Testing extension installation and initialization
test('should initialize extension correctly', async ({ page, context }) => {
  // Load extension
  const extensionId = await loadExtension(context);
  
  // Navigate to a test page
  await page.goto('https://example.com');
  
  // Verify extension is active
  const hasExtension = await page.evaluate((id) => {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(id, { type: 'ping' }, (response) => {
        resolve(response?.type === 'pong');
      });
    });
  }, extensionId);
  
  expect(hasExtension).toBe(true);
});
```

### Pattern 10: Cross-Browser Testing

```typescript
// ✅ GOOD: Testing across different browsers
['chromium', 'firefox', 'webkit'].forEach(browserName => {
  test.describe(`${browserName} compatibility`, () => {
    test('should work in standalone mode', async ({ page }) => {
      await page.goto('/src/dev/standalone.html');
      
      // Test core functionality
      await page.click('button:has-text("Load Mock Data")');
      await expect(page.locator('#sidepanel-root')).toBeVisible();
      
      // Browser-specific checks
      if (browserName === 'chromium') {
        // Chrome-specific features
        expect(await page.evaluate(() => window.chrome)).toBeDefined();
      }
    });
  });
});
```

## Performance Testing Patterns

### Pattern 11: Render Performance

```typescript
// ✅ GOOD: Testing render performance
describe('Performance', () => {
  it('should render large lists efficiently', async () => {
    const startTime = performance.now();
    
    const { container } = renderWithProviders(
      <ParticipantList participants={createMockParticipants(5000)} />
    );
    
    const renderTime = performance.now() - startTime;
    
    // Should render in under 100ms
    expect(renderTime).toBeLessThan(100);
    
    // Should use virtualization
    const visibleItems = container.querySelectorAll('[data-testid="participant-item"]');
    expect(visibleItems.length).toBeLessThan(100); // Only visible items rendered
  });
});
```

### Pattern 12: Animation Performance

```typescript
// ✅ GOOD: Testing animation frame rate
describe('Animation Performance', () => {
  it('should maintain 60fps during spin', async () => {
    const { getByRole } = renderWithProviders(<SpinnerWheel />);
    
    let frameCount = 0;
    let lastTime = performance.now();
    const frameRates: number[] = [];
    
    const measureFrameRate = () => {
      const currentTime = performance.now();
      const delta = currentTime - lastTime;
      if (delta > 0) {
        frameRates.push(1000 / delta);
      }
      lastTime = currentTime;
      frameCount++;
      
      if (frameCount < 180) { // 3 seconds at 60fps
        requestAnimationFrame(measureFrameRate);
      }
    };
    
    // Start spinning
    fireEvent.click(getByRole('button', { name: /spin/i }));
    
    // Measure frame rate
    requestAnimationFrame(measureFrameRate);
    
    // Wait for measurement to complete
    await waitFor(() => expect(frameCount).toBe(180), { timeout: 4000 });
    
    // Calculate average frame rate
    const avgFrameRate = frameRates.reduce((a, b) => a + b, 0) / frameRates.length;
    
    // Should maintain close to 60fps
    expect(avgFrameRate).toBeGreaterThan(55);
  });
});
```

## Accessibility Testing Patterns

### Pattern 13: Keyboard Navigation

```typescript
// ✅ GOOD: Testing keyboard accessibility
describe('Keyboard Navigation', () => {
  it('should be fully keyboard navigable', async () => {
    const { getByRole, getByLabelText } = renderWithProviders(<OptionsPage />);
    
    // Tab through elements
    const firstInput = getByLabelText('Competition Name');
    firstInput.focus();
    
    // Tab to next element
    fireEvent.keyDown(document.activeElement!, { key: 'Tab' });
    expect(document.activeElement).toBe(getByLabelText('Minimum Duration'));
    
    // Activate button with Enter
    const saveButton = getByRole('button', { name: /save/i });
    saveButton.focus();
    fireEvent.keyDown(saveButton, { key: 'Enter' });
    
    // Verify action was triggered
    expect(chromeStorageMock.set).toHaveBeenCalled();
  });
});
```

### Pattern 14: Screen Reader Testing

```typescript
// ✅ GOOD: Testing screen reader compatibility
describe('Screen Reader Support', () => {
  it('should have proper ARIA labels', () => {
    const { getByRole, getByLabelText } = renderWithProviders(<SpinnerUI />);
    
    // Check for proper roles
    expect(getByRole('main')).toBeInTheDocument();
    expect(getByRole('button', { name: /spin wheel/i })).toBeInTheDocument();
    
    // Check for aria-labels
    expect(getByLabelText('Participant list')).toBeInTheDocument();
    
    // Check for live regions
    const liveRegion = getByRole('status');
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
  });
});
```

## Error Handling Patterns

### Pattern 15: Error Boundary Testing

```typescript
// ✅ GOOD: Testing error boundaries
describe('Error Handling', () => {
  it('should catch and display errors gracefully', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };
    
    const { getByText } = renderWithProviders(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(getByText(/something went wrong/i)).toBeInTheDocument();
    expect(getByText(/test error/i)).toBeInTheDocument();
  });
});
```

### Pattern 16: Async Error Testing

```typescript
// ✅ GOOD: Testing async error handling
describe('Async Error Handling', () => {
  it('should handle storage errors', async () => {
    // Make storage fail
    chromeStorageMock.get.mockRejectedValueOnce(new Error('Storage error'));
    
    const { findByText } = renderWithProviders(<CompetitionLoader />);
    
    // Should show error message
    expect(await findByText(/failed to load competitions/i)).toBeInTheDocument();
    expect(await findByText(/storage error/i)).toBeInTheDocument();
  });
});
```

## Best Practices Summary

1. **Always reset mocks** between tests
2. **Use factories** for consistent test data
3. **Test user workflows**, not implementation details
4. **Mock at the boundaries** (Chrome APIs, network, etc.)
5. **Use semantic queries** (getByRole, getByLabelText)
6. **Test accessibility** alongside functionality
7. **Measure performance** for critical paths
8. **Handle async operations** properly
9. **Test error cases** as thoroughly as happy paths
10. **Keep tests focused** and independent