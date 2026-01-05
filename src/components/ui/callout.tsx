import React from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../lib/ui';

const calloutStyles = tv({
  base: 'p-4 my-6 rounded-lg border flex gap-3',
  defaultVariants: {
    type: 'info'
  },
  variants: {
    type: {
      error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
      info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
      tip: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200',
      warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
    }
  },
});

const icons = {
  error: '🚫',
  info: 'ℹ️',
  tip: '💡',
  warning: '⚠️',
};

export interface CalloutProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof calloutStyles> {
  readonly title?: string;
  readonly type?: 'info' | 'warning' | 'tip' | 'error';
}

export function Callout({ className, title, type = 'info', children, ...props }: Readonly<CalloutProps>) {
  const icon = icons[type || 'info'];

  return (
    <div className={cn(calloutStyles({ type }), className)} {...props}>
      <div className="flex-shrink-0 select-none text-xl">
        {icon}
      </div>
      <div className="w-full min-w-0">
        {title && <h3 className="font-bold mb-1 text-inherit">{title}</h3>}
        <div className="prose prose-sm dark:prose-invert max-w-none text-inherit prose-p:my-0 prose-a:text-current">
          {children}
        </div>
      </div>
    </div>
  );
}
