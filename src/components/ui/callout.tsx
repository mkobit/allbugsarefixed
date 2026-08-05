import React from 'react'
import { tv, type VariantProps } from 'tailwind-variants'
import { cn } from '../../lib/ui'

const calloutStyles = tv({
  base: 'p-3 sm:p-4 my-6 rounded-lg border flex items-start gap-3 w-full',
  defaultVariants: {
    type: 'info',
  },
  variants: {
    type: {
      error: 'bg-callout-error-bg border-callout-error-border text-callout-error-text',
      info: 'bg-callout-info-bg border-callout-info-border text-callout-info-text',
      tip: 'bg-callout-tip-bg border-callout-tip-border text-callout-tip-text',
      warning: 'bg-callout-warning-bg border-callout-warning-border text-callout-warning-text',
    },
  },
})

const icons = {
  error: '🚫',
  info: 'ℹ️',
  tip: '💡',
  warning: '⚠️',
}

export interface CalloutProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof calloutStyles> {
  readonly title?: string
  readonly type?: 'info' | 'warning' | 'tip' | 'error'
}

export function Callout({ className, title, type = 'info', children, ...props }: Readonly<CalloutProps>) {
  const icon = icons[type || 'info']

  return (
    <div className={cn(calloutStyles({ type }), className)} {...props}>
      <div className="flex-shrink-0 select-none text-xl leading-none">{icon}</div>
      <div className="flex flex-col gap-1 min-w-0 w-full">
        {title && <h3 className="font-bold text-inherit leading-tight m-0">{title}</h3>}
        <div className="prose prose-sm dark:prose-invert max-w-none text-inherit prose-p:my-0 prose-a:text-current">
          {children}
        </div>
      </div>
    </div>
  )
}
