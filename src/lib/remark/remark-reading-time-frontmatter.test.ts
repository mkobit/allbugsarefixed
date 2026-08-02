import { describe, it, expect } from 'vitest'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkMdx from 'remark-mdx'
import remarkReadingTime from 'remark-reading-time'
import { VFile } from 'vfile'
import type { Root } from 'mdast'
import { remarkReadingTimeFrontmatter } from './remark-reading-time-frontmatter.ts'

describe('remarkReadingTimeFrontmatter', () => {
  it('copies file.data.readingTime into file.data.astro.frontmatter.readingTime', () => {
    const processor = unified()
      .use(remarkParse)
      .use(remarkMdx)
      .use(remarkReadingTime, {})
      .use(remarkReadingTimeFrontmatter)

    const file = new VFile('alpha bravo charlie delta echo.')
    const tree = processor.parse(file) as Root
    processor.runSync(tree, file)

    expect(file.data.astro?.frontmatter?.readingTime).toEqual(file.data.readingTime)
  })

  it('does nothing when remark-reading-time has not run first', () => {
    const processor = unified().use(remarkParse).use(remarkMdx).use(remarkReadingTimeFrontmatter)

    const file = new VFile('alpha bravo charlie.')
    const tree = processor.parse(file) as Root
    processor.runSync(tree, file)

    expect(file.data.astro).toBeUndefined()
  })
})
