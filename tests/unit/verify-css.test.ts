import { describe, expect, it } from 'bun:test'
import {
  normalizePath,
  runCssVerification,
  stripComments,
  verifyCssContent,
} from '../../scripts/verify-css'

describe('verifyCssContent', () => {
  const declaredTokens = new Set<string>([
    '--color-brand-bg',
    '--color-brand-text',
    '--color-brand-primary',
  ])

  it('allows declared tokens referenced via var()', () => {
    const css = `
      .card {
        background-color: var(--color-brand-bg);
        color: var(--color-brand-text);
      }
    `
    const violations = verifyCssContent('src/components/ui/card.module.css', css, declaredTokens)
    expect(violations).toHaveLength(0)
  })

  it('flags undeclared token variables', () => {
    const css = `
      .card {
        color: var(--color-undeclared-token);
      }
    `
    const violations = verifyCssContent('src/components/ui/card.module.css', css, declaredTokens)
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('Undeclared CSS token "--color-undeclared-token"')
    expect(violations[0].line).toBe(3)
  })

  it('allows private component variables prefixed with --_', () => {
    const css = `
      .button {
        --_bg: var(--color-brand-primary);
        --_fg: var(--color-brand-text);
        --_border: transparent;
        --_px: 1rem;
        --_py: 0.5rem;
        background-color: var(--_bg);
        color: var(--_fg);
      }
    `
    const violations = verifyCssContent('src/components/ui/button.module.css', css, declaredTokens)
    expect(violations).toHaveLength(0)
  })

  it('bans raw hex colors outside allowed token definition files', () => {
    const css = `
      .badge {
        background-color: #1e293b;
        border-color: #f00;
      }
    `
    const violations = verifyCssContent('src/components/ui/badge.module.css', css, declaredTokens)
    expect(violations).toHaveLength(2)
    expect(violations[0].message).toContain('Forbidden raw hex color "#1e293b"')
    expect(violations[1].message).toContain('Forbidden raw hex color "#f00"')
  })

  it('allows raw hex and hsl colors in src/styles/global.css', () => {
    const css = `
      :root {
        --color-brand-bg: hsl(210, 40%, 98%);
        --color-ui-surface-raised: #fff;
      }
    `
    const violations = verifyCssContent('src/styles/global.css', css, declaredTokens)
    expect(violations).toHaveLength(0)
  })

  it('bans raw rgb and rgba literals outside allowed token definition files', () => {
    const css = `
      .overlay {
        background-color: rgba(0, 0, 0, 0.5);
        color: rgb(255, 255, 255);
      }
    `
    const violations = verifyCssContent('src/components/ui/dialog.module.css', css, declaredTokens)
    expect(violations).toHaveLength(2)
    expect(violations[0].message).toContain('Forbidden raw RGBA literal')
    expect(violations[1].message).toContain('Forbidden raw RGB literal')
  })

  it('bans raw hsl and hsla literals outside allowed token definition files', () => {
    const css = `
      .header {
        background: hsl(210, 40%, 98%);
        border-color: hsla(0, 0%, 100%, 0.2);
      }
    `
    const violations = verifyCssContent('src/components/Header.astro', css, declaredTokens)
    expect(violations).toHaveLength(2)
    expect(violations[0].message).toContain('Forbidden raw HSL literal')
    expect(violations[1].message).toContain('Forbidden raw HSLA literal')
  })

  it('ignores comments containing hex colors or undeclared tokens', () => {
    const css = `
      /* Header styles with old colors: #1e293b, rgb(1, 2, 3), and var(--old-token) */
      .header {
        // inline comment with #ffffff and hsl(0, 0%, 0%)
        color: var(--color-brand-primary); /* was #7c3aed */
      }
    `
    const violations = verifyCssContent('src/components/Header.astro', css, declaredTokens)
    expect(violations).toHaveLength(0)
  })

  it('ignores url(#id) fragment identifiers', () => {
    const css = `
      .clip {
        clip-path: url(#clip-shape);
        mask: url(#fade);
      }
    `
    const violations = verifyCssContent('src/components/Clip.astro', css, declaredTokens)
    expect(violations).toHaveLength(0)
  })

  it('skips excluded files like src/styles/shiki.css', () => {
    const css = `
      .shiki {
        color: #6e7681;
        counter-reset: line calc(var(--start-line, 1) - 1);
      }
    `
    const violations = verifyCssContent('src/styles/shiki.css', css, declaredTokens)
    expect(violations).toHaveLength(0)
  })
})

describe('normalizePath and stripComments utilities', () => {
  it('normalizes paths across platforms', () => {
    expect(normalizePath('src/styles/global.css')).toBe('src/styles/global.css')
    expect(normalizePath('src\\styles\\global.css')).toBe('src/styles/global.css')
  })

  it('replaces block comments while preserving newlines', () => {
    const input = 'a {\n  /* line 1\n     line 2 */\n  color: red;\n}'
    const output = stripComments(input)
    expect(output.split('\n')).toHaveLength(input.split('\n').length)
    expect(output).not.toContain('line 1')
    expect(output).toContain('color: red;')
  })
})

describe('runCssVerification', () => {
  it('scans target files and returns zero violations for valid files', () => {
    const { checkedFiles, violations } = runCssVerification(['src/styles/global.css'])
    expect(checkedFiles).toContain('src/styles/global.css')
    expect(violations).toHaveLength(0)
  })

  it('excludes shiki.css when specified in target files', () => {
    const { checkedFiles } = runCssVerification(['src/styles/shiki.css'])
    expect(checkedFiles).toHaveLength(0)
  })
})
