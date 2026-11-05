import { describe, expect, it } from 'bun:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { JSDOM } from 'jsdom'
import { BlogCard as LegacyBlogCard } from '../BlogCard'
import { BlogCard } from './BlogCard'
import { getHomeTopics, groupHomePosts, HomeFeed, type HomePost } from './HomeFeed'

const posts: readonly HomePost[] = [
  { description: 'An older note', href: '/blog/older/', labels: ['web', 'web'], pubDate: '2024-12-31', title: 'Older note' },
  { description: 'A new note', href: '/blog/newest/', labels: ['react', 'web'], pubDate: '2026-02-03', title: 'Newest note' },
  { description: '', href: '/blog/unlabelled/', pubDate: '2025-01-01', title: 'Unlabelled note' },
  { description: 'Another note', href: '/blog/earlier/', labels: ['react'], pubDate: '2026-01-01', title: 'Earlier note' },
]

describe('home feed data', () => {
  it('groups years and posts newest first without changing input order', () => {
    const groups = groupHomePosts(posts)
    expect(groups.map(group => group.year)).toEqual([2026, 2025, 2024])
    expect(groups[0].posts.map(post => post.title)).toEqual(['Newest note', 'Earlier note'])
    expect(posts[0].title).toBe('Older note')
  })

  it('counts each post once per topic and uses alphabetized label metadata', () => {
    expect(getHomeTopics(posts)).toEqual([
      { count: 2, id: 'react', label: 'React' },
      { count: 2, id: 'web', label: 'Web Development' },
    ])
  })

  it('filters topics and removes years without matching posts', () => {
    const groups = groupHomePosts(posts, 'react')
    expect(groups.map(group => group.year)).toEqual([2026])
    expect(groups[0].posts).toHaveLength(2)
    expect(groupHomePosts(posts, 'finance')).toEqual([])
  })

  it('handles an empty collection or posts without labels', () => {
    expect(groupHomePosts([])).toEqual([])
    expect(getHomeTopics([])).toEqual([])
    expect(getHomeTopics([posts[2]])).toEqual([])
  })
})

describe('home feed markup', () => {
  it('renders the intro, accessible topic controls, year headings, and each post once', () => {
    const document = new JSDOM(renderToStaticMarkup(<HomeFeed posts={posts} />)).window.document
    expect(document.querySelectorAll('h1')).toHaveLength(1)
    expect(document.querySelector('h1')?.textContent).toBe('Always something to figure out.')
    expect([...document.querySelectorAll('h3')].map(heading => heading.textContent)).toEqual(['2026', '2025', '2024'])
    expect(document.querySelectorAll('h4')).toHaveLength(4)
    expect(document.querySelectorAll('a[data-variant="featured"]')).toHaveLength(1)
    expect(document.querySelector('[aria-pressed="true"]')?.textContent).toContain('All topics')
    expect(document.querySelector('[role="status"]')?.textContent).toBe('4 posts across all topics. Newest first.')
    expect(document.querySelector('button[aria-controls]')?.getAttribute('aria-controls')).toBe(
      document.querySelector('[role="status"]')?.parentElement?.id ?? '',
    )
    expect(document.querySelectorAll('a[href="/blog/newest/"]')).toHaveLength(1)
    expect(document.querySelector('a[href^="/blog/"]')?.getAttribute('href')).toBe('/blog/newest/')
  })

  it('renders an empty state without empty topic controls or year sections', () => {
    const document = new JSDOM(renderToStaticMarkup(<HomeFeed posts={[]} />)).window.document
    expect(document.body.textContent).toContain('No posts yet.')
    expect(document.querySelectorAll('button')).toHaveLength(0)
    expect(document.querySelectorAll('h3')).toHaveLength(0)
    expect(document.querySelector('[role="status"]')?.textContent).toContain('0 posts')
  })

  it('uses singular counts for a single post', () => {
    const document = new JSDOM(renderToStaticMarkup(<HomeFeed posts={[posts[1]]} />)).window.document
    expect(document.querySelector('[role="status"]')?.textContent).toContain('1 post across')
    expect(document.body.textContent).toContain('1 post and counting')
  })
})

describe('blog card compatibility', () => {
  it('keeps the legacy export pointed to the UI implementation', () => {
    expect(LegacyBlogCard).toBe(BlogCard)
  })

  it('renders semantic dates, metadata labels, and the default heading and variant', () => {
    const document = new JSDOM(renderToStaticMarkup(<BlogCard {...posts[1]} className="custom-card" />)).window.document
    const card = document.querySelector('a')
    expect(card?.getAttribute('href')).toBe(posts[1].href)
    expect(card?.getAttribute('data-variant')).toBe('default')
    expect(card?.classList.contains('custom-card')).toBe(true)
    expect(card?.getAttribute('aria-labelledby')).toBe(document.querySelector('h2')?.id)
    expect(document.querySelector('time')?.getAttribute('datetime')).toBe('2026-02-03')
    expect(document.querySelector('time')?.textContent).toBe('February 3, 2026')
    expect(document.querySelector('ul')?.textContent).toContain('Web Development')
  })

  it('accepts Temporal dates, custom headings and variants without empty metadata', () => {
    const document = new JSDOM(renderToStaticMarkup(
      <BlogCard {...posts[2]} headingLevel={3} labels={[]} pubDate={Temporal.PlainDate.from('2025-01-01')} variant="compact" />,
    )).window.document
    expect(document.querySelector('h3')?.textContent).toBe('Unlabelled note')
    expect(document.querySelector('a')?.getAttribute('data-variant')).toBe('compact')
    expect(document.querySelector('p')).toBeNull()
    expect(document.querySelector('ul')).toBeNull()
  })
})
