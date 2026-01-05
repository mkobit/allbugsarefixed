import React from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../lib/ui';

const textStyles = tv({
  base: 'text-gray-500 dark:text-gray-400',
  defaultVariants: {
    size: 'base',
    variant: 'default',
  },
  variants: {
    size: {
      base: 'text-base',
      lg: 'text-lg',
      sm: 'text-sm',
      xs: 'text-xs'
    },
    variant: {
      default: '',
      dim: 'text-gray-300 dark:text-gray-700',
      mono: 'font-mono',
      muted: 'text-gray-500 dark:text-gray-400',
    },
  },
});

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement>, VariantProps<typeof textStyles> {
  readonly as?: React.ElementType;
}

export function Text({ className, variant, size, as: Component = 'p', ...props }: Readonly<TextProps>) {
  return (
    <Component className={cn(textStyles({ size, variant }), className)} {...props} />
  );
}
