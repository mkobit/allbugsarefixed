import { test, expect } from '@playwright/test'

test('Blog index has valid links', async ({ page }) => {
  await page.goto('/blog/')

  // Wait for content to load
  await page.waitForLoadState('networkidle');

  // Get all blog post links in the main content area
  // Excluding the nav link to /blog/ itself
  const links = page.locator('main a[href^="/blog/"]:not([href="/blog/"])')
  const count = await links.count()

  // Ensure there are posts
  expect(count).toBeGreaterThan(0)

  // Verify at least one link works
  if (count > 0) {
    const firstLink = links.first();
    const href = await firstLink.getAttribute('href');
    if (href) {
        const response = await page.request.get(href);
        expect(response.ok()).toBeTruthy();
    }
  }
})
