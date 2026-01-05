import React from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import type { LucideIcon } from 'lucide-react';

const iconBlockStyles = tv({
  base: 'p-3 rounded-lg mb-3',
  defaultVariants: {
    variant: 'brand',
  },
  variants: {
    variant: {
      brand: 'bg-brand-surface text-brand-primary',
      danger: 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800 text-red-500',
      default: 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500',
      info: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
      success: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
      warning: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
    },
  },
});

interface IconBlockProps extends VariantProps<typeof iconBlockStyles> {
  icon: LucideIcon;
  label?: string;
}

const IconBlock: React.FC<Readonly<IconBlockProps>> = ({ icon: Icon, label, variant }) => {
  return (
    <div className="flex flex-col items-center p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 shadow-sm hover:shadow-md transition-shadow">
      <div className={iconBlockStyles({ variant })}>
        <Icon className="w-6 h-6" />
      </div>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </span>
    </div>
  );
};

export default IconBlock;
