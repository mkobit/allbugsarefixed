import React from "react";
import { tv } from "tailwind-variants";
import { getLabelMetadata, type LabelId } from "../lib/labels";

// LabelBadge: Renders a classifier label for a blog post.
// Not to be confused with Callouts, which are content annotations.
const labelBadge = tv({
  base: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700",
});

interface LabelBadgeProps {
  readonly id: LabelId;
}

export const LabelBadge: React.FC<LabelBadgeProps> = ({ id }) => {
  const metadata = getLabelMetadata(id);

  if (!metadata) return null;

  return (
    <span className={labelBadge()} title={metadata.description}>
      {metadata.label}
    </span>
  );
};
