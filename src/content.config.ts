import { defineCollection, z } from "astro:content";
import { glob } from 'astro/loaders';
import { isValidTag, TAG_DEFINITIONS } from './lib/tags';

const blogCollection = defineCollection({
  loader: glob({
    base: "./src/content/blog",
    // Support both single files and folder-per-post index files
    // Explicitly exclude auxiliary files like outlines or data
    pattern: ["**/*.{md,mdx}", "!**/AGENTS.md", "!**/CLAUDE.md", "!**/outline.md", "!**/_*.{md,mdx}"]
  }),
  schema: z.object({
    description: z.string(),
    // Optional: Explicit outline path if not using convention
    outline: z.string().optional(),

    pubDate: z.date(),

    // Blog Post Status
    status: z.enum(['concept', 'draft', 'review', 'published', 'locked']).default('published'),
    // Enforce strict types for tags
    tags: z.array(z.string()).refine(
      (tags) => tags.every((tag) => isValidTag(tag)),
      (tags) => {
        const invalidTags = tags.filter(tag => !isValidTag(tag));
        const validTags = Object.keys(TAG_DEFINITIONS).join(', ');
        return { message: `Invalid tags found: ${invalidTags.join(', ')}. Valid tags are: ${validTags}` };
      }
    ).optional(),

    title: z.string(),
  }),
});

export const collections = {
  blog: blogCollection,
};
