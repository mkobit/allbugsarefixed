import type { MarkdownHeading } from 'astro'

interface Props {
  headings: MarkdownHeading[]
}

export function TableOfContents({ headings }: Props) {
  const filteredHeadings = headings.filter(h => h.depth <= 3)

  return (
    <nav className="toc">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 uppercase tracking-wider">
        On this page
      </h2>
      <ul className="space-y-2 text-sm">
        {filteredHeadings.map(heading => (
          <li
            key={heading.slug}
            className="border-l-2 border-transparent hover:border-brand-primary transition-colors duration-200"
            style={{ paddingLeft: `${0.5 + (heading.depth - 2) * 1}rem` }}
          >
            <a
              href={`#${heading.slug}`}
              className="block text-gray-600 dark:text-gray-400 hover:text-brand-primary transition-colors duration-200"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
