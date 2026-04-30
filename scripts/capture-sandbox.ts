/* eslint-disable functional/no-let, functional/no-loop-statements, functional/immutable-data, @typescript-eslint/no-explicit-any */
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
    },
  })
  values = parsed.values
}
catch (e: any) {
  console.error('Error parsing arguments:', e.message)
  process.exit(1)
}

if (values.help) {
  console.log(`Usage: bun run scripts/capture-sandbox.ts [options]

Options:
  --device <string>   The device to capture: 'desktop', 'mobile', or 'both' (default: 'desktop')
  --help, -h          Show this help message`)
  process.exit(0)
}

const SANDBOX_URL = 'http://localhost:4321/sandbox/'
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
    viewport: { height: 1080, width: 1920 },
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
    console.log(`\n--- Capturing Sandbox for ${deviceConfig.name} ---`)
    const context = await browser.newContext({
      deviceScaleFactor: 2,
      userAgent: deviceConfig.userAgent,
      viewport: deviceConfig.viewport,
    })

    const page = await context.newPage()

    try {
      console.log(`Navigating to ${SANDBOX_URL}...`)
      await page.goto(SANDBOX_URL, { waitUntil: 'networkidle' })

      const locators = page.locator('[data-sandbox]')
      const count = await locators.count()

      if (count === 0) {
        console.warn('Warning: No elements with [data-sandbox] attribute found on the sandbox page.')
      }
      else {
        console.log(`Found ${count} sandbox components to capture.`)
      }

      for (let i = 0; i < count; i++) {
        const locator = locators.nth(i)
        const sandboxName = await locator.getAttribute('data-sandbox') || `component-${i}`

        console.log(`\nProcessing: [${sandboxName}]`)

        // 1. Capture exact locator screenshot
        const filename = `${sandboxName}_${deviceConfig.name}.png`
        const filepath = path.join(SCREENSHOT_DIR, filename)
        await locator.screenshot({ path: filepath })
        console.log(`📸 Saved screenshot: ./screenshots/${filename}`)

        // 2. Extract DOM Tree since Playwright page.accessibility is undefined in this version
        const layoutInfo = await locator.evaluate((el) => {
          function serializeNode(node: Element, depth = 0): string {
            if (node.nodeType !== Node.ELEMENT_NODE) return ''

            const indent = '  '.repeat(depth)
            const tagName = node.tagName.toLowerCase()
            const id = node.id ? `#${node.id}` : ''
            const classes = node.className && typeof node.className === 'string' ? `.${node.className.split(' ').join('.')}` : ''

            let result = `${indent}<${tagName}${id}${classes}>\n`

            const rect = node.getBoundingClientRect()
            if (rect.width > 0 && rect.height > 0) {
              result += `${indent}  [Box: ${Math.round(rect.width)}x${Math.round(rect.height)}]\n`
            }

            let hasTextContent = false
            const textParts: string[] = []
            for (const child of Array.from(node.childNodes)) {
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

            for (const child of Array.from(node.children)) {
              result += serializeNode(child, depth + 1)
            }

            return result
          }
          return serializeNode(el)
        })

        console.log(`\nStructural Tree for [${sandboxName}]:`)
        console.log(layoutInfo)
      }
    }
    catch (e) {
      console.error(`Error during capture for ${deviceConfig.name}:`, e)
    }
    finally {
      await context.close()
    }
  }

  await browser.close()
}

capture().catch(console.error)
