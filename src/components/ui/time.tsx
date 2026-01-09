import React from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../lib/ui';
import { formatDateToHumanString } from '../../lib/date';
import type { Temporal } from '@js-temporal/polyfill';

// eslint-disable-next-line functional/prefer-immutable-types
const timeStyles = tv({
  base: 'font-mono text-sm text-gray-500 dark:text-gray-400',
  defaultVariants: {
    variant: 'default',
  },
  variants: {
    variant: {
      default: '',
      muted: 'text-gray-500 dark:text-gray-400',
    },
  },
});

export type TimeProps = Readonly<React.TimeHTMLAttributes<HTMLTimeElement>> & Readonly<VariantProps<typeof timeStyles>> & {
  readonly date: Readonly<Date | Temporal.PlainDate>;
  readonly format?: boolean;
};

export function Time({ className, variant, date, format = true, children, ...props }: Readonly<TimeProps>): Readonly<React.JSX.Element> {
  const dateTimeString = date instanceof Date ? date.toISOString() : date.toString();
  const content = children || (format ? formatDateToHumanString(date) : dateTimeString);

  return (
    <time dateTime={dateTimeString} className={cn(timeStyles({ variant }), className)} {...props}>
      {content}
    </time>
  );
}
