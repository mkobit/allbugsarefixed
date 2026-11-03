import { globSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { tokenNames } from '../src/lib/tokens.gen'

export interface TokenViolation {
  readonly file: string
  readonly line: number
  readonly message: string
}

export interface CssVerificationResult {
  readonly checkedFiles: ReadonlyArray<string>
  readonly violations: ReadonlyArray<TokenViolation>
}

/** Allowed files where raw design token values are defined */
export const ALLOWED_TOKEN_FILES = new Set<string>([
  'src/styles/global.css',
])

/** Legacy/external files excluded from token verification until their migration phase */
export const EXCLUDED_FILES = new Set<string>([
  // Shiki syntax highlighting styles are scheduled for migration in Phase 2 (native-article-typography)
  'src/styles/shiki.css',
])

const HEX_COLOR_REGEX = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})\b/g
const RGB_HSL_COLOR_REGEX = /\b(?:rgb|rgba|hsl|hsla)\s*\(/gi
const CSS_VAR_REGEX = /var\(\s*(--[a-zA-Z0-9_-]+)/g

/**
 * Normalizes a file path to use forward slashes and relative to repository root.
 */
export function normalizePath(filePath: string): string {
  const rootDir = process.cwd()
  const resolved = resolve(filePath)
  const relative = resolved.startsWith(rootDir) ? resolved.slice(rootDir.length + 1) : filePath
  return relative.replace(/\\/g, '/')
}

/**
 * Strips comments from content while preserving line counts and line indices.
 */
export function stripComments(content: string): string {
  // Replace block comment characters (except newlines) with spaces
  return content.replace(/\/\*[\s\S]*?\*\//g, match => match.replace(/[^\n]/g, ' '))
}

/**
 * Validates a single file's content against CSS architectural rules.
 */
export function verifyCssContent(
  filePath: string,
  content: string,
  declaredTokens: ReadonlySet<string>,
): ReadonlyArray<TokenViolation> {
  const normalized = normalizePath(filePath)
  if (EXCLUDED_FILES.has(normalized)) {
    return []
  }

  const isAllowedTokenFile = ALLOWED_TOKEN_FILES.has(normalized)
  const sanitizedContent = stripComments(content)
  const lines = sanitizedContent.split('\n')

  return lines.flatMap((lineText, index) => {
    const lineNumber = index + 1
    const cleanLine = lineText
      .replace(/\/\/.*/g, '')
      .replace(/url\(\s*#[^)]+\)/gi, '')

    // 1. Check CSS custom property references
    const varMatches = Array.from(cleanLine.matchAll(CSS_VAR_REGEX))
    const varViolations: ReadonlyArray<TokenViolation> = varMatches
      .map(match => match[1])
      .filter(varName => !varName.startsWith('--_') && !declaredTokens.has(varName))
      .map(varName => ({
        file: normalized,
        line: lineNumber,
        message: `Undeclared CSS token "${varName}". Add to src/styles/global.css and run "bun run tokens:generate".`,
      }))

    if (isAllowedTokenFile) {
      return varViolations
    }

    // 2. Ban forbidden raw hex colors and RGB/HSL literals outside allowed token definition files
    const hexMatches = Array.from(cleanLine.matchAll(HEX_COLOR_REGEX))
    const hexViolations: ReadonlyArray<TokenViolation> = hexMatches.map(match => ({
      file: normalized,
      line: lineNumber,
      message: `Forbidden raw hex color "${match[0]}". Use a design token var(--...) from src/lib/tokens.gen.ts.`,
    }))

    const rgbHslMatches = Array.from(cleanLine.matchAll(RGB_HSL_COLOR_REGEX))
    const rgbHslViolations: ReadonlyArray<TokenViolation> = rgbHslMatches.map((match) => {
      const literalName = match[0].replace(/\s*\($/, '')
      return {
        file: normalized,
        line: lineNumber,
        message: `Forbidden raw ${literalName.toUpperCase()} literal. Use a design token var(--...) from src/lib/tokens.gen.ts.`,
      }
    })

    return [...varViolations, ...hexViolations, ...rgbHslViolations]
  })
}

/**
 * Scans all matching files and returns all CSS violations.
 */
export function runCssVerification(files?: ReadonlyArray<string>): CssVerificationResult {
  const declaredTokens = new Set<string>(Object.values(tokenNames))
  const targetFiles = files ?? globSync('src/**/*.{css,astro}')

  const checkedFiles = targetFiles
    .map(normalizePath)
    .filter(file => !EXCLUDED_FILES.has(file))

  const violations = checkedFiles.flatMap((file) => {
    const content = readFileSync(file, 'utf8')
    return verifyCssContent(file, content, declaredTokens)
  })

  return {
    checkedFiles,
    violations,
  }
}

/**
 * Main CLI runner.
 */
export function main(): void {
  const { checkedFiles, violations } = runCssVerification()

  if (violations.length > 0) {
    console.error(`Found ${violations.length} CSS verification violations:`)
    violations.forEach((v) => {
      console.error(`  ${v.file}:${v.line} - ${v.message}`)
    })
    process.exit(1)
  }

  console.log(`Verified CSS across ${checkedFiles.length} files. Zero violations.`)
}

if (import.meta.main) {
  main()
}
