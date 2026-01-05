import React from 'react';
import { tv } from 'tailwind-variants';
import { getTagMetadata, type TagId } from '../lib/tags';

const tagBadge = tv({
  base: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors',
  defaultVariants: {
    color: 'default'
  },
  variants: {
    color: {
      brand: 'bg-brand-secondary/10 text-brand-secondary border-brand-secondary/20',
      default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
      error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    }
  }
});

interface TagBadgeProps {
  readonly id: TagId;
}

export const TagBadge: React.FC<TagBadgeProps> = ({ id }) => {
  const metadata = getTagMetadata(id);

  // We assume strict type safety, so metadata should exist if id is valid.
  // If not, we might crash or show a fallback, but per requirements we enforce valid tags.
  // The '?' in metadata check is just for runtime safety.
  if (!metadata) return null;

  return (
    <span
      className={tagBadge({ color: metadata.color })}
      title={metadata.description}
    >
      {metadata.label}
    </span>
  );
};
