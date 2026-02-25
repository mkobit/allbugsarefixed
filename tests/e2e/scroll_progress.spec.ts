import { test, expect } from '@playwright/test'

test('ScrollProgress meter appears on blog posts', async ({ page }) => {
  // Navigate to a blog post (assuming there's at least one)
  // We can use the index page to find a link to a blog post
  await page.goto('/')

  // Find a blog post link and click it
  // Exclude the main nav link by looking inside 'main' or specifically excluding '/blog/' exact match
  const firstPostLink = page.locator('main a[href^="/blog/"]').first()

  await expect(firstPostLink).toBeVisible()
  await firstPostLink.click()

  // Wait for navigation
  await page.waitForURL(url => url.pathname.startsWith('/blog/') && url.pathname.length > 6)

  // Locate the scroll progress button
  const scrollProgress = page.getByRole('button', { name: 'Scroll to top' })

  // Initially it should be hidden (opacity 0 and pointer-events-none)
  await expect(scrollProgress).toHaveClass(/opacity-0/)
  await expect(scrollProgress).toHaveCSS('pointer-events', 'none')

  // Scroll down
  await page.evaluate(() => window.scrollTo(0, 500))

  // Wait for transition
  await page.waitForTimeout(500) // wait for transition

  // Now it should be visible
  await expect(scrollProgress).toHaveClass(/opacity-100/)
  await expect(scrollProgress).toHaveCSS('pointer-events', 'auto')

  // Click it
  await scrollProgress.click()

  // Wait for scroll to finish (smooth scroll takes time)
  await page.waitForTimeout(1000)

  // Verify scroll position is near top
  const scrollTop = await page.evaluate(() => window.scrollY)
  expect(scrollTop).toBeLessThan(10)
})
