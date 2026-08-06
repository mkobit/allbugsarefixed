import { useEffect, useState } from 'react'
import type { MarkdownHeading } from 'astro'

interface Props {
  headings: MarkdownHeading[]
}

export function TableOfContents({ headings }: Props) {
  const filteredHeadings = headings.filter(h => h.depth <= 3)
  const [activeHeadingId, setActiveHeadingId] = useState<string>()

  useEffect(() => {
    const headingElements = headings
      .filter(h => h.depth <= 3)
      .map(h => document.getElementById(h.slug))
      .filter((el): el is HTMLElement => el !== null)

    if (headingElements.length === 0) return

    const observer = new IntersectionObserver(
      () => {
        const topEntry = headingElements.reduce<HTMLElement | undefined>((currentTop, header) => {
          const { bottom } = header.getBoundingClientRect()
          if (bottom < 0) return currentTop
          if (!currentTop) return header
          return bottom < currentTop.getBoundingClientRect().bottom ? header : currentTop
        }, undefined)
        if (topEntry) setActiveHeadingId(topEntry.id)
      },
      { threshold: 0.9 },
    )
    headingElements.forEach(header => observer.observe(header))

    return () => observer.disconnect()
  }, [headings])

  return (
    <nav className="toc">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 uppercase tracking-wider">
        On this page
      </h2>
      <ul className="space-y-2 text-sm">
        {filteredHeadings.map((heading) => {
          const isActive = heading.slug === activeHeadingId

          return (
            <li
              key={heading.slug}
              className={`border-l-2 transition-colors duration-200 ${
                isActive ? 'border-brand-primary' : 'border-transparent hover:border-brand-primary'
              }`}
              style={{ paddingLeft: `${0.5 + (heading.depth - 2) * 1}rem` }}
            >
              <a
                href={`#${heading.slug}`}
                aria-current={isActive ? 'location' : undefined}
                className={`block transition-colors duration-200 ${
                  isActive ? 'text-brand-primary' : 'text-gray-600 dark:text-gray-400 hover:text-brand-primary'
                }`}
              >
                {heading.text}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
