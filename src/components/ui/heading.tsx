import React from 'react'
import { tv, type VariantProps } from 'tailwind-variants'
import { cn } from '../../lib/ui'

const headingStyles = tv({
  base: 'font-bold tracking-tight text-brand-text scroll-mt-20',
  defaultVariants: {
    level: 'h1',
  },
  variants: {
    level: {
      h1: 'text-4xl md:text-5xl font-extrabold mb-3 mt-6 leading-tight',
      h2: 'text-3xl md:text-4xl font-bold mb-2 mt-5',
      h3: 'text-2xl md:text-3xl font-bold mb-2 mt-4',
      h4: 'text-xl md:text-2xl font-semibold mb-1 mt-3',
      h5: 'text-lg md:text-xl font-semibold mb-1 mt-3',
      h6: 'text-base md:text-lg font-semibold mb-1 mt-3',
    },
  },
})

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement>, Omit<VariantProps<typeof headingStyles>, 'level'> {
  readonly as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  readonly level?: HeadingLevel
}

export function Heading({ className, level, as, children, id, ...props }: Readonly<HeadingProps>) {
  const Component = as ?? (`h${level || 1}` as React.ElementType)
  const levelVariant = level !== undefined ? (`h${level}` as const) : undefined
  return (
    <Component id={id} className={cn(headingStyles({ level: levelVariant }), 'group', className)} {...props}>
      {children}
      {id && (
        <a
          href={`#${id}`}
          className="ml-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity no-underline font-normal"
          aria-label="Link to this section"
        >
          #
        </a>
      )}
    </Component>
  )
}
