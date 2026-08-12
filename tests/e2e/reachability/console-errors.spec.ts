import { test, expect } from '@playwright/test'

test.describe('Reachability: console errors', { tag: '@live-safe' }, () => {
  test('homepage loads without console errors', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    await page.goto('/')
    expect(consoleErrors).toEqual([])
  })
})
