import { defineCollection, z } from "astro:content";

const tagSchema: z.ZodType<any> = z.object({
  name: z.string(),
  children: z.array(z.lazy(() => tagSchema)).optional(),
});

const blogCollection = defineCollection({
  schema: z.object({
    description: z.string(),
    pubDate: z.date(),
    tags: z.array(tagSchema).optional(),
    title: z.string(),
    draft: z.boolean().optional(),
  }),
  type: "content",
});

export const collections = {
  blog: blogCollection,
};
