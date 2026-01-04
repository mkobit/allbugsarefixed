import React from 'react';
import { DataInteractive } from '@headlessui/react'
import { tv, type VariantProps } from 'tailwind-variants'
import { cn } from '../../lib/ui'

const linkStyles = tv({
  base: 'font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-md',
  defaultVariants: {
    variant: 'default'
  },
  variants: {
    variant: {
      default: 'text-gray-600 dark:text-gray-400 hover:text-brand-primary',
      nav: 'text-sm font-medium hover:text-brand-primary transition-colors',
      primary: 'text-brand-primary hover:text-brand-secondary'
    }
  }
})

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement>, VariantProps<typeof linkStyles> {}

export function Link({ className, variant, ...props }: Readonly<LinkProps>) {
  return (
    <DataInteractive>
      <a className={cn(linkStyles({ variant }), className)} {...props} />
    </DataInteractive>
  )
}
