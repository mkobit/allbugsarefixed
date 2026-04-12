import { visit } from 'unist-util-visit'
import { JSDOM } from 'jsdom'
import mermaid from 'mermaid'
import createDOMPurify from 'dompurify'

// Setup JSDOM environment for Mermaid (it requires a browser environment)
const dom = new JSDOM('<!DOCTYPE html>')
global.window = dom.window
global.document = dom.window.document

// Setup DOMPurify to avoid Mermaid errors
const DOMPurify = createDOMPurify(dom.window)
global.DOMPurify = DOMPurify

// Initialize mermaid
mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'loose',
})

/**
 * Remark plugin to validate Mermaid diagrams at build time.
 */
export function remarkValidateMermaid() {
  return async (tree, file) => {
    const nodesToValidate = []

    visit(tree, 'code', (node) => {
      if (node.lang === 'mermaid') {
        nodesToValidate.push(node)
      }
    })

    // Validate mermaid blocks
    // We can run these sequentially or parallel. Mermaid's parse might be stateful or synchronous-like in some parts,
    // but usually it's async.
    for (const node of nodesToValidate) {
      try {
        await mermaid.parse(node.value)
      }
      catch (e) {
        if (e.message.includes('DOMPurify.sanitize is not a function')) {
          // Warning for environment setup issues, don't fail build
          console.warn(`[remark-validate-mermaid] DOMPurify setup issue, skipping validation for a block in ${file.path}`)
          continue
        }

        // Throw an error to fail the build
        throw new Error(`Mermaid Syntax Error in ${file.path}:\n${e.message}`)
      }
    }
  }
}
