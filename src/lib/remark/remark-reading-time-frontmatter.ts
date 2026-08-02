import type { Plugin, Transformer } from 'unified'
import type { Root } from 'mdast'

/**
 * Bridges remark-reading-time's `file.data.readingTime` into
 * `file.data.astro.frontmatter.readingTime`, which is what Astro's
 * `render()` exposes as `remarkPluginFrontmatter`. Must run after
 * remarkReadingTime in the same plugin list, since that's what sets
 * `file.data.readingTime` in the first place.
 */
export const remarkReadingTimeFrontmatter: Plugin<[], Root> = () => {
  const transformer: Transformer<Root> = (_tree, file) => {
    const readingTime = file.data.readingTime
    if (!readingTime) return

    file.data.astro ??= {}
    file.data.astro.frontmatter ??= {}
    file.data.astro.frontmatter.readingTime = readingTime
  }

  return transformer
}
