import React, { useState, useEffect, useRef, useId } from 'react';
import type { CollectionEntry } from 'astro:content';

interface BlogSearchProps {
  posts: CollectionEntry<'blog'>[];
  className?: string;
}

interface SearchResult {
  matchScore: number;
  post: CollectionEntry<'blog'>;
}

export default function BlogSearch({ posts, className = '' }: BlogSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchId = useId();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  
  // Search function with basic relevance scoring
  const searchPosts = (searchQuery: string): SearchResult[] => {
    if (!searchQuery.trim()) return [];
    
    const queryWords = searchQuery.toLowerCase().split(/\s+/);
    
    return posts
      .map(post => {
        const { title, description, tags } = post.data;
        
        let score = 0;
        
        // Title matches are weighted higher
        queryWords.forEach(word => {
          if (title.toLowerCase().includes(word)) {
            score += 3;
          }
          if (description?.toLowerCase().includes(word)) {
            score += 2;
          }
          if (tags?.some(tag => tag.toLowerCase().includes(word))) {
            score += 1;
          }
        });
        
        return { matchScore: score, post };
      })
      .filter(result => result.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 8); // Limit to top 8 results
  };
  
  // Update results when query changes
  useEffect(() => {
    const searchResults = searchPosts(query);
    setResults(searchResults);
    setIsOpen(query.length > 0 && searchResults.length > 0);
    setSelectedIndex(-1);
  }, [query, posts]);
  
  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isOpen) return;
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex] && typeof window !== 'undefined') {
          window.location.href = `/blog/${results[selectedIndex].post.slug}/`;
        }
        break;
      
      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        setQuery('');
        inputRef.current?.blur();
        break;
    }
  };
  
  // Update aria-activedescendant when selection changes
  useEffect(() => {
    if (inputRef.current && selectedIndex >= 0) {
      inputRef.current.setAttribute('aria-activedescendant', `result-${selectedIndex}`);
    } else {
      inputRef.current?.removeAttribute('aria-activedescendant');
    }
  }, [selectedIndex]);
  
  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (listRef.current && !listRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (typeof document !== 'undefined') {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, []);
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      day: 'numeric',
      month: 'short', 
      year: 'numeric', 
    });
  };
  
  return (
    <div className={`blog-search ${className}`} role="search">
      <label htmlFor={searchId} className="blog-search-label">
        Search blog posts
      </label>
      
      <div className="blog-search-wrapper">
        <input
          id={searchId}
          ref={inputRef}
          type="search"
          className="blog-search-input"
          placeholder="Search posts..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={isOpen ? listId : undefined}
          aria-describedby={isOpen ? `${searchId}-desc` : undefined}
          autoComplete="off"
          spellCheck="false"
        />
        
        {isOpen && (
          <>
            <div id={`${searchId}-desc`} className="sr-only">
              {results.length} search result{results.length !== 1 ? 's' : ''} available. 
              Use arrow keys to navigate, Enter to select, Escape to close.
            </div>
            
            <ul
              id={listId}
              ref={listRef}
              className="blog-search-results"
              role="listbox"
              aria-label={`Search results for "${query}"`}
            >
              {results.map((result, index) => (
                <li
                  key={result.post.slug}
                  id={`result-${index}`}
                  className={`blog-search-result ${selectedIndex === index ? 'selected' : ''}`}
                  role="option"
                  aria-selected={selectedIndex === index}
                >
                  <a
                    href={`/blog/${result.post.slug}/`}
                    className="blog-search-result-link"
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="blog-search-result-content">
                      <h3 className="blog-search-result-title">
                        {result.post.data.title}
                      </h3>
                      {result.post.data.description && (
                        <p className="blog-search-result-description">
                          {result.post.data.description}
                        </p>
                      )}
                      <div className="blog-search-result-meta">
                        <time dateTime={result.post.data.pubDate.toISOString()}>
                          {formatDate(result.post.data.pubDate)}
                        </time>
                        {result.post.data.tags && result.post.data.tags.length > 0 && (
                          <div className="blog-search-result-tags">
                            {result.post.data.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="blog-search-result-tag">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

// CSS-in-JS styles would go here, but since we're using external CSS, 
// these styles should be added to the design system or a separate CSS file