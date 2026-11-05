import React, { useId } from 'react'
import { formatDateToHumanString } from '../../lib/date'
import { getLabelMetadata, type LabelId } from '../../lib/labels'
import styles from './BlogCard.module.css'

export interface BlogCardProps {
  readonly title: string
  readonly description: string
  readonly pubDate: Temporal.PlainDate | string
  readonly href: string
  readonly labels?: readonly LabelId[]
  readonly className?: string
  readonly headingLevel?: 2 | 3 | 4
  readonly variant?: 'default' | 'compact' | 'featured'
}

export function BlogCard({
  title,
  description,
  pubDate,
  href,
  labels,
  className,
  headingLevel = 2,
  variant = 'default',
}: Readonly<BlogCardProps>) {
  const titleId = useId()
  const Heading = `h${headingLevel}` as 'h2' | 'h3' | 'h4'
  const date = Temporal.PlainDate.from(pubDate)
  const visibleLabels = labels?.filter(getLabelMetadata) ?? []

  return (
    <a
      aria-labelledby={titleId}
      className={[styles.card, className].filter(Boolean).join(' ')}
      data-variant={variant}
      href={href}
    >
      <time className={styles.date} dateTime={date.toString()}>{formatDateToHumanString(date)}</time>
      <Heading className={styles.title} id={titleId}>{title}</Heading>
      {description && <p className={styles.description}>{description}</p>}
      {visibleLabels.length > 0 && (
        <ul aria-label="Topics" className={styles.labels}>
          {visibleLabels.map(label => (
            <li className={styles.label} key={label}>{getLabelMetadata(label).label}</li>
          ))}
        </ul>
      )}
    </a>
  )
}
