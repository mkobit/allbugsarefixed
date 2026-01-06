import { test, expect } from '@playwright/test';

test.describe('Smoke Test', () => {
  test('homepage loads with correct title and styling', async ({ page }) => {
    // 1. Check for console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');

    // 2. Verify Title
    await expect(page).toHaveTitle(/Welcome to All Bugs Are Fixed/);

    // 3. Verify CSS is loaded (Brand primary color)
    // The top bar is <div class="h-1 w-full bg-brand-primary"></div>
    const headerLine = page.locator('.bg-brand-primary').first();
    await expect(headerLine).toBeVisible();

    // Check computed style
    const bgColor = await headerLine.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // Validating against the violet brand color: hsl(265, 83%, 65%) -> rgb(153, 92, 240)
    // We allow a small tolerance or just check it's not transparent/black/white default
    // Using a regex to match the rgb pattern
    expect(bgColor).toMatch(/^rgb\(15\d, \d+, \d+\)$/);

    // 4. Verify no console errors occurred
    expect(consoleErrors).toEqual([]);
  });
});
