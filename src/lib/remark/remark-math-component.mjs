import { visit } from 'unist-util-visit'

/**
 * Remark plugin to transform 'math' and 'inlineMath' nodes (from remark-math)
 * into <Latex /> MDX components.
 */
export function remarkMathToComponent() {
  return (tree) => {
    visit(tree, ['math', 'inlineMath'], (node, index, parent) => {
      if (parent && typeof index === 'number') {
        const isInline = node.type === 'inlineMath'

        const mdxNode = {
          type: isInline ? 'mdxJsxTextElement' : 'mdxJsxFlowElement',
          name: 'Latex',
          attributes: [
            { type: 'mdxJsxAttribute', name: 'formula', value: node.value },
          ],
          children: [],
        }

        if (isInline) {
          mdxNode.attributes.push({ type: 'mdxJsxAttribute', name: 'inline', value: 'true' })
        }

        // Replace the original math node with the MDX component node
        parent.children[index] = mdxNode
      }
    })
  }
}
