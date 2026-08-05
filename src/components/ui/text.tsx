import React from 'react'
import { tv, type VariantProps } from 'tailwind-variants'
import { cn } from '../../lib/ui'

const textStyles = tv({
  base: 'text-ui-text-muted',
  defaultVariants: {
    size: 'base',
    variant: 'default',
  },
  variants: {
    size: {
      base: 'text-base',
      lg: 'text-lg',
      sm: 'text-sm',
      xs: 'text-xs',
    },
    variant: {
      default: '',
      dim: 'text-ui-text-dim',
      mono: 'font-mono',
      muted: 'text-ui-text-muted',
    },
  },
})

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement>, VariantProps<typeof textStyles> {
  readonly as?: React.ElementType
}

export function Text({ className, variant, size, as: Component = 'p', ...props }: Readonly<TextProps>) {
  return <Component className={cn(textStyles({ size, variant }), className)} {...props} />
}
