import { visit } from 'unist-util-visit'

/**
 * Remark plugin to transform code blocks with language 'mermaid' into <Mermaid /> MDX components.
 */
export function remarkMermaidToComponent() {
  return (tree) => {
    visit(tree, 'code', (node, index, parent) => {
      if (node.lang === 'mermaid' && parent && typeof index === 'number') {
        const mdxNode = {
          type: 'mdxJsxFlowElement',
          name: 'Mermaid',
          attributes: [
            { type: 'mdxJsxAttribute', name: 'code', value: node.value },
          ],
          children: [],
        }

        // Replace the original code node with the MDX component node
        parent.children[index] = mdxNode
      }
    })
  }
}
