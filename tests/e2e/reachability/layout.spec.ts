import { test, expect } from '@playwright/test'

test.describe('Reachability: layout', { tag: '@live-safe' }, () => {
  test('homepage renders header and main with brand styling', async ({ page }) => {
    await page.goto('/')

    const header = page.locator('header').first()
    const main = page.locator('main').first()

    await expect(header).toBeVisible()
    await expect(main).toBeVisible()

    // Brand surface color should be applied
    await expect(header).toHaveClass(/bg-brand-surface/)
  })
})
