import { test, expect } from '@playwright/test';

test('Blog index has valid links', async ({ page }) => {
  await page.goto('/blog/');

  // Get all blog post links
  const links = page.locator('a[href^="/blog/"]');
  const count = await links.count();

  // Ensure there are posts
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const link = links.nth(i);
    const href = await link.getAttribute('href');

    // Check that href is not undefined or null
    expect(href).not.toBeNull();
    expect(href).not.toContain('undefined');

    // Visit the link to ensure it's valid (200 OK)
    // We can fetch it to avoid full page load for speed, or just click it.
    // Let's request it.
    if (href) {
        const response = await page.request.get(href);
        expect(response.ok()).toBeTruthy();
    }
  }
});
