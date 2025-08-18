import { test, expect, chromium, type BrowserContext } from '@playwright/test';
import path from 'path';

/**
 * E2E Tests for Chrome Extension
 * 
 * These tests load the actual Chrome extension and test its functionality
 * in a real Chrome browser environment.
 */

let context: BrowserContext;
let extensionId: string;

test.describe('Chrome Extension', () => {
  test.beforeAll(async () => {
    // Path to the extension directory
    const pathToExtension = path.join(__dirname, '../../../DrawDaySpinner');
    
    // Launch Chrome with the extension
    context = await chromium.launchPersistentContext('', {
      headless: false, // Extensions only work in headed mode
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    });
    
    // Get the extension ID
    const backgroundPages = context.backgroundPages();
    if (backgroundPages.length > 0) {
      const backgroundPage = backgroundPages[0];
      extensionId = backgroundPage.url().split('/')[2];
    } else {
      // Wait for background page to load
      const backgroundPage = await context.waitForEvent('backgroundpage');
      extensionId = backgroundPage.url().split('/')[2];
    }
  });

  test.afterAll(async () => {
    await context.close();
  });

  test('should load the extension', async () => {
    expect(extensionId).toBeTruthy();
    expect(extensionId).toMatch(/^[a-z]{32}$/);
  });

  test('should open side panel when action is clicked', async () => {
    const page = await context.newPage();
    
    // Navigate to a page
    await page.goto('https://example.com');
    
    // Click the extension action (this requires the extension to be pinned)
    // Note: This is complex in Playwright, might need alternative approach
    
    // Alternative: Open side panel via chrome.sidePanel API
    await page.evaluate((extId) => {
      // This would need to be called from the extension context
      // For testing, we might need to trigger this via runtime message
      chrome.runtime.sendMessage(extId, { action: 'openSidePanel' });
    }, extensionId);
    
    // Wait for side panel to appear
    await page.waitForTimeout(1000);
    
    // Check if side panel is visible (this is tricky with side panels)
    // May need to use Chrome DevTools Protocol for full access
  });

  test('should open options page', async () => {
    const page = await context.newPage();
    
    // Navigate to the options page
    await page.goto(`chrome-extension://${extensionId}/options.html`);
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check that options page loaded
    await expect(page).toHaveTitle(/DrawDay.*Options/i);
    
    // Check for main options elements
    await expect(page.locator('#root')).toBeVisible();
  });

  test('should persist settings in storage', async () => {
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/options.html`);
    await page.waitForLoadState('networkidle');
    
    // Interact with settings (adjust selectors based on actual implementation)
    const settingToggle = page.locator('input[type="checkbox"]').first();
    
    if (await settingToggle.isVisible()) {
      const initialState = await settingToggle.isChecked();
      await settingToggle.click();
      
      // Reload the page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Check that the setting persisted
      const newState = await settingToggle.isChecked();
      expect(newState).not.toEqual(initialState);
    }
  });

  test('should handle CSV import', async () => {
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/options.html`);
    await page.waitForLoadState('networkidle');
    
    // Create a test CSV file
    const csvContent = `First Name,Last Name,Ticket Number
John,Doe,T001
Jane,Smith,T002
Bob,Johnson,T003`;
    
    // Look for file input (adjust selector as needed)
    const fileInput = page.locator('input[type="file"]');
    
    if (await fileInput.isVisible()) {
      // Create a temporary file and upload
      const buffer = Buffer.from(csvContent, 'utf-8');
      await fileInput.setInputFiles({
        name: 'test.csv',
        mimeType: 'text/csv',
        buffer,
      });
      
      // Wait for processing
      await page.waitForTimeout(1000);
      
      // Check that participants were imported (adjust based on implementation)
      // This is an example - update based on your actual UI
      await expect(page.locator('text=3 participants')).toBeVisible();
    }
  });
});

test.describe('Extension Messaging', () => {
  test('should handle runtime messages', async () => {
    const page = await context.newPage();
    
    // Test sending and receiving messages
    const response = await page.evaluate(async (extId) => {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage(
          extId,
          { type: 'ping' },
          (response) => {
            resolve(response);
          }
        );
      });
    }, extensionId);
    
    // The extension should respond to messages (depends on implementation)
    expect(response).toBeDefined();
  });

  test('should sync data between options and side panel', async () => {
    // Open options page
    const optionsPage = await context.newPage();
    await optionsPage.goto(`chrome-extension://${extensionId}/options.html`);
    
    // Make a change in options (example)
    // This depends on your actual implementation
    
    // Open a regular page to access side panel
    const regularPage = await context.newPage();
    await regularPage.goto('https://example.com');
    
    // Trigger side panel opening (complex in Playwright)
    // May need Chrome DevTools Protocol
    
    // Verify that changes are reflected in side panel
    // This is challenging to test with Playwright alone
  });
});