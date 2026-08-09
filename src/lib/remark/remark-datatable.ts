import { visit } from 'unist-util-visit'
import type { Plugin, Transformer } from 'unified'
import type { Root, Table, TableRow } from 'mdast'
import type { Parent } from 'unist'
import { toString as mdastToString } from 'mdast-util-to-string'

function findUniqueKey(baseKey: string, existingKeys: Set<string>, counter = 0): string {
  const candidate = counter === 0 ? baseKey : `${baseKey}-${counter}`
  if (!existingKeys.has(candidate)) {
    existingKeys.add(candidate)
    return candidate
  }
  return findUniqueKey(baseKey, existingKeys, counter + 1)
}

export function slugify(text: string, existingKeys: Set<string>): string {
  const raw = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
  const base = raw || 'col'
  return findUniqueKey(base, existingKeys)
}

function isDatatableComment(node: any): boolean {
  if (node && node.type === 'mdxFlowExpression' && typeof node.value === 'string') {
    const trimmed = node.value.trim().replace(/\s+/g, ' ')
    return trimmed === '/* datatable */'
  }
  return false
}

function containsDataTableImport(tree: Root): boolean {
  return tree.children.some(
    (node: any) => node.type === 'mdxjsEsm' && typeof node.value === 'string' && node.value.includes('DataTable'),
  )
}

function createEsmImportNode(importPath = '@/components/ui/table') {
  const value = `import { DataTable } from '${importPath}'`
  return {
    data: {
      estree: {
        body: [
          {
            source: {
              raw: `'${importPath}'`,
              type: 'Literal',
              value: importPath,
            },
            specifiers: [
              {
                imported: { name: 'DataTable', type: 'Identifier' },
                local: { name: 'DataTable', type: 'Identifier' },
                type: 'ImportSpecifier',
              },
            ],
            type: 'ImportDeclaration',
          },
        ],
        comments: [],
        sourceType: 'module',
        type: 'Program',
      },
    },
    type: 'mdxjsEsm',
    value,
  }
}

interface RemarkDatatableOptions {
  readonly importPath?: string
}

function toEstreeLiteral(val: string | number | boolean | null) {
  return {
    raw: JSON.stringify(val),
    type: 'Literal',
    value: val,
  }
}

function toEstreeNode(val: any): any {
  if (val === null || typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
    return toEstreeLiteral(val)
  }
  if (Array.isArray(val)) {
    return {
      elements: val.map(toEstreeNode),
      type: 'ArrayExpression',
    }
  }
  if (typeof val === 'object') {
    return {
      properties: Object.entries(val).map(([k, v]) => ({
        computed: false,
        key: /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k)
          ? { name: k, type: 'Identifier' }
          : { raw: JSON.stringify(k), type: 'Literal', value: k },
        kind: 'init',
        method: false,
        shorthand: false,
        type: 'Property',
        value: toEstreeNode(v),
      })),
      type: 'ObjectExpression',
    }
  }
  return toEstreeLiteral(null)
}

function createExpressionAttributeValue(valueObj: any) {
  const rawJson = JSON.stringify(valueObj)
  return {
    data: {
      estree: {
        body: [
          {
            expression: toEstreeNode(valueObj),
            type: 'ExpressionStatement',
          },
        ],
        comments: [],
        sourceType: 'module',
        type: 'Program',
      },
    },
    type: 'mdxJsxAttributeValueExpression',
    value: rawJson,
  }
}

export const remarkDatatable: Plugin<[RemarkDatatableOptions?], Root> = (options = {}) => {
  const importPath = options.importPath ?? '@/components/ui/table'

  const transformer: Transformer<Root> = (tree: Root) => {
    const nodesToRemove: Array<{ index: number, parent: Parent }> = []

    visit(tree, 'table', (node: Table, index?: number, parent?: Parent) => {
      if (!parent || index === undefined || index === 0) return

      const prevNode = parent.children[index - 1]
      if (!isDatatableComment(prevNode)) return

      nodesToRemove.push({ index: index - 1, parent })

      const headerRow = node.children[0] as TableRow | undefined
      if (!headerRow) return

      const existingKeys = new Set<string>()
      const columns = headerRow.children.map((cell) => {
        const headerText = mdastToString(cell).trim()
        const accessorKey = slugify(headerText, existingKeys)
        return { accessorKey, header: headerText }
      })

      const bodyRows = node.children.slice(1) as TableRow[]
      const data = bodyRows.map((row) => {
        const rowData: Record<string, string> = {}
        columns.forEach((col, colIndex) => {
          const cellNode = row.children[colIndex]
          rowData[col.accessorKey] = cellNode ? mdastToString(cellNode).trim() : ''
        })
        return rowData
      })

      const mdxNode: any = {
        attributes: [
          {
            name: 'client:load',
            type: 'mdxJsxAttribute',
            value: null,
          },
          {
            name: 'columns',
            type: 'mdxJsxAttribute',
            value: createExpressionAttributeValue(columns),
          },
          {
            name: 'data',
            type: 'mdxJsxAttribute',
            value: createExpressionAttributeValue(data),
          },
        ],
        children: [],
        name: 'DataTable',
        type: 'mdxJsxFlowElement',
      }

      parent.children[index] = mdxNode
    })

    // Remove the comment nodes in reverse order so indexes don't shift
    nodesToRemove.slice().reverse().forEach(({ index, parent }) => {
      parent.children.splice(index, 1)
    })

    if (nodesToRemove.length > 0 && !containsDataTableImport(tree)) {
      tree.children.unshift(createEsmImportNode(importPath) as any)
    }
  }

  return transformer
}
