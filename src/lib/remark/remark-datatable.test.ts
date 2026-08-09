import { describe, it, expect } from 'vitest'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkMdx from 'remark-mdx'
import remarkGfm from 'remark-gfm'
import type { Root } from 'mdast'
import { remarkDatatable, slugify } from './remark-datatable.ts'

function buildProcessor() {
  return unified()
    .use(remarkParse)
    .use(remarkMdx)
    .use(remarkGfm)
    .use(remarkDatatable)
}

describe('slugify', () => {
  it('converts header text into clean kebab-case keys', () => {
    const set = new Set<string>()
    expect(slugify('Name', set)).toBe('name')
    expect(slugify('Email Address', set)).toBe('email-address')
    expect(slugify('Role / Position', set)).toBe('role-position')
  })

  it('handles duplicate headers by adding numbers', () => {
    const set = new Set<string>()
    expect(slugify('Status', set)).toBe('status')
    expect(slugify('Status', set)).toBe('status-1')
    expect(slugify('Status', set)).toBe('status-2')
  })

  it('provides a fallback for empty or non-alphanumeric headers', () => {
    const set = new Set<string>()
    expect(slugify('!!!', set)).toBe('col')
    expect(slugify('???', set)).toBe('col-1')
  })
})

describe('remarkDatatable', () => {
  it('rewrites an opted-in GFM table marked with {/* datatable */}', () => {
    const source = [
      '# Test Post',
      '',
      '{/* datatable */}',
      '| Name | Status | Age |',
      '| :--- | :---: | ---: |',
      '| Alice | Active | 30 |',
      '| Bob | Pending | 25 |',
      '',
    ].join('\n')

    const processor = buildProcessor()
    const tree = processor.parse(source) as Root
    processor.runSync(tree)

    // Should inject ESM import at index 0
    const esmNode = tree.children[0] as any
    expect(esmNode.type).toBe('mdxjsEsm')
    expect(esmNode.value).toContain('import { DataTable } from \'@/components/ui/table\'')

    // Table node should be replaced by mdxJsxFlowElement DataTable
    const dataTableNode = tree.children.find((node: any) => node.type === 'mdxJsxFlowElement' && node.name === 'DataTable') as any
    expect(dataTableNode).toBeDefined()
    expect(dataTableNode.name).toBe('DataTable')

    const clientLoadAttr = dataTableNode.attributes.find((a: any) => a.name === 'client:load')
    expect(clientLoadAttr).toBeDefined()

    const columnsAttr = dataTableNode.attributes.find((a: any) => a.name === 'columns')
    expect(columnsAttr).toBeDefined()
    const columns = JSON.parse(columnsAttr.value.value)
    expect(columns).toEqual([
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'status', header: 'Status' },
      { accessorKey: 'age', header: 'Age' },
    ])

    const dataAttr = dataTableNode.attributes.find((a: any) => a.name === 'data')
    expect(dataAttr).toBeDefined()
    const data = JSON.parse(dataAttr.value.value)
    expect(data).toEqual([
      { age: '30', name: 'Alice', status: 'Active' },
      { age: '25', name: 'Bob', status: 'Pending' },
    ])

    // Comment marker should be removed
    const commentNode = tree.children.find((node: any) => node.type === 'mdxFlowExpression')
    expect(commentNode).toBeUndefined()
  })

  it('leaves plain unmarked GFM tables untouched', () => {
    const source = [
      '# Test Post',
      '',
      '| Name | Status |',
      '| --- | --- |',
      '| Alice | Active |',
      '',
    ].join('\n')

    const processor = buildProcessor()
    const tree = processor.parse(source) as Root
    processor.runSync(tree)

    const tableNode = tree.children.find((node: any) => node.type === 'table')
    expect(tableNode).toBeDefined()

    const dataTableNode = tree.children.find((node: any) => node.type === 'mdxJsxFlowElement' && node.name === 'DataTable')
    expect(dataTableNode).toBeUndefined()

    const esmNode = tree.children.find((node: any) => node.type === 'mdxjsEsm')
    expect(esmNode).toBeUndefined()
  })

  it('does not duplicate ESM import if DataTable is already imported', () => {
    const source = [
      'import { DataTable } from \'@/components/ui/table\'',
      '',
      '{/* datatable */}',
      '| Item | Price |',
      '| --- | --- |',
      '| Widget | $10 |',
      '',
    ].join('\n')

    const processor = buildProcessor()
    const tree = processor.parse(source) as Root
    processor.runSync(tree)

    const esmNodes = tree.children.filter((node: any) => node.type === 'mdxjsEsm')
    expect(esmNodes).toHaveLength(1)
  })

  it('handles formatted text cells and unequal row lengths gracefully', () => {
    const source = [
      '{/* datatable */}',
      '| Feature Name | Enabled |',
      '| --- | --- |',
      '| **Security** | [Yes](https://example.com) |',
      '| Partial Row |',
      '',
    ].join('\n')

    const processor = buildProcessor()
    const tree = processor.parse(source) as Root
    processor.runSync(tree)

    const dataTableNode = tree.children.find((node: any) => node.type === 'mdxJsxFlowElement' && node.name === 'DataTable') as any
    const columns = JSON.parse(dataTableNode.attributes.find((a: any) => a.name === 'columns').value.value)
    const data = JSON.parse(dataTableNode.attributes.find((a: any) => a.name === 'data').value.value)

    expect(columns).toEqual([
      { accessorKey: 'feature-name', header: 'Feature Name' },
      { accessorKey: 'enabled', header: 'Enabled' },
    ])
    expect(data).toEqual([
      { 'enabled': 'Yes', 'feature-name': 'Security' },
      { 'enabled': '', 'feature-name': 'Partial Row' },
    ])
  })

  it('rewrites multiple marked tables in a single document', () => {
    const source = [
      '{/* datatable */}',
      '| A |',
      '| --- |',
      '| 1 |',
      '',
      '{/* datatable */}',
      '| B |',
      '| --- |',
      '| 2 |',
      '',
    ].join('\n')

    const processor = buildProcessor()
    const tree = processor.parse(source) as Root
    processor.runSync(tree)

    const dataTableNodes = tree.children.filter((node: any) => node.type === 'mdxJsxFlowElement' && node.name === 'DataTable')
    expect(dataTableNodes).toHaveLength(2)

    const esmNodes = tree.children.filter((node: any) => node.type === 'mdxjsEsm')
    expect(esmNodes).toHaveLength(1)
  })
})
