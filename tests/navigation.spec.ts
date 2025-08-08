import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate to the home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Welcome to All Bugs Are Fixed/);
  });

  test('should navigate to the blog page', async ({ page }) => {
    await page.goto('/blog/');
    await expect(page).toHaveTitle(/Blog Posts/);
  });

  test('should navigate to the about page', async ({ page }) => {
    await page.goto('/about/');
    await expect(page).toHaveTitle(/About/);
  });

  test('should navigate to the first blog post', async ({ page }) => {
    await page.goto('/blog/');
    await page.click('a:has-text("Second Post: Using MDX Components")');
    await expect(page).toHaveTitle(/Second Post: Using MDX Components/);
  });
});
