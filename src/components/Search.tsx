import React, { useState, useRef, useMemo } from 'react'
import { tv } from 'tailwind-variants'
import { Search as SearchIcon } from 'lucide-react'
import Fuse from 'fuse.js'

const searchStyles = tv({
  slots: {
    container: 'relative',
    icon: 'absolute left-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none',
    input:
      'w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-md py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary placeholder:text-gray-400',
    resultItem: 'block p-2 text-sm hover:bg-black/5 dark:hover:bg-white/10 rounded cursor-pointer text-brand-text',
    results:
      'absolute left-0 top-full mt-2 w-full bg-brand-surface border border-gray-200 dark:border-white/10 rounded-md shadow-lg max-h-60 overflow-y-auto z-50 p-2',
  },
})

interface Post {
  readonly title: string
  readonly slug: string
  readonly description?: string
  readonly labels?: readonly string[]
}

interface SearchProps {
  readonly allPosts: readonly Post[]
  readonly className?: string
}

export function Search({ allPosts, className }: Readonly<SearchProps>) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  // Fuse instance
  const fuse = useMemo(
    () =>
      new Fuse(allPosts, {
        keys: ['title', 'description', 'labels'],
        threshold: 0.4,
      }),
    [allPosts],
  )

  const searchResults = searchQuery ? fuse.search(searchQuery).map(r => r.item) : []

  const { container, input, icon, results, resultItem } = searchStyles()

  return (
    <div className={`${container()} ${className ?? ''}`}>
      <SearchIcon className={icon()} />
      <input
        ref={inputRef}
        type="text"
        placeholder="Search..."
        className={input()}
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        onFocus={() => setShowSearchResults(true)}
        onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
      />
      {showSearchResults && searchQuery && (
        <div className={results()}>
          {searchResults.length > 0
            ? (
                searchResults.map(post => (
                  <a key={post.slug} href={`/blog/${post.slug}/`} className={resultItem()}>
                    <div className="font-medium">{post.title}</div>
                    {post.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{post.description}</div>
                    )}
                  </a>
                ))
              )
            : (
                <div className="p-2 text-sm text-gray-500">No results found</div>
              )}
        </div>
      )}
    </div>
  )
}
