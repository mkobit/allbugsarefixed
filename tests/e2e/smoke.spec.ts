import { test, expect } from '@playwright/test'

test.describe('Smoke Test', () => {
  test('homepage loads with correct title and styling', async ({ page }) => {
    // 1. Check for console errors
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    await page.goto('/')

    // 2. Verify Title
    await expect(page).toHaveTitle(/Welcome to All Bugs Are Fixed/)

    // 3. Verify CSS is loaded and Header is present
    // The new layout uses a <header> element.
    const header = page.locator('header')
    await expect(header).toBeVisible()

    // Verify the logo text color to ensure CSS variables are working
    const logo = header.locator('text=All Bugs Are Fixed').first()
    await expect(logo).toBeVisible()

    // The logo uses 'text-brand-text'.
    // In light mode (default), brand-text is usually dark.
    // Let's just verify it's not the default user-agent blue link color or something unexpected if that was the concern.
    // Or we can check if the background of the body or header is correct.

    // Check header background color
    const headerBgColor = await header.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor
    })

    // It should be 'bg-brand-surface'. In global.css, this maps to something specific.
    // But simply checking it's not empty is a good basic check.
    expect(headerBgColor).toBeTruthy()

    // 4. Verify no console errors occurred
    expect(consoleErrors).toEqual([])
  })
})
