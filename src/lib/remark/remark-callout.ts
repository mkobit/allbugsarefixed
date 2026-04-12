import { visit } from 'unist-util-visit'
import type { Plugin, Transformer } from 'unified'
import type { Root, Blockquote, Paragraph, Text } from 'mdast'
import type { Parent } from 'unist'

const CALLOUT_REGEX = /^\[!(\w+)\]\s*(.*)$/
const VALID_TYPES = ['info', 'warning', 'tip', 'error'] as const

type CalloutType = typeof VALID_TYPES[number]

function toSentenceCase(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export const remarkCallout: Plugin<[], Root> = () => {
  const transformer: Transformer<Root> = (tree: Root) => {
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

      const typeRaw = match[1].toLowerCase()

      if (!VALID_TYPES.includes(typeRaw as CalloutType)) {
        throw new Error(`Invalid callout type "${typeRaw}". Supported types are: ${VALID_TYPES.join(', ')}`)
      }

      const type = typeRaw as CalloutType
      const title = toSentenceCase(match[2].trim())

      const newTextValue = textValue.replace(CALLOUT_REGEX, '').replace(/^\n/, '')

      if (newTextValue) {
        textNode.value = newTextValue
      }
      else {
        paragraph.children.shift()
      }

      if (paragraph.children.length === 0) {
        node.children.shift()
      }


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

      parent.children[index] = mdxNode
    })
  }

  return transformer
}
