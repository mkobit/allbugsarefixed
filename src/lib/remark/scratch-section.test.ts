import { describe, it, expect } from 'vitest'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkMdx from 'remark-mdx'
import type { Root } from 'mdast'
import { findScratchSection, type ScratchSectionBoundary } from './scratch-section.ts'

function parse(source: string): Root {
  return unified().use(remarkParse).use(remarkMdx).parse(source) as Root
}

function requireBoundary(source: string): ScratchSectionBoundary {
  const boundary = findScratchSection(parse(source))
  if (boundary === null) {
    throw new Error('expected a scratch section boundary, got null')
  }
  return boundary
}

describe('findScratchSection', () => {
  it('returns null when no Scratch heading exists', () => {
    const source = [
      '# Title',
      '',
      'Just regular content, no scratch section.',
      '',
    ].join('\n')

    expect(findScratchSection(parse(source))).toBeNull()
  })

  it('finds a plain "## Scratch" section bounded by the next depth-2 heading', () => {
    const source = [
      '# Title',
      '',
      'Intro content.',
      '',
      '## Scratch',
      '',
      'Scratch notes.',
      '',
      '## Real section',
      '',
      'Real content.',
      '',
    ].join('\n')

    const boundary = requireBoundary(source)
    const sliced = source.slice(boundary.start, boundary.end)
    expect(sliced.startsWith('## Scratch')).toBe(true)
    expect(sliced).toContain('Scratch notes.')
    expect(sliced).not.toContain('Real section')
    expect(sliced).not.toContain('Real content.')
  })

  it('extends to EOF when no later heading follows', () => {
    const source = [
      '# Title',
      '',
      '## Scratch',
      '',
      'Trailing scratch content, nothing after it.',
      '',
    ].join('\n')

    const boundary = requireBoundary(source)
    expect(boundary.end).toBe(source.length)
  })

  it('stops at a depth-1 heading, not just depth-2', () => {
    const source = [
      '## Scratch',
      '',
      'Scratch content.',
      '',
      '# Next post section',
      '',
      'Should not be included.',
      '',
    ].join('\n')

    const boundary = requireBoundary(source)
    const sliced = source.slice(boundary.start, boundary.end)
    expect(sliced).not.toContain('Next post section')
  })

  it('matches a heading via flattened text, e.g. "## **Scratch**"', () => {
    const source = [
      '# Title',
      '',
      '## **Scratch**',
      '',
      'Formatted heading scratch content.',
      '',
      '## Real section',
      '',
    ].join('\n')

    const boundary = requireBoundary(source)
    const sliced = source.slice(boundary.start, boundary.end)
    expect(sliced).toContain('Formatted heading scratch content.')
    expect(sliced).not.toContain('Real section')
  })

  it('ignores a literal "## Scratch" inside a fenced code block', () => {
    const source = [
      '# Title',
      '',
      '```md',
      '## Scratch',
      'This is example text inside a code fence, not a real heading.',
      '```',
      '',
      '## Real section',
      '',
      'Real content.',
      '',
    ].join('\n')

    expect(findScratchSection(parse(source))).toBeNull()
  })

  it('does not let a fenced "## Scratch" example inside a real Scratch section create a second match', () => {
    const source = [
      '# Title',
      '',
      '## Scratch',
      '',
      'Notes on the mechanism:',
      '',
      '```md',
      '## Scratch',
      'This fenced example must not be treated as a second heading.',
      '```',
      '',
      '## Real section',
      '',
      'Real content.',
      '',
    ].join('\n')

    const boundary = requireBoundary(source)
    const sliced = source.slice(boundary.start, boundary.end)
    expect(sliced).toContain('fenced example')
    expect(sliced).not.toContain('Real section')
  })

  it('throws when more than one "## Scratch" heading exists', () => {
    const source = [
      '## Scratch',
      '',
      'First.',
      '',
      '## Scratch',
      '',
      'Second.',
      '',
    ].join('\n')

    expect(() => findScratchSection(parse(source))).toThrow(/Scratch/)
  })
})
