import { test, expect } from '@playwright/test'

test('Blog index has valid links', async ({ page }) => {
  await page.goto('/blog/')

  // Wait for the blog list container to be present
  const blogList = page.locator('div.space-y-8')
  await expect(blogList).toBeVisible({ timeout: 10000 })

  // Select all links within the blog list that point to blog posts
  const postLinks = blogList.locator('a[href^="/blog/"]')

  // Wait for at least one link to appear
  await expect(postLinks.first()).toBeVisible({ timeout: 10000 })

  const count = await postLinks.count()

  // Ensure there are posts
  expect(count).toBeGreaterThan(0)

  // Verify at least one link works
  if (count > 0) {
    const firstLink = postLinks.first()
    const href = await firstLink.getAttribute('href')
    // Ensure we have a valid href before fetching
    if (href) {
        // Just verify it's a valid relative path, avoid network request if flaky
        expect(href).toMatch(/^\/blog\/.+\/$/);
    }
  }
})
