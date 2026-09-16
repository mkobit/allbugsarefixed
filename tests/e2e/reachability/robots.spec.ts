import { test, expect } from '@playwright/test'

test.describe('Reachability: robots.txt', { tag: '@live-safe' }, () => {
  test('robots.txt returns 200 and blocks AI crawlers while allowing default user-agents', async ({ request }) => {
    const response = await request.get('/robots.txt')
    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)

    const text = await response.text()

    // Ensure key AI crawlers are explicitly disallowed
    expect(text).toContain('User-agent: GPTBot')
    expect(text).toContain('User-agent: ClaudeBot')
    expect(text).toContain('User-agent: Google-Extended')
    expect(text).toContain('User-agent: CCBot')
    expect(text).toContain('Disallow: /')

    // Ensure default rule is present
    expect(text).toContain('User-agent: *')
    expect(text).toContain('Allow: /')
  })
})
