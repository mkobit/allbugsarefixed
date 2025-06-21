import { defineCollection, z } from "astro:content";

const blogCollection = defineCollection({
  schema: z.object({
    description: z.string(),
    pubDate: z.date(),
    tags: z.array(z.string()).optional(),
    title: z.string(),
  }),
  type: "content",
});

export const collections = {
  blog: blogCollection,
};
