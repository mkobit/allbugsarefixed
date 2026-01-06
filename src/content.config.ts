import { defineCollection, z } from "astro:content";
import { glob } from 'astro/loaders';
import { isValidLabel, FLATTENED_LABELS } from './lib/labels';

const blogCollection = defineCollection({
  loader: glob({
    base: "./src/content/blog",
    // Support both single files and folder-per-post index files
    // Explicitly exclude auxiliary files like outlines or data
    pattern: ["**/*.{md,mdx}", "!**/AGENTS.md", "!**/CLAUDE.md", "!**/_*.{md,mdx}"]
  }),
  schema: z.object({
    description: z.string(),
    // Enforce strict types for labels
    labels: z.array(z.string()).refine(
      (labels) => labels.every((label) => isValidLabel(label)),
      (labels) => {
        const invalidLabels = labels.filter(label => !isValidLabel(label));
        const validLabels = Object.keys(FLATTENED_LABELS).join(', ');
        return { message: `Invalid labels found: ${invalidLabels.join(', ')}. Valid labels are: ${validLabels}` };
      }
    ).optional(),

    // Optional: Explicit outline path if not using convention
    outline: z.string().optional(),

    pubDate: z.date(),

    // Blog Post Status
    status: z.enum(['concept', 'draft', 'review', 'published', 'locked']).default('published'),

    title: z.string(),
  }),
});

export const collections = {
  blog: blogCollection,
};
