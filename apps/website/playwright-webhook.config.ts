/**
 * Playwright Configuration for Webhook Testing
 * Specialized configuration for webhook integration tests
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './__tests__/webhooks',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'test-results/webhook-reports' }],
    ['json', { outputFile: 'test-results/webhook-results.json' }],
    ['line'],
  ],
  use: {
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'webhook-integration',
      testMatch: '**/*webhook*.test.ts',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000/api/products',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
