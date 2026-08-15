import { expect, test } from '@playwright/test'

test.describe('UI: changelog', { tag: '@live-safe' }, () => {
  test('changelog page loads with title, header, and filter buttons', async ({ page }) => {
    await page.goto('/changelog/')
    await expect(page).toHaveTitle('Changelog | All Bugs Are Fixed')
    await expect(page.getByRole('heading', { level: 1, name: 'Changelog' })).toBeVisible()
    await expect(page.getByRole('button', { name: /^All/ })).toBeVisible()
  })
})
