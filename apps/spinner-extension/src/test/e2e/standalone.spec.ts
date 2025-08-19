import { test, expect, Page } from '@playwright/test';

/**
 * E2E Tests for Standalone Development Mode
 * 
 * These tests verify that the extension components work correctly
 * when running in standalone mode without Chrome.
 */

test.describe('Standalone Dev Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/dev/standalone.html');
    await page.waitForLoadState('networkidle');
  });

  test('should load the standalone environment', async ({ page }) => {
    // Check that the page loaded
    await expect(page).toHaveTitle('DrawDay Spinner - Standalone Dev Mode');
    
    // Check that main elements are present
    await expect(page.locator('h1')).toContainText('DrawDay Spinner - Standalone Dev Mode');
    await expect(page.locator('#sidepanel-root')).toBeVisible();
    await expect(page.locator('#options-root')).toBeVisible();
  });

  test('should have working dev controls', async ({ page }) => {
    // Test Clear Storage button
    await page.click('button:has-text("Clear Storage")');
    
    // Test Load Mock Data button
    await page.click('button:has-text("Load Mock Data")');
    
    // Verify storage was updated (check console or storage viewer)
    await page.click('button:has-text("Toggle View")');
    await expect(page.locator('#debug-panel')).toBeVisible();
    
    const storageContent = await page.locator('#storage-content').textContent();
    expect(storageContent).toContain('competitions');
    expect(storageContent).toContain('Dev Test Competition');
  });

  test('should show Chrome API status', async ({ page }) => {
    // Toggle to debug view
    await page.click('button:has-text("Toggle View")');
    
    // Check API status indicators
    await expect(page.locator('.chrome-api-status')).toBeVisible();
    await expect(page.locator('.status-item:has-text("chrome.storage")')).toBeVisible();
    await expect(page.locator('.status-badge.status-mocked')).toHaveCount(4);
  });

  test('should update storage viewer on changes', async ({ page }) => {
    // Toggle to debug view
    await page.click('button:has-text("Toggle View")');
    
    // Initial state
    const initialContent = await page.locator('#storage-content').textContent();
    
    // Load mock data
    await page.click('button:has-text("Load Mock Data")');
    
    // Wait for storage to update
    await page.waitForTimeout(500);
    
    // Refresh storage view
    await page.click('button:has-text("Refresh Storage View")');
    
    // Check that content changed
    const updatedContent = await page.locator('#storage-content').textContent();
    expect(updatedContent).not.toEqual(initialContent);
    expect(updatedContent).toContain('Dev Test Competition');
  });
});

test.describe('Side Panel Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/dev/standalone.html');
    await page.waitForLoadState('networkidle');
    
    // Load mock data for testing
    await page.click('button:has-text("Load Mock Data")');
    await page.waitForTimeout(500);
  });

  test('should display competition data', async ({ page }) => {
    // Check if competition is loaded in side panel
    const sidePanel = page.locator('#sidepanel-root');
    
    // Wait for React to render
    await page.waitForTimeout(1000);
    
    // Check for competition elements (adjust selectors based on actual implementation)
    // These are examples - update based on your actual component structure
    await expect(sidePanel).toBeVisible();
  });

  test('should handle spin action', async ({ page }) => {
    const sidePanel = page.locator('#sidepanel-root');
    
    // Look for spin button (adjust selector as needed)
    const spinButton = sidePanel.locator('button:has-text("Spin")');
    
    if (await spinButton.isVisible()) {
      await spinButton.click();
      
      // Verify spinner is animating (check for class or style changes)
      // This is an example - adjust based on actual implementation
      await expect(sidePanel.locator('.spinning')).toBeVisible();
    }
  });
});

test.describe('Options Page Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/dev/standalone.html');
    await page.waitForLoadState('networkidle');
  });

  test('should display options page', async ({ page }) => {
    const optionsRoot = page.locator('#options-root');
    await expect(optionsRoot).toBeVisible();
    
    // Wait for React to render
    await page.waitForTimeout(1000);
    
    // Check for options elements (adjust based on actual implementation)
    // These are examples - update based on your actual component structure
  });

  test('should handle settings changes', async ({ page }) => {
    const optionsRoot = page.locator('#options-root');
    
    // Example: Look for settings controls
    // Adjust these selectors based on your actual implementation
    const settingsControl = optionsRoot.locator('input[type="range"]').first();
    
    if (await settingsControl.isVisible()) {
      const initialValue = await settingsControl.inputValue();
      await settingsControl.fill('5');
      
      // Verify value changed
      const newValue = await settingsControl.inputValue();
      expect(newValue).not.toEqual(initialValue);
    }
  });
});

test.describe('Chrome API Mocking', () => {
  test('should have mocked Chrome APIs available', async ({ page }) => {
    // Check that Chrome APIs are available in the page context
    const hasChrome = await page.evaluate(() => {
      return typeof window.chrome !== 'undefined';
    });
    expect(hasChrome).toBe(true);

    const hasStorage = await page.evaluate(() => {
      return typeof window.chrome?.storage?.local !== 'undefined';
    });
    expect(hasStorage).toBe(true);

    const hasRuntime = await page.evaluate(() => {
      return typeof window.chrome?.runtime !== 'undefined';
    });
    expect(hasRuntime).toBe(true);

    const hasTabs = await page.evaluate(() => {
      return typeof window.chrome?.tabs !== 'undefined';
    });
    expect(hasTabs).toBe(true);
  });

  test('should handle storage operations', async ({ page }) => {
    await page.goto('/src/dev/standalone.html');
    
    // Test storage.set
    const setResult = await page.evaluate(async () => {
      await window.chrome.storage.local.set({ testKey: 'testValue' });
      return true;
    });
    expect(setResult).toBe(true);

    // Test storage.get
    const getValue = await page.evaluate(async () => {
      const result = await window.chrome.storage.local.get('testKey');
      return result.testKey;
    });
    expect(getValue).toBe('testValue');

    // Test storage.remove
    const removeResult = await page.evaluate(async () => {
      await window.chrome.storage.local.remove('testKey');
      const result = await window.chrome.storage.local.get('testKey');
      return result.testKey === undefined;
    });
    expect(removeResult).toBe(true);
  });
});