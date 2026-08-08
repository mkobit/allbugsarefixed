import { defineConfig, devices } from '@playwright/test'

// A random port (instead of Astro's 4321 default) avoids colliding with a
// stale/leftover server -- e.g. a `bun start` dev server left running from a
// previous session -- which would otherwise be silently reused as if it were
// this run's freshly built preview server.
//
// This module is re-imported in each Playwright worker process, so the port
// must be computed once and stored in an env var (inherited by worker
// processes) rather than recomputed per-import -- otherwise each worker
// disagrees with the others on which port the one real server is on.
process.env.PLAYWRIGHT_PREVIEW_PORT ??= String(10000 + Math.floor(Math.random() * 45000))
const port = process.env.PLAYWRIGHT_PREVIEW_PORT
const baseURL = `http://localhost:${port}`

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
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: {
    command: `bun run preview -- --port ${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    url: baseURL,
  },
  workers: process.env.CI ? 1 : undefined,
})
