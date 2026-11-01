import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

export interface ParsedToken {
  readonly camelKey: string
  readonly categoryKey: string
  readonly darkValue?: string
  readonly description?: string
  readonly group: string
  readonly lightValue?: string
  readonly name: string
  readonly value?: string
}

export interface ParseResult {
  readonly tokens: readonly ParsedToken[]
  readonly tokensByName: Readonly<Record<string, ParsedToken>>
}

export interface ScopedBlock {
  readonly body: string
  readonly cleanSelector: string
  readonly selector: string
}

interface BlockParseState {
  readonly acc: readonly ScopedBlock[]
  readonly bodyStart: number
  readonly currentSelector: string
  readonly depth: number
  readonly selectorStart: number
}

/**
 * Converts kebab-case CSS property name to camelCase identifier.
 * Example: '--color-brand-bg' -> 'colorBrandBg'
 */
export function toCamelCase(str: string): string {
  const clean = str.replace(/^--/, '')
  return clean.replace(/-([a-z0-9])/g, (_, char) => char.toUpperCase())
}

/**
 * Extracts top-level scoped blocks handling nested braces (such as @keyframes inside @theme).
 */
export function extractBlocks(css: string): readonly ScopedBlock[] {
  const braceMatches = Array.from(css.matchAll(/[{}]/g))

  const initialState: BlockParseState = {
    acc: [],
    bodyStart: -1,
    currentSelector: '',
    depth: 0,
    selectorStart: 0,
  }

  const finalState = braceMatches.reduce((state, match) => {
    const index = match.index ?? 0
    const char = match[0]

    if (char === '{') {
      const isOuter = state.depth === 0
      return {
        acc: state.acc,
        bodyStart: isOuter ? index + 1 : state.bodyStart,
        currentSelector: isOuter ? css.slice(state.selectorStart, index).trim() : state.currentSelector,
        depth: state.depth + 1,
        selectorStart: state.selectorStart,
      }
    }

    if (char === '}') {
      const isClosingOuter = state.depth === 1 && state.bodyStart !== -1
      if (isClosingOuter) {
        const body = css.slice(state.bodyStart, index)
        const cleanSelector = state.currentSelector.replace(/\/\*[\s\S]*?\*\//g, '').trim()
        const newBlock: ScopedBlock = {
          body,
          cleanSelector,
          selector: state.currentSelector,
        }
        return {
          acc: [...state.acc, newBlock],
          bodyStart: -1,
          currentSelector: '',
          depth: 0,
          selectorStart: index + 1,
        }
      }
      return {
        ...state,
        depth: Math.max(0, state.depth - 1),
      }
    }

    return state
  }, initialState)

  return finalState.acc
}

/**
 * Recursively flattens at-rules such as @layer or @media to expose nested blocks.
 */
export function flattenBlocks(blocks: readonly ScopedBlock[]): readonly ScopedBlock[] {
  return blocks.flatMap((block) => {
    if (block.cleanSelector.startsWith('@layer') || block.cleanSelector.startsWith('@media')) {
      const innerBlocks = extractBlocks(block.body)
      const flattenedInner = flattenBlocks(innerBlocks)
      return flattenedInner.map(inner => ({
        body: inner.body,
        cleanSelector: `${block.cleanSelector} ${inner.cleanSelector}`,
        selector: `${block.selector} ${inner.selector}`,
      }))
    }
    return [block]
  })
}

/**
 * Parses CSS text into custom property tokens and values.
 */
export function parseCssTokens(cssContent: string): ParseResult {
  const topBlocks = extractBlocks(cssContent)
  const allBlocks = flattenBlocks(topBlocks)

  const initialRecord: Readonly<Record<string, ParsedToken>> = {}

  const tokensByName = allBlocks.reduce((acc, block) => {
    const selector = block.cleanSelector
    const isDarkBlock = selector.includes('.dark')
    const isRootOrTheme = selector.includes(':root') || selector.includes('@theme') || selector.includes('html')

    const matches = Array.from(block.body.matchAll(/(--[a-zA-Z0-9_-]+)\s*:\s*([^;]+);(?:\s*\/\*([^*]+)\*\/)?/g))

    return matches.reduce((blockAcc, match) => {
      const propName = match[1].trim()
      const rawValue = match[2].trim()
      const inlineComment = match[3]?.trim()

      const isSelfReference = rawValue === `var(${propName})`
      if (isSelfReference) {
        return blockAcc
      }

      const existing = blockAcc[propName]
      const camelKey = existing?.camelKey ?? toCamelCase(propName)
      const clean = propName.replace(/^--/, '')
      const parts = clean.split('-')
      const group = existing?.group ?? parts[0] ?? 'custom'
      const derivedCategoryKey = parts.slice(1).map((p, i) => (i === 0 ? p : p.charAt(0).toUpperCase() + p.slice(1))).join('') || group
      const categoryKey = existing?.categoryKey ?? derivedCategoryKey
      const description = existing?.description ?? inlineComment

      const ldMatch = rawValue.match(/^light-dark\(\s*([^,]+?)\s*,\s*([^)]+?)\s*\)$/)
      if (ldMatch) {
        const lightValue = ldMatch[1].trim()
        const darkValue = ldMatch[2].trim()
        const updated: ParsedToken = {
          camelKey,
          categoryKey,
          darkValue,
          description,
          group,
          lightValue,
          name: propName,
          value: rawValue,
        }
        return { ...blockAcc, [propName]: updated }
      }

      if (isDarkBlock) {
        const updated: ParsedToken = {
          camelKey,
          categoryKey,
          darkValue: rawValue,
          description,
          group,
          lightValue: existing?.lightValue,
          name: propName,
          value: existing?.value ?? rawValue,
        }
        return { ...blockAcc, [propName]: updated }
      }

      if (isRootOrTheme) {
        const updated: ParsedToken = {
          camelKey,
          categoryKey,
          darkValue: existing?.darkValue,
          description,
          group,
          lightValue: rawValue,
          name: propName,
          value: existing?.value ?? rawValue,
        }
        return { ...blockAcc, [propName]: updated }
      }

      const updated: ParsedToken = {
        camelKey,
        categoryKey,
        darkValue: existing?.darkValue,
        description,
        group,
        lightValue: existing?.lightValue,
        name: propName,
        value: existing?.value ?? rawValue,
      }
      return { ...blockAcc, [propName]: updated }
    }, acc)
  }, initialRecord)

  const tokens = Object.values(tokensByName)
  return { tokens, tokensByName }
}

function escapeSingleQuote(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/'/g, '\\\'')
}

/**
 * Generates formatted TypeScript code containing types, constants, and utilities for tokens.
 */
export function generateTypeScript(result: ParseResult): string {
  const { tokens } = result

  // Group tokens and sort alphabetically
  const rawColorTokens = tokens.filter(t => t.name.startsWith('--color-'))
  const rawFontTokens = tokens.filter(t => t.name.startsWith('--font-'))
  const rawAnimateTokens = tokens.filter(t => t.name.startsWith('--animate-'))
  const rawOtherTokens = tokens.filter(t => !rawColorTokens.includes(t) && !rawFontTokens.includes(t) && !rawAnimateTokens.includes(t))

  const colorTokens = [...rawColorTokens].sort((a, b) => a.name.localeCompare(b.name))
  const fontTokens = [...rawFontTokens].sort((a, b) => a.name.localeCompare(b.name))
  const animateTokens = [...rawAnimateTokens].sort((a, b) => a.name.localeCompare(b.name))
  const otherTokens = [...rawOtherTokens].sort((a, b) => a.name.localeCompare(b.name))

  const sortedAllTokens = [...tokens].sort((a, b) => a.camelKey.localeCompare(b.camelKey))

  const sortedAnimateByCategory = [...animateTokens].sort((a, b) => a.categoryKey.localeCompare(b.categoryKey))
  const sortedColorByCategory = [...colorTokens].sort((a, b) => a.categoryKey.localeCompare(b.categoryKey))
  const sortedFontByCategory = [...fontTokens].sort((a, b) => a.categoryKey.localeCompare(b.categoryKey))

  const lines = [
    '// Auto-generated by scripts/generate-tokens.ts. Do not edit directly.',
    '',
    '/** Color token identifiers */',
    ...(colorTokens.length > 0
      ? [
          'export type ColorToken',
          ...colorTokens.map((t, idx) => (idx === 0 ? `  = | '${t.name}'` : `    | '${t.name}'`)),
        ]
      : ['export type ColorToken = string']),
    '',
    '/** Font token identifiers */',
    ...(fontTokens.length > 0
      ? [
          'export type FontToken',
          ...fontTokens.map((t, idx) => (idx === 0 ? `  = | '${t.name}'` : `    | '${t.name}'`)),
        ]
      : ['export type FontToken = string']),
    '',
    '/** Animation token identifiers */',
    ...(animateTokens.length > 0
      ? [
          'export type AnimationToken',
          ...animateTokens.map((t, idx) => (idx === 0 ? `  = | '${t.name}'` : `    | '${t.name}'`)),
        ]
      : ['export type AnimationToken = string']),
    '',
    '/** All CSS design token identifiers */',
    `export type DesignToken = AnimationToken | ColorToken | FontToken${otherTokens.length > 0 ? ' | OtherToken' : ''}`,
    '',
    ...(otherTokens.length > 0
      ? [
          '/** Other token identifiers */',
          'export type OtherToken',
          ...otherTokens.map((t, idx) => (idx === 0 ? `  = | '${t.name}'` : `    | '${t.name}'`)),
          '',
        ]
      : []),
    '/** Map of token camelCase keys to CSS property names */',
    'export const tokenNames = {',
    ...sortedAllTokens.flatMap(t => [
      ...(t.description ? [`  /** ${t.description} */`] : []),
      `  ${t.camelKey}: '${t.name}',`,
    ]),
    '} as const',
    '',
    '/** Map of token camelCase keys to CSS var() references */',
    'export const tokenVars = {',
    ...sortedAllTokens.map(t => `  ${t.camelKey}: 'var(${t.name})',`),
    '} as const',
    '',
    '/** Grouped token definitions with metadata */',
    'export const tokens = {',
    '  animation: {',
    ...sortedAnimateByCategory.flatMap(t => [
      `    ${t.categoryKey}: {`,
      `      name: '${t.name}',`,
      ...(t.value ? [`      value: '${escapeSingleQuote(t.value)}',`] : []),
      `      var: 'var(${t.name})',`,
      '    },',
    ]),
    '  },',
    '  color: {',
    ...sortedColorByCategory.flatMap(t => [
      `    ${t.categoryKey}: {`,
      ...(t.darkValue ? [`      dark: '${escapeSingleQuote(t.darkValue)}',`] : []),
      ...(t.lightValue ? [`      light: '${escapeSingleQuote(t.lightValue)}',`] : []),
      `      name: '${t.name}',`,
      `      var: 'var(${t.name})',`,
      '    },',
    ]),
    '  },',
    '  font: {',
    ...sortedFontByCategory.flatMap(t => [
      `    ${t.categoryKey}: {`,
      `      name: '${t.name}',`,
      ...(t.value ? [`      value: '${escapeSingleQuote(t.value)}',`] : []),
      `      var: 'var(${t.name})',`,
      '    },',
    ]),
    '  },',
    '} as const',
    '',
    '/** Construct a CSS var() function expression for a token */',
    'export function tokenVar(name: DesignToken, fallback?: string): string {',
    '  return fallback ? `var(${name}, ${fallback})` : `var(${name})`',
    '}',
    '',
    'export interface StaticColorItem {',
    '  dark?: string',
    '  light?: string',
    '  name: string',
    '}',
    '',
    '/** Resolve static color value for canvas, SVG, or ECharts when CSS variables cannot be used */',
    'export function getStaticTokenColor(name: ColorToken, mode: \'light\' | \'dark\' = \'light\'): string | undefined {',
    '  const colorItems: ReadonlyArray<StaticColorItem> = Object.values(tokens.color)',
    '  const match = colorItems.find(t => t.name === name)',
    '  return match ? (mode === \'dark\' ? (match.dark ?? match.light) : match.light) : undefined',
    '}',
    '',
  ]

  return lines.join('\n')
}

/**
 * Main execution function for CLI usage.
 */
export function main(): void {
  const args = process.argv.slice(2)
  const isCheck = args.includes('--check')

  const rootDir = process.cwd()
  const inputCssPath = join(rootDir, 'src/styles/global.css')
  const outputTsPath = join(rootDir, 'src/lib/tokens.gen.ts')

  if (!existsSync(inputCssPath)) {
    console.error(`Error: input CSS file not found at ${inputCssPath}`)
    process.exit(1)
  }

  const cssContent = readFileSync(inputCssPath, 'utf8')
  const parseResult = parseCssTokens(cssContent)
  const generatedCode = generateTypeScript(parseResult)

  if (isCheck) {
    if (!existsSync(outputTsPath)) {
      console.error(`Check failed: ${outputTsPath} does not exist. Run "bun scripts/generate-tokens.ts" to generate.`)
      process.exit(1)
    }
    const currentCode = readFileSync(outputTsPath, 'utf8')
    if (currentCode !== generatedCode) {
      console.error(`Check failed: ${outputTsPath} is out of date. Run "bun scripts/generate-tokens.ts" to regenerate.`)
      process.exit(1)
    }
    console.log(`✓ ${outputTsPath} is up to date.`)
    return
  }

  writeFileSync(outputTsPath, generatedCode, 'utf8')
  console.log(`✓ Generated ${parseResult.tokens.length} design tokens in ${outputTsPath}`)
}

if (import.meta.main) {
  main()
}
