import { defineCollection, z } from "astro:content";
import { glob } from 'astro/loaders';
import { LabelIdSchema } from './lib/labels';

const blogCollection = defineCollection({
  loader: glob({
    base: "./src/content/blog",
    // Support both single files and folder-per-post index files
    // Explicitly exclude auxiliary files like outlines or data
    pattern: ["**/*.{md,mdx}", "!**/AGENTS.md", "!**/CLAUDE.md", "!**/_*.{md,mdx}", "!**/notebook.md"]
  }),
  schema: z.object({
    description: z.string(),
    labels: z.array(LabelIdSchema).optional(),

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
