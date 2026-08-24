import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'
import { LabelIdSchema } from './lib/labels'

const blogCollection = defineCollection({
  loader: glob({
    base: 'src/content/blog',
    pattern: [
      '**/*.{md,mdx}',
      '!**/AGENTS.md',
      '!**/CLAUDE.md',
      '!**/_*.{md,mdx}',
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

    title: z.string().min(1).max(200),

    // Build visibility. hidden: dev-only, no prod page built.
    // unlisted: prod page built, reachable by direct URL, excluded from listings/search.
    // visible: prod page built and listed everywhere.
    visibility: z.enum(['hidden', 'unlisted', 'visible']),
  }),
})

export const collections = {
  blog: blogCollection,
}
