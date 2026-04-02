import { visit } from 'unist-util-visit'
import type { Node, Parent } from 'unist'
import type { Blockquote, Paragraph, Text } from 'mdast'

const CALLOUT_REGEX = /^\[!(\w+)\]\s*(.*)$/

export function remarkCallout() {
  return (tree: Node) => {
    visit(tree, 'blockquote', (node: Blockquote, index?: number, parent?: Parent) => {
      if (!parent || index === undefined) return

      const firstChild = node.children[0]
      if (firstChild?.type !== 'paragraph') return

      const paragraph = firstChild as Paragraph
      const firstTextNode = paragraph.children[0]
      if (firstTextNode?.type !== 'text') return

      const textNode = firstTextNode as Text
      const textValue = textNode.value

      const match = textValue.match(CALLOUT_REGEX)
      if (!match) return

      const type = match[1]
      const title = match[2].trim()

      const newTextValue = textValue.replace(CALLOUT_REGEX, '').replace(/^\n/, '')

      if (newTextValue) {
        // eslint-disable-next-line functional/immutable-data
        textNode.value = newTextValue
      }
      else {
        // eslint-disable-next-line functional/immutable-data
        paragraph.children.shift()
      }

      if (paragraph.children.length === 0) {
        // eslint-disable-next-line functional/immutable-data
        node.children.shift()
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mdxNode: any = {
        attributes: [
          { name: 'type', type: 'mdxJsxAttribute', value: type },
        ],
        children: node.children,
        name: 'Callout',
        type: 'mdxJsxFlowElement',
      }

      if (title) {
        mdxNode.attributes.push({
          name: 'title',
          type: 'mdxJsxAttribute',
          value: title,
        })
      }

      // eslint-disable-next-line functional/immutable-data
      parent.children[index] = mdxNode
    })
  }
}
