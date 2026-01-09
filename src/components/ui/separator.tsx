import React from 'react';
import { cn } from '../../lib/ui';

// Since the user used a text slash "/", maybe they want a semantic separator or just a visual one.
// The slash in the blog header is inline text.
// Let's make a simple InlineSeparator component or just export a component that renders the slash consistently.
// Or actually, a general Separator is usually a line.
// Given the context "Time, span, and others", maybe I should create a "MetaSeparator" or just use a span with consistent style.

export function SlashSeparator({ className }: Readonly<{ className?: string }>) {
  return (
    <span className={cn("text-gray-300 dark:text-gray-700 font-mono", className)} aria-hidden="true">
      /
    </span>
  );
}
