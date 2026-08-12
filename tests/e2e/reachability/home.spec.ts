import { test, expect } from '@playwright/test'

test.describe('Reachability: home', { tag: '@live-safe' }, () => {
  test('homepage loads with correct title', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle('Home | All Bugs Are Fixed')
  })
})
