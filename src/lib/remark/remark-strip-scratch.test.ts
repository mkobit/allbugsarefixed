import { describe, it, expect } from 'vitest'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkMdx from 'remark-mdx'
import remarkReadingTime from 'remark-reading-time'
import { toString as mdastToString } from 'mdast-util-to-string'
import { VFile } from 'vfile'
import type { Root } from 'mdast'
import { remarkStripScratch } from './remark-strip-scratch.ts'

function buildProcessor() {
  return unified().use(remarkParse).use(remarkMdx).use(remarkStripScratch)
}

function stripAndRender(source: string): string {
  const processor = buildProcessor()
  const tree = processor.parse(source) as Root
  processor.runSync(tree)
  return tree.children.map(node => mdastToString(node)).join('\n')
}

describe('remarkStripScratch', () => {
  it('removes a plain "## Scratch" section from the tree', () => {
    const source = [
      '# Title',
      '',
      'Intro content.',
      '',
      '## Scratch',
      '',
      'Scratch notes that must not render.',
      '',
      '## Real section',
      '',
      'Real content that must render.',
      '',
    ].join('\n')

    const rendered = stripAndRender(source)
    expect(rendered).not.toContain('Scratch notes')
    expect(rendered).not.toContain('Scratch')
    expect(rendered).toContain('Intro content.')
    expect(rendered).toContain('Real content that must render.')
  })

  it('removes a "## **Scratch**"-formatted heading section', () => {
    const source = [
      '# Title',
      '',
      '## **Scratch**',
      '',
      'Formatted heading scratch content.',
      '',
      '## Real section',
      '',
      'Real content.',
      '',
    ].join('\n')

    const rendered = stripAndRender(source)
    expect(rendered).not.toContain('Formatted heading scratch content')
    expect(rendered).toContain('Real content.')
  })

  it('leaves a fenced code block containing the literal text "## Scratch" untouched', () => {
    const source = [
      '# Title',
      '',
      '```md',
      '## Scratch',
      'Example text, not a real heading.',
      '```',
      '',
      '## Real section',
      '',
      'Real content.',
      '',
    ].join('\n')

    const rendered = stripAndRender(source)
    expect(rendered).toContain('Example text, not a real heading.')
    expect(rendered).toContain('Real content.')
  })

  it('does nothing when there is no Scratch heading', () => {
    const source = ['# Title', '', 'Just content.', ''].join('\n')

    const rendered = stripAndRender(source)
    expect(rendered).toContain('Just content.')
  })

  it('throws when more than one "## Scratch" heading exists', () => {
    const source = [
      '## Scratch',
      '',
      'One',
      '',
      '## Scratch',
      '',
      'Two',
      '',
    ].join('\n')

    const processor = buildProcessor()
    const tree = processor.parse(source) as Root
    expect(() => processor.runSync(tree)).toThrow(/Scratch/)
  })
})

describe('remarkStripScratch interaction with remark-reading-time', () => {
  interface ReadingTimeResult {
    words: number
  }

  function wordCount(source: string, order: 'stripFirst' | 'stripLast'): number {
    const base = unified().use(remarkParse).use(remarkMdx)
    const processor = order === 'stripFirst'
      ? base.use(remarkStripScratch).use(remarkReadingTime, {})
      : base.use(remarkReadingTime, {}).use(remarkStripScratch)

    const file = new VFile(source)
    const tree = processor.parse(file) as Root
    processor.runSync(tree, file)

    const readingTime = file.data.readingTime as ReadingTimeResult | undefined
    if (!readingTime) {
      throw new Error('expected remark-reading-time to populate file.data.readingTime')
    }
    return readingTime.words
  }

  const withScratch = [
    '# Title',
    '',
    'alpha bravo charlie delta echo foxtrot golf hotel.',
    '',
    '## Scratch',
    '',
    'kilo lima mike november oscar papa quebec romeo tango uniform victor whiskey xray yankee zulu.',
    '',
  ].join('\n')

  const withoutScratchSection = [
    '# Title',
    '',
    'alpha bravo charlie delta echo foxtrot golf hotel.',
    '',
  ].join('\n')

  it('excludes scratch words from the reading-time word count when registered before remark-reading-time (astro.config.mjs order)', () => {
    const strippedFirst = wordCount(withScratch, 'stripFirst')
    const baseline = wordCount(withoutScratchSection, 'stripFirst')
    expect(strippedFirst).toBe(baseline)
  })

  it('would count scratch words if registered after remark-reading-time (regression guard for plugin order)', () => {
    const strippedLast = wordCount(withScratch, 'stripLast')
    const baseline = wordCount(withoutScratchSection, 'stripFirst')
    expect(strippedLast).toBeGreaterThan(baseline)
  })
})
