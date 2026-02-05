import { test, expect } from '@playwright/test'

test('Blog index has valid links and stable content', async ({ page }) => {
  await page.goto('/blog/')

  // 1. Ensure page is fully loaded
  // Waiting for networkidle ensures hydration is complete and all lists are rendered.
  await page.waitForLoadState('networkidle')

  // 2. Verify "Canary" Post exists (Confidence Check)
  // We look for the "Feature reference & demo" post to ensure specific content is present.
  // This catches cases where the build succeeds but content is missing/empty.
  const canaryPost = page.getByRole('link', { name: 'Feature reference & demo' }).first()
  await expect(canaryPost).toBeVisible()

  const canaryHref = await canaryPost.getAttribute('href')
  expect(canaryHref).toContain('/blog/2024-05-20_tech-demo/')

  // 3. Get all blog post links within the main content area
  // We exclude nav/footer links by scoping to 'main'
  const blogLinks = page.locator('main a[href^="/blog/"]')
  const count = await blogLinks.count()

  // 4. Ensure we have a reasonable number of posts
  // We expect at least a few posts to be present.
  expect(count).toBeGreaterThan(1)

  // 5. Verify Links are valid
  // We collect all hrefs first to avoid DOM instability during iteration
  const hrefs = await blogLinks.evaluateAll(links => links.map(l => l.getAttribute('href')))

  // Remove duplicates to save time
  const uniqueHrefs = [...new Set(hrefs)]

  for (const href of uniqueHrefs) {
    expect(href).not.toBeNull()
    if (href) {
      // Use request.get for speed instead of full page navigation
      const response = await page.request.get(href)
      expect(response.ok(), `Link ${href} returned ${response.status()}`).toBeTruthy()
    }
  }
})
