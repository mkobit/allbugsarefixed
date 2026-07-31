import type { Plugin, Transformer } from 'unified'
import type { Root } from 'mdast'
import { findScratchSection } from './scratch-section.ts'

/**
 * Removes the `## Scratch` section from the render tree, unconditionally,
 * regardless of visibility or lifecycle stage. This is the render-safety
 * mechanism (design.md Decision 5) -- scratch content must never reach HTML
 * output in any environment. Must run before remarkReadingTime so word counts
 * exclude scratch content.
 */
export const remarkStripScratch: Plugin<[], Root> = () => {
  const transformer: Transformer<Root> = (tree: Root) => {
    const section = findScratchSection(tree)
    if (!section) return

    tree.children = tree.children.filter((node) => {
      const nodeStart = node.position?.start.offset
      if (nodeStart === undefined) return true
      return nodeStart < section.start || nodeStart >= section.end
    })
  }

  return transformer
}
