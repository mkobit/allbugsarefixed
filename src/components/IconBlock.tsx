import dynamicIconImports from 'lucide-react/dynamicIconImports.mjs'
import type { LucideIcon } from 'lucide-react'
import React, { Suspense, lazy, useMemo } from 'react'
import { isDynamicIconName } from './dynamic-icon.ts'

// Design tokens for semantic colors
export type IconVariant = 'default' | 'brand' | 'success' | 'warning' | 'danger' | 'info'

const VARIANT_STYLES: Record<IconVariant, { bg: string, border: string, color: string }> = {
  brand: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-100 dark:border-purple-800',
    color: 'text-brand-primary',
  },
  danger: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-100 dark:border-red-800',
    color: 'text-red-500',
  },
  default: {
    bg: 'bg-gray-50 dark:bg-gray-800',
    border: 'border-gray-200 dark:border-gray-700',
    color: 'text-gray-500',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-100 dark:border-blue-800',
    color: 'text-blue-500',
  },
  success: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-100 dark:border-green-800',
    color: 'text-green-500',
  },
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-100 dark:border-yellow-800',
    color: 'text-yellow-500',
  },
}

const FallbackIcon = ({ className }: Readonly<{ className: string }>) => (
  <div className={`${className} animate-pulse rounded-full bg-gray-300 opacity-50 dark:bg-gray-600`} />
)

function ResolvedIcon({ icon, className }: Readonly<{ icon: LucideIcon | string, className: string }>) {
  // useMemo keeps the lazy() component identity stable across re-renders with
  // the same icon name -- calling lazy() fresh every render would remount the
  // Suspense boundary and re-trigger the dynamic import each time.
  const LazyIcon = useMemo(() => (isDynamicIconName(icon) ? lazy(dynamicIconImports[icon]) : null), [icon])

  if (typeof icon === 'string') {
    if (!LazyIcon) {
      return null
    }

    return (
      <Suspense fallback={<FallbackIcon className={className} />}>
        <LazyIcon className={className} aria-hidden="true" />
      </Suspense>
    )
  }

  const IconComponent = icon
  return <IconComponent className={className} aria-hidden="true" />
}

interface IconBlockProps {
  readonly icon: LucideIcon | string
  readonly label?: string
  readonly variant?: IconVariant
}

export default function IconBlock({ icon, label, variant = 'default' }: Readonly<IconBlockProps>) {
  if (!icon) {
    return null
  }

  const styles = VARIANT_STYLES[variant]

  return (
    <div className={`flex flex-col items-center p-4 rounded-lg border ${styles.bg} ${styles.border}`}>
      <ResolvedIcon icon={icon} className={`w-8 h-8 mb-2 ${styles.color}`} />
      {label && <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</span>}
    </div>
  )
}
