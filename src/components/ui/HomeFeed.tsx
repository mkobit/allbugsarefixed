import React, { useId, useState } from 'react'
import { getLabelMetadata, type LabelId } from '../../lib/labels'
import { BlogCard } from './BlogCard'
import styles from './HomeFeed.module.css'

export interface HomePost {
  readonly description: string
  readonly href: string
  readonly labels?: readonly LabelId[]
  readonly pubDate: string
  readonly title: string
}

export function getHomeTopics(posts: readonly HomePost[]) {
  return [...new Set(posts.flatMap(post => post.labels ?? []))]
    .filter(getLabelMetadata)
    .map(label => ({
      count: posts.filter(post => post.labels?.includes(label)).length,
      id: label,
      label: getLabelMetadata(label).label,
    }))
    .toSorted((first, second) => first.label.localeCompare(second.label))
}

export function groupHomePosts(posts: readonly HomePost[], topic: LabelId | null = null) {
  const filtered = posts
    .filter(post => topic === null || post.labels?.includes(topic))
    .toSorted((first, second) => Temporal.PlainDate.compare(
      Temporal.PlainDate.from(second.pubDate),
      Temporal.PlainDate.from(first.pubDate),
    ))
  const years = [...new Set(filtered.map(post => Temporal.PlainDate.from(post.pubDate).year))]

  return years.map(year => ({
    posts: filtered.filter(post => Temporal.PlainDate.from(post.pubDate).year === year),
    year,
  }))
}

export function HomeFeed({ posts }: Readonly<{ posts: readonly HomePost[] }>) {
  const [topic, setTopic] = useState<LabelId | null>(null)
  const feedId = useId()
  const topicsId = useId()
  const introId = useId()
  const topics = getHomeTopics(posts)
  const groups = groupHomePosts(posts, topic)
  const count = groups.reduce((total, group) => total + group.posts.length, 0)
  const topicName = topic === null ? null : getLabelMetadata(topic).label

  return (
    <div className={styles.home}>
      <section aria-labelledby={introId} className={styles.intro}>
        <p className={styles.eyebrow}>A personal journal by Mike Kobit</p>
        <h1 className={styles.title} id={introId}>Always something to figure out.</h1>
        <p className={styles.bio}>
          Hi, I’m Mike. I write about debugging, development, and what I learn along the way.
          This is my corner of the web for working through ideas and sharing the useful bits.
        </p>
        <nav aria-label="Start exploring" className={styles.quickLinks}>
          <a href={`#${feedId}`}>
            Read the posts
            <span aria-hidden="true">↓</span>
          </a>
          <a href="/about/">
            More about me
            <span aria-hidden="true">↗</span>
          </a>
          <span className={styles.stat}>{`${posts.length} ${posts.length === 1 ? 'post' : 'posts'} and counting`}</span>
        </nav>
      </section>

      {topics.length > 0 && (
        <section aria-labelledby={topicsId} className={styles.topics}>
          <h2 className={styles.sectionTitle} id={topicsId}>Explore by topic</h2>
          <p className={styles.hint}>Pick a topic to narrow the feed, or wander through everything.</p>
          <div aria-label="Filter posts by topic" className={styles.topicList} role="group">
            <button
              aria-controls={feedId}
              aria-pressed={topic === null}
              className={styles.topic}
              data-selected={topic === null ? 'true' : 'false'}
              onClick={() => setTopic(null)}
              type="button"
            >
              All topics
              <span className={styles.topicCount}>{posts.length}</span>
            </button>
            {topics.map(item => (
              <button
                aria-controls={feedId}
                aria-pressed={topic === item.id}
                className={styles.topic}
                data-selected={topic === item.id ? 'true' : 'false'}
                key={item.id}
                onClick={() => setTopic(item.id)}
                type="button"
              >
                {item.label}
                <span className={styles.topicCount}>{item.count}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby={`${feedId}-title`} className={styles.feed} id={feedId}>
        <div className={styles.feedHeader}>
          <h2 className={styles.sectionTitle} id={`${feedId}-title`}>Notes from the journey</h2>
        </div>
        <p aria-live="polite" aria-atomic="true" className={styles.summary} role="status">
          {`${count} ${count === 1 ? 'post' : 'posts'}${topicName ? ` about ${topicName}` : ' across all topics'}. Newest first.`}
        </p>
        {groups.length === 0
          ? <p className={styles.empty}>No posts yet. There’s always something new to figure out — check back soon.</p>
          : groups.map(group => (
              <section aria-labelledby={`${feedId}-${group.year}`} className={styles.year} key={group.year}>
                <div className={styles.yearHeader}>
                  <h3 className={styles.yearTitle} id={`${feedId}-${group.year}`}>{group.year}</h3>
                  <span className={styles.yearCount}>{`${group.posts.length} ${group.posts.length === 1 ? 'post' : 'posts'}`}</span>
                </div>
                <div className={styles.postGrid}>
                  {group.posts.map(post => (
                    <BlogCard
                      {...post}
                      headingLevel={4}
                      key={post.href}
                      variant={post.href === groups[0].posts[0].href ? 'featured' : 'compact'}
                    />
                  ))}
                </div>
              </section>
            ))}
        <a className={styles.archiveLink} href="/blog/">
          All posts
          <span aria-hidden="true">↗</span>
        </a>
      </section>
    </div>
  )
}
