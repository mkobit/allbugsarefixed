import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface IconBlockProps {
  icon: LucideIcon;
  label?: string;
  color?: string; // CSS class for text color, e.g., 'text-blue-500'
  bgColor?: string; // CSS class for background, e.g., 'bg-blue-50'
  borderColor?: string; // CSS class for border, e.g., 'border-blue-100'
}

export default function IconBlock({
  icon: IconComponent,
  label,
  color = 'text-gray-500',
  bgColor = 'bg-gray-50 dark:bg-gray-800',
  borderColor = 'border-gray-200 dark:border-gray-700'
}: IconBlockProps) {
  if (!IconComponent) {
    return null;
  }

  return (
    <div className={`flex flex-col items-center p-4 rounded-lg border ${bgColor} ${borderColor}`}>
      <IconComponent className={`w-8 h-8 mb-2 ${color}`} aria-hidden="true" />
      {label && <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</span>}
    </div>
  );
}
