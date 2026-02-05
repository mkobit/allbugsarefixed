import { test, expect } from '@playwright/test'

test.describe('Smoke Test', () => {
  test('homepage loads with correct title and semantic structure', async ({ page }) => {
    // 1. Check for console errors
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    await page.goto('/')

    // 2. Verify Title
    await expect(page).toHaveTitle('Home | All Bugs Are Fixed')

    // 3. Verify Semantic Elements
    const header = page.locator('header')
    await expect(header).toBeVisible()

    const main = page.locator('main')
    await expect(main).toBeVisible()

    const footer = page.locator('footer')
    await expect(footer).toBeVisible()

    // 4. Verify Critical Content
    // The logo text is "All Bugs Are Fixed" inside a link
    const logo = header.getByRole('link', { name: 'All Bugs Are Fixed' })
    await expect(logo).toBeVisible()

    // 5. Verify no console errors occurred
    expect(consoleErrors).toEqual([])
  })
})
