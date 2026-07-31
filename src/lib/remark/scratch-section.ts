import { toString as mdastToString } from 'mdast-util-to-string'
import type { Root, RootContent } from 'mdast'

const SCRATCH_HEADING_TEXT = 'Scratch'
const SCRATCH_HEADING_DEPTH = 2

export interface ScratchSectionBoundary {
  start: number
  end: number
}

function isScratchHeading(node: RootContent): boolean {
  return node.type === 'heading'
    && node.depth === SCRATCH_HEADING_DEPTH
    && mdastToString(node).trim() === SCRATCH_HEADING_TEXT
}

/**
 * Locates the `## Scratch` section in a parsed mdast tree: the heading node
 * at depth 2 whose flattened text (formatting-agnostic, via mdast-util-to-string)
 * is exactly "Scratch", plus everything until the next heading at depth <= 2
 * or EOF. Returns byte offsets into the original source, not AST nodes, so
 * both the render-time strip and the raw-text purge script can share one
 * boundary definition.
 */
export function findScratchSection(tree: Root): ScratchSectionBoundary | null {
  const matches = tree.children.filter(isScratchHeading)

  if (matches.length > 1) {
    throw new Error(`Found ${matches.length} "## Scratch" headings; expected at most one.`)
  }

  const heading = matches[0]
  if (!heading) {
    return null
  }

  const start = heading.position?.start.offset
  if (start === undefined) {
    throw new Error('"## Scratch" heading node is missing position information.')
  }

  const headingIndex = tree.children.indexOf(heading)
  const nextBoundaryNode = tree.children
    .slice(headingIndex + 1)
    .find(node => node.type === 'heading' && node.depth <= SCRATCH_HEADING_DEPTH)

  const end = nextBoundaryNode?.position?.start.offset ?? tree.position?.end.offset

  if (end === undefined) {
    throw new Error('Unable to determine end offset for the "## Scratch" section.')
  }

  return { end, start }
}
