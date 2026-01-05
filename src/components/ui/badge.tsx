import React from 'react'
import { tv, type VariantProps } from 'tailwind-variants'

const badgeStyles = tv({
  base: 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  defaultVariants: {
    variant: 'default',
  },
  variants: {
    variant: {
      accent: 'bg-brand-accent text-zinc-900',
      default: 'bg-brand-surface text-brand-primary',
      primary: 'bg-brand-primary text-white',
      secondary: 'bg-brand-secondary text-white',
    },
  },
})

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeStyles>

export function Badge({ variant, className, ...props }: Readonly<BadgeProps>) {
  return (
    <span className={badgeStyles({ className, variant })} {...props} />
  )
}
