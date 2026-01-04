import { Button as HeadlessButton } from '@headlessui/react'
import type { ButtonProps as HeadlessButtonProps } from '@headlessui/react'
import React from 'react'
import { tv, type VariantProps } from 'tailwind-variants'

const buttonStyles = tv({
  base: 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 dark:focus:ring-zinc-100 dark:focus:ring-offset-zinc-900',
  defaultVariants: {
    size: 'md',
    variant: 'primary',
  },
  variants: {
    size: {
      lg: 'px-6 py-3 text-lg',
      md: 'px-4 py-2 text-base',
      sm: 'px-2 py-1 text-sm',
    },
    variant: {
      ghost: 'text-zinc-900 hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800',
      outline: 'border border-zinc-200 text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800',
      primary: 'bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300',
      secondary: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700',
    },
  },
})

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonStyles> {
  readonly asChild?: boolean;
  readonly className?: string;
  readonly fullWidth?: boolean;
}

export const Button = ({ 
  className, 
  fullWidth, 
  size, 
  variant, 
  ...props 
}: Readonly<ButtonProps>) => {
  return (
    <HeadlessButton
      {...props}
      className={buttonStyles({ className, size, variant })}
    />
  )
}
