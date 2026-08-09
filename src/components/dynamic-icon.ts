import dynamicIconImports from 'lucide-react/dynamicIconImports.mjs'

export type DynamicIconName = keyof typeof dynamicIconImports

// Kept as a pure, DOM/JSX-free module: this repo has no React-rendering test
// harness (no @testing-library/react, vitest only picks up src/**/*.test.ts,
// and its transform pipeline has no JSX plugin), so logic that needs unit
// coverage stays out of .tsx files.
export function isDynamicIconName(icon: unknown): icon is DynamicIconName {
  return typeof icon === 'string' && icon in dynamicIconImports
}
