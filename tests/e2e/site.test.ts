import { file, Glob, serve, sleep, WebView } from 'bun'
import { afterAll, beforeAll, expect, test } from 'bun:test'
import { fileURLToPath } from 'node:url'

const deployedUrl = process.env.E2E_BASE_URL
let previewServer: ReturnType<typeof serve> | undefined
let baseUrl: URL

beforeAll(async () => {
  if (deployedUrl) {
    baseUrl = new URL(deployedUrl.endsWith('/') ? deployedUrl : `${deployedUrl}/`)
    return
  }

  const dist = new URL('../../dist/', import.meta.url)
  if (!await file(new URL('index.html', dist)).exists()) {
    throw new Error('Build the site with bun run build before running the local end-to-end tests.')
  }

  const routes = new Map<string, URL>()
  for (const path of new Glob('**/*').scanSync(fileURLToPath(dist))) {
    const asset = new URL(path, dist)
    routes.set(`/${path}`, asset)
    if (path === 'index.html' || path.endsWith('/index.html')) {
      routes.set(`/${path.slice(0, -'index.html'.length)}`, asset)
    }
  }

  previewServer = serve({
    fetch(request) {
      const path = decodeURIComponent(new URL(request.url).pathname)
      const asset = routes.get(path) ?? routes.get(`${path}/`)
      return asset ? new Response(file(asset)) : new Response('Not found', { status: 404 })
    },
    hostname: '127.0.0.1',
    port: 0,
  })
  baseUrl = previewServer.url
})

afterAll(async () => {
  await previewServer?.stop(true)
})

function siteUrl(path: string): URL {
  return new URL(path.replace(/^\//, ''), baseUrl)
}

function newView(consoleCapture?: WebView.ConsoleCapture): WebView {
  return new WebView({
    backend: 'chrome',
    console: consoleCapture,
    height: 720,
    width: 1280,
  })
}

async function waitFor(check: () => Promise<boolean>, description: string): Promise<void> {
  const deadline = performance.now() + 4_000
  while (performance.now() < deadline) {
    if (await check()) return
    await sleep(50)
  }

  throw new Error(`Timed out waiting for ${description}`)
}

test('Homepage loads with the correct title @live-safe', async () => {
  using view = newView()
  await view.navigate(siteUrl('/').href)
  expect(await view.evaluate('document.title')).toBe('Home | All Bugs Are Fixed')
})

test('Homepage loads without console errors @live-safe', async () => {
  const errors: unknown[][] = []
  using view = newView((type, ...args) => {
    if (type === 'error') errors.push(args)
  })
  await view.navigate(siteUrl('/').href)
  expect(errors).toEqual([])
})

test('Homepage shows the header and main content with brand styling @live-safe', async () => {
  using view = newView()
  await view.navigate(siteUrl('/').href)
  expect(await view.evaluate('document.querySelector("header")?.checkVisibility()')).toBe(true)
  expect(await view.evaluate('document.querySelector("main")?.checkVisibility()')).toBe(true)
  expect(await view.evaluate('document.querySelector("header")?.classList.contains("bg-brand-surface")')).toBe(true)
})

test('Robots rules block AI crawlers and allow other crawlers @live-safe', async () => {
  const response = await fetch(siteUrl('/robots.txt'))
  expect(response.status).toBe(200)

  const rules = await response.text()
  for (const crawler of ['GPTBot', 'ClaudeBot', 'Google-Extended', 'CCBot']) {
    expect(rules).toContain(`User-agent: ${crawler}`)
  }
  expect(rules).toContain('Disallow: /')
  expect(rules).toContain('User-agent: *')
  expect(rules).toContain('Allow: /')
})

test('Changelog shows its title, heading, and filter @live-safe', async () => {
  using view = newView()
  await view.navigate(siteUrl('/changelog/').href)
  expect(await view.evaluate('document.title')).toBe('Changelog | All Bugs Are Fixed')
  expect(await view.evaluate(`[...document.querySelectorAll('h1')].some(
    heading => heading.textContent.trim() === 'Changelog' && heading.checkVisibility()
  )`)).toBe(true)
  expect(await view.evaluate(`[...document.querySelectorAll('button')].some(
    button => button.textContent.trim().startsWith('All') && button.checkVisibility()
  )`)).toBe(true)
})

test('The demo table sorts by name on click @live-safe', async () => {
  using view = newView()
  await view.navigate(siteUrl('/blog/2024-05-20_tech-demo/').href)

  const demoTable = `[...document.querySelectorAll('table')].findLast(
    table => [...table.querySelectorAll('th')].some(header => header.textContent.trim() === 'Name')
  )`
  const firstName = () => view.evaluate<string>(
    `(${demoTable})?.querySelector('tbody tr:first-child td:nth-child(2)')?.textContent.trim()`,
  )
  const clickName = () => view.evaluate(`(${demoTable})?.querySelector('th:nth-child(2) div')?.click()`)

  expect(await firstName()).toBe('John Doe')
  await waitFor(
    () => view.evaluate<boolean>(`(${demoTable})?.closest('astro-island')?.hasAttribute('ssr') === false`),
    'the demo table to hydrate',
  )
  await clickName()
  await waitFor(async () => await firstName() === 'Alice Williams', 'Alice Williams to sort first')
  await clickName()
  await waitFor(async () => await firstName() === 'John Doe', 'John Doe to sort first again')
}, 15_000)

test('Blog index links to valid posts @local-only', async () => {
  using view = newView()
  await view.navigate(siteUrl('/blog/').href)
  const links = await view.evaluate<string[]>(`[...document.querySelectorAll('a[href^="/blog/"]')]
    .map(link => link.getAttribute('href'))`)
  expect(links.length).toBeGreaterThan(0)

  for (const link of new Set(links)) {
    expect(link).not.toContain('undefined')
    const response = await fetch(siteUrl(link))
    expect(response.ok).toBe(true)
  }
})

test('Scroll progress appears and returns the reader to the top @local-only', async () => {
  using view = newView()
  await view.navigate(siteUrl('/').href)

  const firstPost = 'main a[href^="/blog/"]'
  await view.click(firstPost)
  await waitFor(() => view.evaluate<boolean>(
    'location.pathname.startsWith("/blog/") && location.pathname.length > 6',
  ), 'a blog post to open')

  const button = 'button[aria-label="Scroll to top"]'
  const opacity = () => view.evaluate<string | null>(`(() => {
    const element = document.querySelector(${JSON.stringify(button)})
    return element ? getComputedStyle(element).opacity : null
  })()`)
  await waitFor(async () => await opacity() === '0', 'the scroll button to start hidden')
  await view.evaluate('window.scrollTo({ behavior: "instant", top: 300 })')
  await waitFor(async () => await opacity() === '1', 'the scroll button to appear')
  await view.click(button, { timeout: 4_000 })
  await waitFor(() => view.evaluate<boolean>('window.scrollY <= 1'), 'the page to scroll to the top')
}, 15_000)
