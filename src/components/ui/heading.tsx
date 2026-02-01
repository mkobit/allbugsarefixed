import React from 'react'
import { tv, type VariantProps } from 'tailwind-variants'
import { cn } from '../../lib/ui'

const headingStyles = tv({
  base: 'font-bold tracking-tight text-gray-900 dark:text-brand-text',
  defaultVariants: {
    level: 1,
  },
  variants: {
    level: {
      1: 'text-4xl md:text-5xl font-extrabold mb-3 mt-6 leading-tight',
      2: 'text-3xl md:text-4xl font-bold mb-2 mt-5',
      3: 'text-2xl md:text-3xl font-bold mb-2 mt-4',
      4: 'text-xl md:text-2xl font-semibold mb-1 mt-3',
      5: 'text-lg md:text-xl font-semibold mb-1 mt-3',
      6: 'text-base md:text-lg font-semibold mb-1 mt-3',
    },
  },
})

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement>, VariantProps<typeof headingStyles> {
  readonly as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export function Heading({ className, level, as, ...props }: Readonly<HeadingProps>) {
  const Component = as ?? (`h${level || 1}` as React.ElementType)
  return <Component className={cn(headingStyles({ level }), className)} {...props} />
}
