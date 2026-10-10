import { expect, test } from '@playwright/test'

test.describe('UI: data table', { tag: '@live-safe' }, () => {
  test('hydrates and sorts the explicit demo table', async ({ page }) => {
    await page.goto('/blog/2024-05-20_tech-demo/')

    const table = page.getByRole('table').filter({ has: page.getByRole('columnheader', { name: 'Name' }) }).last()
    const rows = table.getByRole('row').filter({ has: page.getByRole('cell') })

    await expect(rows.first()).toContainText('John Doe')
    await table.getByRole('columnheader', { name: 'Name' }).click()
    await expect(rows.first()).toContainText('Alice Williams')
    await table.getByRole('columnheader', { name: 'Name' }).click()
    await expect(rows.first()).toContainText('John Doe')
  })
})
