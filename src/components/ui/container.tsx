import React from 'react'
import { tv, type VariantProps } from 'tailwind-variants'
import { cn } from '../../lib/ui'

const containerStyles = tv({
  base: 'mx-auto px-4 md:px-6 w-full',
  defaultVariants: {
    size: 'default',
  },
  variants: {
    size: {
      default: 'max-w-5xl',
      full: 'max-w-full',
      lg: 'max-w-7xl',
      sm: 'max-w-3xl',
    },
  },
})

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof containerStyles> {}

export function Container({ className, size, ...props }: Readonly<ContainerProps>) {
  return <div className={cn(containerStyles({ size }), className)} {...props} />
}
