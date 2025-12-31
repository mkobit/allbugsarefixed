import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  reporter: 'html',
  retries: process.env.CI ? 2 : 0,
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm preview',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    url: 'http://localhost:4321',
  },
  workers: process.env.CI ? 1 : undefined,
});
