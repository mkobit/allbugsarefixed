import React from "react";
import { tv } from "tailwind-variants";
import { cn } from "../lib/ui";
import { Time } from "./ui/time";
import { LabelBadge } from "./LabelBadge";
import type { LabelId } from "../lib/labels";

const cardStyles = tv({
  base: "block p-6 border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors",
});

interface BlogCardProps {
  readonly title: string;
  readonly description: string;
  readonly pubDate: Date;
  readonly href: string;
  readonly labels?: readonly LabelId[];
  readonly className?: string;
}

export function BlogCard({ title, description, pubDate, href, labels, className }: Readonly<BlogCardProps>) {
  return (
    <a href={href} className={cn(cardStyles(), className)}>
      <h2 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{title}</h2>
      <p className="font-normal text-gray-700 dark:text-gray-400">{description}</p>

      {labels && labels.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {labels.map((label) => (
            <LabelBadge key={label} id={label} />
          ))}
        </div>
      )}

      <div className="mt-4">
        <Time date={pubDate} />
      </div>
    </a>
  );
}
