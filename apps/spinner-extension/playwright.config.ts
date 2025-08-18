import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * Playwright Configuration for E2E Testing
 * 
 * Configured for testing both the extension in Chrome and
 * the standalone development mode.
 */
export default defineConfig({
  testDir: './src/test/e2e',
  
  // Run tests in files in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter to use
  reporter: [
    ['html'],
    ['line'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  
  // Shared settings for all projects
  use: {
    // Base URL for standalone mode
    baseURL: 'http://localhost:5173',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'retain-on-failure',
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium-standalone',
      use: { 
        ...devices['Desktop Chrome'],
        // Test the standalone dev mode
        baseURL: 'http://localhost:5173',
      },
    },

    {
      name: 'chromium-extension',
      use: {
        ...devices['Desktop Chrome'],
        // Custom setup for extension testing
        launchOptions: {
          args: [
            `--disable-extensions-except=${path.join(__dirname, 'DrawDaySpinner')}`,
            `--load-extension=${path.join(__dirname, 'DrawDaySpinner')}`,
            '--no-sandbox',
          ],
        },
      },
    },

    // Optional: Test in Firefox for web compatibility
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        baseURL: 'http://localhost:5173',
      },
    },

    // Optional: Test responsive design
    {
      name: 'mobile',
      use: { 
        ...devices['Pixel 5'],
        baseURL: 'http://localhost:5173',
      },
    },
  ],

  // Run local dev server before starting tests
  webServer: {
    command: 'pnpm dev:standalone',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});