import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'
import { LabelIdSchema } from './lib/labels'
import { Temporal } from '@js-temporal/polyfill'

const blogCollection = defineCollection({
  loader: glob({
    pattern: [
      'src/content/blog/**/*.{md,mdx}',
      '!src/content/blog/**/AGENTS.md',
      '!src/content/blog/**/CLAUDE.md',
      '!src/content/blog/**/_*.{md,mdx}',
      '!src/content/blog/**/notebook.md',
    ],
  }),
  schema: z.object({
    description: z.string(),
    labels: z.array(LabelIdSchema).optional(),

    // Optional: Explicit outline path if not using convention
    outline: z.string().optional(),

    pubDate: z
      .date()
      .transform((d: Date) => {
        return Temporal.Instant.fromEpochMilliseconds(d.getTime()).toZonedDateTimeISO('UTC').toPlainDate().toString()
      }),

    // Blog Post Status
    status: z.enum(['concept', 'draft', 'review', 'published', 'locked']).default('published'),

    title: z.string(),
  }),
})

export const collections = {
  blog: blogCollection,
}
