import { describe, expect, it } from 'bun:test'
import { generateTypeScript, parseCssTokens, toCamelCase } from '../../scripts/generate-tokens'
import { getStaticTokenColor, tokens, tokenVar } from './tokens.gen'

describe('toCamelCase', () => {
  it('converts kebab-case custom property to camelCase', () => {
    expect(toCamelCase('--color-brand-bg')).toBe('colorBrandBg')
    expect(toCamelCase('--font-sans')).toBe('fontSans')
    expect(toCamelCase('--color-ui-text-muted')).toBe('colorUiTextMuted')
  })
})

describe('parseCssTokens', () => {
  it('parses :root custom properties', () => {
    const css = `
      :root {
        --color-brand-primary: #123456; /* Brand primary */
      }
    `
    const res = parseCssTokens(css)
    expect(res.tokens.length).toBe(1)
    const token = res.tokensByName['--color-brand-primary']
    expect(token).toBeDefined()
    expect(token?.name).toBe('--color-brand-primary')
    expect(token?.camelKey).toBe('colorBrandPrimary')
    expect(token?.lightValue).toBe('#123456')
    expect(token?.description).toBe('Brand primary')
  })

  it('pairs :root and .dark tokens', () => {
    const css = `
      :root {
        --color-brand-bg: #ffffff;
      }
      .dark {
        --color-brand-bg: #000000;
      }
    `
    const res = parseCssTokens(css)
    const token = res.tokensByName['--color-brand-bg']
    expect(token).toBeDefined()
    expect(token?.lightValue).toBe('#ffffff')
    expect(token?.darkValue).toBe('#000000')
  })

  it('parses light-dark() CSS color function', () => {
    const css = `
      :root {
        --color-surface: light-dark(#ffffff, #1e1e1e);
      }
    `
    const res = parseCssTokens(css)
    const token = res.tokensByName['--color-surface']
    expect(token).toBeDefined()
    expect(token?.lightValue).toBe('#ffffff')
    expect(token?.darkValue).toBe('#1e1e1e')
  })

  it('ignores self-referential Tailwind mappings', () => {
    const css = `
      @theme {
        --color-brand-bg: var(--color-brand-bg);
      }
      :root {
        --color-brand-bg: #f8fafc;
      }
    `
    const res = parseCssTokens(css)
    const token = res.tokensByName['--color-brand-bg']
    expect(token).toBeDefined()
    expect(token?.lightValue).toBe('#f8fafc')
  })

  it('handles nested @layer blocks', () => {
    const css = `
      @layer base {
        :root {
          --color-brand-accent: #ff9900;
        }
        .dark {
          --color-brand-accent: #cc7700;
        }
      }
    `
    const res = parseCssTokens(css)
    const token = res.tokensByName['--color-brand-accent']
    expect(token).toBeDefined()
    expect(token?.lightValue).toBe('#ff9900')
    expect(token?.darkValue).toBe('#cc7700')
  })
})

describe('generateTypeScript', () => {
  it('generates valid TypeScript output with token mappings and utilities', () => {
    const css = `
      :root {
        --color-brand-bg: #ffffff;
        --font-sans: "Inter", sans-serif;
        --animate-spin: spin 1s linear infinite;
      }
      .dark {
        --color-brand-bg: #111111;
      }
    `
    const res = parseCssTokens(css)
    const code = generateTypeScript(res)

    expect(code).toContain('export type ColorToken')
    expect(code).toContain('\'--color-brand-bg\'')
    expect(code).toContain('export type FontToken')
    expect(code).toContain('\'--font-sans\'')
    expect(code).toContain('export type AnimationToken')
    expect(code).toContain('\'--animate-spin\'')
    expect(code).toContain('export const tokenNames = {')
    expect(code).toContain('export const tokenVars = {')
    expect(code).toContain('export function tokenVar(')
    expect(code).toContain('export function getStaticTokenColor(')
  })
})

describe('tokens.gen runtime contract', () => {
  it('exports valid tokens object with light and dark values', () => {
    expect(tokens.color.brandBg.name).toBe('--color-brand-bg')
    expect(tokens.color.brandBg.var).toBe('var(--color-brand-bg)')
    expect(tokens.color.brandBg.light).toBe('hsl(210, 40%, 98%)')
    expect(tokens.color.brandBg.dark).toBe('hsl(222, 47%, 11%)')
  })

  it('constructs CSS var expressions with tokenVar helper', () => {
    expect(tokenVar('--color-brand-primary')).toBe('var(--color-brand-primary)')
    expect(tokenVar('--color-brand-primary', '#000')).toBe('var(--color-brand-primary, #000)')
  })

  it('resolves static values for charts via getStaticTokenColor helper', () => {
    expect(getStaticTokenColor('--color-brand-bg', 'light')).toBe('hsl(210, 40%, 98%)')
    expect(getStaticTokenColor('--color-brand-bg', 'dark')).toBe('hsl(222, 47%, 11%)')
  })
})
