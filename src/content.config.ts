import { defineCollection, z } from "astro:content";
import { glob } from 'astro/loaders';

const blogCollection = defineCollection({
  // Use a pattern that explicitly excludes agents.md if possible, or fix the ignore array.
  // The 'ignore' option in glob() takes patterns.
  loader: glob({ base: "./src/content/blog", pattern: ["**/*.{md,mdx}", "!**/AGENTS.md", "!**/CLAUDE.md"] }),
  schema: z.object({
    description: z.string(),
    pubDate: z.date(),
    tags: z.array(z.string()).optional(),
    title: z.string(),
  }),
});

export const collections = {
  blog: blogCollection,
};
