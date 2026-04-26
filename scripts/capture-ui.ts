/* eslint-disable functional/no-let, functional/no-loop-statements, functional/immutable-data, @typescript-eslint/no-explicit-any, sort-keys, no-undef */
import fs from 'fs'
import path from 'path'
import { parseArgs } from 'util'

import { chromium, devices } from 'playwright'

let values: any = {}
try {
  const parsed = parseArgs({
    allowPositionals: true,
    args: process.argv.slice(2),
    options: {
      device: { default: 'desktop', type: 'string' }, // 'mobile', 'desktop', 'both'
      help: { short: 'h', type: 'boolean' },
      selector: { type: 'string' },
      url: { type: 'string' },
    },
  })
  values = parsed.values
} catch (e: any) {
  console.error('Error parsing arguments:', e.message)
  process.exit(1)
}

if (values.help) {
  console.log(`Usage: bun run scripts/capture-ui.ts [options]

Options:
  --url <url>         The URL path to capture (e.g., /test-callout/)
  --selector <string> The CSS selector to capture (default: 'body')
  --device <string>   The device to capture: 'desktop', 'mobile', or 'both' (default: 'desktop')
  --help, -h          Show this help message`)
  process.exit(0)
}

if (!values.url) {
  console.error('Error: --url argument is required (e.g., --url /test-callout/)')
  process.exit(1)
}

const baseUrl = 'http://localhost:4321'
const fullUrl = values.url.startsWith('http') ? values.url : `${baseUrl}${values.url.startsWith('/') ? '' : '/'}${values.url}`

const SCREENSHOT_DIR = path.join(process.cwd(), 'screenshots')
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
}

type DeviceConfig = {
  name: string
  viewport: { height: number, width: number }
  userAgent?: string
}

const captureOptions: Record<string, DeviceConfig> = {
  desktop: {
    name: 'desktop',
    viewport: { height: 720, width: 1280 },
  },
  mobile: {
    name: 'mobile',
    userAgent: devices['iPhone 12'].userAgent,
    viewport: { height: 844, width: 390 },
  },
}

const devicesToTest = values.device === 'both'
  ? [captureOptions.desktop, captureOptions.mobile]
  : [captureOptions[values.device as keyof typeof captureOptions] || captureOptions.desktop]

async function capture() {
  const browser = await chromium.launch()

  for (const deviceConfig of devicesToTest) {
    console.log(`\n--- Capturing for ${deviceConfig.name} ---`)
    const context = await browser.newContext({
      deviceScaleFactor: 2,
      userAgent: deviceConfig.userAgent,
      viewport: deviceConfig.viewport,
    })

    const page = await context.newPage()

    try {
      console.log(`Navigating to ${fullUrl}...`)
      await page.goto(fullUrl, { waitUntil: 'networkidle' })

      const safeUrl = values.url.replace(/[^a-z0-9]/gi, '_').toLowerCase()
      const filename = `capture_${deviceConfig.name}${safeUrl}.png`
      const filepath = path.join(SCREENSHOT_DIR, filename)

      let target = page.locator('body')
      if (values.selector) {
        target = page.locator(values.selector).first()
        const count = await page.locator(values.selector).count()
        if (count === 0) {
          console.error(`Warning: Selector "${values.selector}" not found on page. Capturing full page instead.`)
          target = page.locator('body')
        }
      }

      await target.screenshot({ path: filepath })

      // Extract layout information
      const layoutInfo = await target.evaluate((node) => {
        function serializeNode(el: Element, depth = 0): string {
          if (el.nodeType !== Node.ELEMENT_NODE) return ''

          const indent = '  '.repeat(depth)
          const tagName = el.tagName.toLowerCase()
          const id = el.id ? `#${el.id}` : ''
          const classes = el.className && typeof el.className === 'string' ? `.${el.className.split(' ').join('.')}` : ''

          let result = `${indent}<${tagName}${id}${classes}>\n`

          // Get bounding box for the element
          const rect = el.getBoundingClientRect()
          if (rect.width > 0 && rect.height > 0) {
            result += `${indent}  [Box: ${Math.round(rect.width)}x${Math.round(rect.height)} at (${Math.round(rect.x)}, ${Math.round(rect.y)})]\n`
          }

          // Get direct text content
          let hasTextContent = false
          const textParts: string[] = []
          for (const child of Array.from(el.childNodes)) {
            if (child.nodeType === Node.TEXT_NODE) {
              const text = child.textContent?.trim()
              if (text) {
                hasTextContent = true
                textParts.push(text)
              }
            }
          }

          if (hasTextContent) {
            result += `${indent}  [Text: "${textParts.join(' ').substring(0, 50)}${textParts.join(' ').length > 50 ? '...' : ''}"]\n`
          }

          // Recurse to children
          for (const child of Array.from(el.children)) {
            result += serializeNode(child, depth + 1)
          }

          return result
        }

        return serializeNode(node)
      })

      console.log(`\nLayout snapshot for ${deviceConfig.name}:`)
      console.log(layoutInfo.split('\n').slice(0, 50).join('\n') + (layoutInfo.split('\n').length > 50 ? '\n  ... (truncated)' : ''))

      console.log(`\nScreenshot saved:`)
      console.log(`![${deviceConfig.name} capture](./screenshots/${filename})`)

    } catch (e) {
      console.error(`Error during capture for ${deviceConfig.name}:`, e)
    } finally {
      await context.close()
    }
  }

  await browser.close()
}

capture().catch(console.error)
