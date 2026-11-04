import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import Fuse from 'fuse.js'
import { Menu, Monitor, Moon, Search as SearchIcon, Sun, X, type LucideIcon } from 'lucide-react'
import { NAV_LINKS, SITE_TITLE } from '../../consts'
import { type Theme, useTheme } from '../../hooks/useTheme'
import styles from './SiteHeader.module.css'

interface Post {
  readonly title: string
  readonly slug: string
  readonly description?: string
  readonly labels?: readonly string[]
}

interface SiteHeaderProps {
  readonly allPosts: readonly Post[]
  readonly currentPath: string
}

type ActiveState = 'false' | 'true'
type NavigationVariant = 'desktop' | 'drawer'
type SelectedState = 'false' | 'true'
type ThemeControlVariant = 'compact' | 'expanded'

const themes: ReadonlyArray<Readonly<{
  icon: LucideIcon
  label: string
  value: Theme
}>> = [
  { icon: Sun, label: 'Light', value: 'light' },
  { icon: Monitor, label: 'System', value: 'system' },
  { icon: Moon, label: 'Dark', value: 'dark' },
]

function isCurrentPath(currentPath: string, href: string): boolean {
  if (href === '/') return currentPath === href
  return currentPath.startsWith(href)
}

function Navigation({
  currentPath,
  onNavigate,
  variant,
}: Readonly<{
  currentPath: string
  onNavigate?: () => void
  variant: NavigationVariant
}>) {
  const links = variant === 'drawer'
    ? [{ href: '/', text: 'Home' }, ...NAV_LINKS]
    : NAV_LINKS

  return (
    <nav aria-label={variant === 'drawer' ? 'Mobile navigation' : 'Primary navigation'}>
      <ul className={styles.navigationList} data-variant={variant}>
        {links.map((link) => {
          const active: ActiveState = isCurrentPath(currentPath, link.href) ? 'true' : 'false'

          return (
            <li key={link.href}>
              <a
                aria-current={active === 'true' ? 'page' : undefined}
                className={styles.navigationLink}
                data-active={active}
                data-variant={variant}
                href={link.href}
                onClick={onNavigate}
              >
                {link.text}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

function SiteSearch({ allPosts, onNavigate }: Readonly<{
  allPosts: readonly Post[]
  onNavigate?: () => void
}>) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputId = useId()
  const resultsId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const fuse = useMemo(
    () => new Fuse(allPosts, {
      keys: ['title', 'description', 'labels'],
      threshold: 0.4,
    }),
    [allPosts],
  )
  const trimmedQuery = query.trim()
  const results = trimmedQuery.length > 0
    ? fuse.search(trimmedQuery, { limit: 6 }).map(result => result.item)
    : []
  const showResults = isOpen && trimmedQuery.length > 0

  return (
    <div
      className={styles.search}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          setIsOpen(false)
          inputRef.current?.focus()
        }
      }}
      role="search"
    >
      <label className={styles.visuallyHidden} htmlFor={inputId}>Search posts</label>
      <SearchIcon aria-hidden="true" className={styles.searchIcon} />
      <input
        ref={inputRef}
        aria-controls={resultsId}
        aria-expanded={showResults}
        autoComplete="off"
        className={styles.searchInput}
        id={inputId}
        onChange={(event) => {
          setQuery(event.target.value)
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        placeholder="Search posts"
        type="search"
        value={query}
      />
      {showResults && (
        <div className={styles.searchResults} id={resultsId}>
          {results.length > 0
            ? (
                <ul aria-label="Search results" className={styles.searchResultList}>
                  {results.map(post => (
                    <li key={post.slug}>
                      <a
                        className={styles.searchResultLink}
                        href={`/blog/${post.slug}/`}
                        onClick={onNavigate}
                      >
                        <span className={styles.searchResultTitle}>{post.title}</span>
                        {post.description && (
                          <span className={styles.searchResultDescription}>{post.description}</span>
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              )
            : <p className={styles.searchEmpty}>No posts found.</p>}
        </div>
      )}
    </div>
  )
}

function ThemeControl({
  mounted,
  setTheme,
  theme,
  variant,
}: Readonly<{
  mounted: boolean
  setTheme: (theme: Theme) => void
  theme: Theme
  variant: ThemeControlVariant
}>) {
  const currentIndex = themes.findIndex(option => option.value === theme)
  const currentTheme = themes[currentIndex] ?? themes[1]

  if (!mounted) {
    return <span aria-hidden="true" className={styles.themePlaceholder} data-variant={variant} />
  }

  if (variant === 'compact') {
    const nextTheme = themes[(currentIndex + 1) % themes.length] ?? themes[0]
    const CurrentIcon = currentTheme.icon

    return (
      <button
        aria-label={`Theme: ${currentTheme.label}. Switch to ${nextTheme.label}.`}
        className={styles.iconButton}
        onClick={() => setTheme(nextTheme.value)}
        title={`Switch to ${nextTheme.label.toLowerCase()} theme`}
        type="button"
      >
        <CurrentIcon aria-hidden="true" />
      </button>
    )
  }

  return (
    <div aria-label="Theme" className={styles.themeControl} role="radiogroup">
      {themes.map((option) => {
        const Icon = option.icon
        const selected: SelectedState = option.value === theme ? 'true' : 'false'

        return (
          <button
            aria-checked={selected === 'true'}
            className={styles.themeOption}
            data-selected={selected}
            key={option.value}
            onClick={() => setTheme(option.value)}
            role="radio"
            type="button"
          >
            <Icon aria-hidden="true" />
            <span>{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export function SiteHeader({ allPosts, currentPath }: Readonly<SiteHeaderProps>) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { mounted, setTheme, theme } = useTheme()

  const closeMenu = () => {
    dialogRef.current?.close()
  }

  const openMenu = () => {
    if (!dialogRef.current?.open) {
      dialogRef.current?.showModal()
      setIsMenuOpen(true)
    }
  }

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 48rem)')
    const closeAtDesktop = (event: Readonly<MediaQueryListEvent>) => {
      if (event.matches) closeMenu()
    }

    desktopQuery.addEventListener('change', closeAtDesktop)
    return () => desktopQuery.removeEventListener('change', closeAtDesktop)
  }, [])

  useEffect(() => {
    if (!isMenuOpen) return

    document.documentElement.classList.add(styles.scrollLocked)

    return () => {
      document.documentElement.classList.remove(styles.scrollLocked)
    }
  }, [isMenuOpen])

  return (
    <>
      <header className={`${styles.siteHeader} bg-brand-surface`}>
        <div className={styles.headerSurface}>
          <div className={styles.headerBar}>
            <a aria-label={`${SITE_TITLE}, home`} className={styles.brand} href="/">
              <span aria-hidden="true" className={styles.brandMark}>AB</span>
              <span>{SITE_TITLE}</span>
            </a>

            <div className={styles.desktopActions}>
              <Navigation currentPath={currentPath} variant="desktop" />
              <SiteSearch allPosts={allPosts} />
              <ThemeControl mounted={mounted} setTheme={setTheme} theme={theme} variant="compact" />
            </div>

            <div className={styles.mobileActions}>
              <ThemeControl mounted={mounted} setTheme={setTheme} theme={theme} variant="compact" />
              <button
                aria-controls="site-navigation-drawer"
                aria-expanded={isMenuOpen}
                aria-label="Open navigation menu"
                className={styles.iconButton}
                onClick={openMenu}
                type="button"
              >
                <Menu aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <dialog
        aria-labelledby="site-navigation-title"
        className={styles.drawer}
        id="site-navigation-drawer"
        onClick={(event) => {
          if (event.target === event.currentTarget) closeMenu()
        }}
        onClose={() => setIsMenuOpen(false)}
        ref={dialogRef}
      >
        <div className={styles.drawerContent}>
          <div className={styles.drawerHeader}>
            <div>
              <p className={styles.drawerEyebrow}>Explore</p>
              <h2 className={styles.drawerTitle} id="site-navigation-title">Navigation</h2>
            </div>
            <button aria-label="Close navigation menu" className={styles.iconButton} onClick={closeMenu} type="button">
              <X aria-hidden="true" />
            </button>
          </div>

          <SiteSearch allPosts={allPosts} onNavigate={closeMenu} />
          <Navigation currentPath={currentPath} onNavigate={closeMenu} variant="drawer" />

          <div className={styles.drawerFooter}>
            <p className={styles.drawerFooterLabel}>Appearance</p>
            <ThemeControl mounted={mounted} setTheme={setTheme} theme={theme} variant="expanded" />
          </div>
        </div>
      </dialog>
    </>
  )
}
