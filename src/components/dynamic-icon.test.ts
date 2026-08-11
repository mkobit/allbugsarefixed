import { describe, expect, it } from 'bun:test'
import { isDynamicIconName } from './dynamic-icon.ts'

describe('isDynamicIconName', () => {
  it('accepts a known lucide-react dynamic icon name', () => {
    expect(isDynamicIconName('zap')).toBe(true)
    expect(isDynamicIconName('shield-check')).toBe(true)
  })

  it('rejects an unknown icon name string', () => {
    expect(isDynamicIconName('not-a-real-icon')).toBe(false)
  })

  it('rejects non-string values, including component references', () => {
    expect(isDynamicIconName(undefined)).toBe(false)
    expect(isDynamicIconName(null)).toBe(false)
    expect(isDynamicIconName(() => null)).toBe(false)
  })
})
