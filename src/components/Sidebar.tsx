import React, { useState, useEffect } from 'react';
import { tv } from 'tailwind-variants';
import { Search, ChevronLeft, Menu, Home, BookOpen, Info } from 'lucide-react';
import Fuse from 'fuse.js';
import ThemeToggle from './ThemeToggle';
import { Link } from './ui/link';
import { NAV_LINKS } from '../consts';

const sidebarStyles = tv({
  slots: {
    content: 'flex-1 overflow-y-auto overflow-x-hidden flex flex-col gap-4 p-4',
    header: 'flex items-center justify-between mb-4 h-12',
    logo: 'font-bold text-lg whitespace-nowrap overflow-hidden text-brand-text transition-opacity duration-300',
    nav: 'flex flex-col gap-2',
    navIcon: 'w-5 h-5 min-w-[20px]',
    navItem: 'flex items-center gap-3 px-3 py-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-brand-text transition-colors whitespace-nowrap',
    overlay: 'fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity duration-300',
    recentPost: 'text-sm text-brand-text hover:text-brand-primary truncate px-3 py-1 block',
    searchContainer: 'relative mb-4',
    searchIcon: 'absolute left-3 top-2.5 w-4 h-4 text-gray-400',
    searchInput: 'w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-md py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary placeholder:text-gray-400',
    searchResultItem: 'block p-2 text-sm hover:bg-black/5 dark:hover:bg-white/10 rounded cursor-pointer text-brand-text',
    searchResults: 'absolute left-0 top-full mt-2 w-full bg-brand-surface border border-gray-200 dark:border-white/10 rounded-md shadow-lg max-h-60 overflow-y-auto z-50 p-2',
    sectionTitle: 'text-xs font-semibold text-gray-500 uppercase tracking-wider mt-4 mb-2 px-3 whitespace-nowrap overflow-hidden',
    toggleBtn: 'p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-brand-text transition-colors',
    wrapper: 'fixed top-0 left-0 h-full z-40 bg-brand-surface border-r border-gray-200 dark:border-white/10 transition-all duration-300 flex flex-col',
  },
  variants: {
    collapsed: {
      false: {
        content: 'items-stretch',
        logo: 'opacity-100 w-auto',
        navItem: 'justify-start',
        overlay: 'opacity-100 visible',
        recentPost: 'block',
        searchContainer: 'w-full',
        searchIcon: 'absolute',
        searchInput: 'block',
        sectionTitle: 'block',
        wrapper: 'w-64', // Expanded width
      },
      true: {
        content: 'items-center px-2',
        logo: 'opacity-0 w-0',
        navItem: 'justify-center px-0',
        overlay: 'opacity-0 invisible pointer-events-none',
        recentPost: 'hidden',
        searchContainer: 'w-full flex justify-center',
        searchIcon: 'static pointer-events-none',
        searchInput: 'hidden',
        sectionTitle: 'hidden',
        wrapper: 'w-16', // Sliver width
      },
    }
  }
});

interface Post {
  readonly title: string;
  readonly slug: string;
  readonly description?: string;
  readonly pubDate: string;
  readonly labels?: readonly string[];
}

interface SidebarProps {
  readonly recentPosts: readonly Post[];
  readonly allPosts: readonly Post[];
}

export function Sidebar({ recentPosts, allPosts }: SidebarProps) {
  // Initialize state based on anticipated environment or default
  // We can't know window size on server, so we default to desktop expanded or mobile collapsed?
  // To match CSS media queries, we should be careful.
  // Best practice for SSR: Default to a state (e.g., expanded) and adjust on client, OR use CSS for default layout.
  // Here, we'll default to 'false' (expanded) as it's the "standard" state, but this might cause hydration mismatch if mobile.
  // We can use a two-pass render or accept the shift.
  // Better: Default to 'true' (collapsed) for mobile-first?
  // Let's use `undefined` initially to defer to client hook, but that breaks SSR hydration if classes differ.
  // Strategy: Default to collapsed (sliver) as safe baseline? No, desktop usually wants expanded.

  // We will trust the hydration to fix it, but to avoid CLS, we should use CSS to set initial widths.
  // React state only controls the *explicit* toggle.
  // However, we are using `tailwind-variants` which relies on props.

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Fuse instance
  const fuse = new Fuse(allPosts, {
    keys: ['title', 'description', 'labels'],
    threshold: 0.4,
  });

  const searchResults = searchQuery ? fuse.search(searchQuery).map(r => r.item) : [];

  const { wrapper, content, header, logo, toggleBtn, nav, navItem, navIcon, sectionTitle, recentPost, searchContainer, searchInput, searchIcon, searchResults: resultsClass, searchResultItem, overlay } = sidebarStyles({ collapsed: isCollapsed });

  useEffect(() => {
    const checkMobile = () => window.innerWidth < 768;

    // Set initial state based on viewport
    const mobile = checkMobile();
    setIsMobile(mobile);
    // On mount, if mobile, collapse it. If desktop, keep expanded (default).
    if (mobile) setIsCollapsed(true);
    else setIsCollapsed(false);

    const handleResize = () => {
      const isNowMobile = checkMobile();
      setIsMobile(isNowMobile);
      // Optional: Auto-collapse on resize to mobile?
      if (isNowMobile && !isMobile) setIsCollapsed(true);
      // Optional: Auto-expand on resize to desktop?
      if (!isNowMobile && isMobile) setIsCollapsed(false);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  // Update CSS variable for layout pushing (Desktop only)
  useEffect(() => {
    if (!isMobile) {
        const width = isCollapsed ? '4rem' : '16rem';
        document.documentElement.style.setProperty('--sidebar-width', width);
    } else {
        // On mobile, sidebar does NOT push content.
        // We set --sidebar-width to the "sliver" width (4rem) because the sidebar is fixed/overlay.
        // Wait, "sliver to show" means the 4rem is always there pushing content?
        // Or is the sliver strictly overlay?
        // Usually, a persistent sliver pushes content. Expanding it overlays.
        // Let's assume:
        // Mobile: Sliver (4rem) pushes content. Expanded (16rem) overlays content (but 4rem still reserved).
        document.documentElement.style.setProperty('--sidebar-width', '4rem');
    }
  }, [isCollapsed, isMobile]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleOverlayClick = () => {
    if (isMobile) setIsCollapsed(true);
  };

  const handleSearchFocus = () => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setTimeout(() => {
        document.getElementById('sidebar-search-input')?.focus();
      }, 300);
    }
    setShowSearchResults(true);
  };

  // Helper for Icon mapping
  const getIcon = (text: string) => {
      const lower = text.toLowerCase();
      if (lower.includes('blog')) return BookOpen;
      if (lower.includes('about')) return Info;
      if (lower.includes('home')) return Home;
      return Home;
  };

  return (
    <>
        {/* Overlay for mobile expanded state */}
        <div className={overlay()} onClick={handleOverlayClick} aria-hidden="true" />

        <aside className={wrapper()}>
        <div className={content()}>
            <div className={header()}>
            {!isCollapsed && <span className={logo()}>All Bugs Are Fixed</span>}
            <button onClick={toggleSidebar} className={toggleBtn()} aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
                {isCollapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
            </div>

            {/* Search */}
            <div className={searchContainer()}>
            {isCollapsed ? (
                <button onClick={handleSearchFocus} className="p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-gray-400" aria-label="Search">
                <Search className="w-5 h-5" />
                </button>
            ) : (
                <>
                    <Search className={searchIcon()} />
                    <input
                    id="sidebar-search-input"
                    type="text"
                    placeholder="Search..."
                    className={searchInput()}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setShowSearchResults(true)}
                    onBlur={() => setTimeout(() => setShowSearchResults(false), 200)} // Delay to allow clicking results
                    />
                    {showSearchResults && searchQuery && (
                    <div className={resultsClass()}>
                        {searchResults.length > 0 ? (
                        searchResults.map((post) => (
                            <a key={post.slug} href={`/blog/${post.slug}/`} className={searchResultItem()}>
                            <div className="font-medium">{post.title}</div>
                            {post.description && <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{post.description}</div>}
                            </a>
                        ))
                        ) : (
                        <div className="p-2 text-sm text-gray-500">No results found</div>
                        )}
                    </div>
                    )}
                </>
            )}
            </div>

            {/* Navigation */}
            <nav className={nav()}>
            {/* Always include Home */}
            <Link href="/" className={navItem()} variant="unstyled">
                <Home className={navIcon()} />
                {!isCollapsed && <span>Home</span>}
            </Link>

            {NAV_LINKS.map(link => {
                const Icon = getIcon(link.text);
                return (
                    <Link key={link.href} href={link.href} className={navItem()} variant="unstyled">
                        <Icon className={navIcon()} />
                        {!isCollapsed && <span>{link.text}</span>}
                    </Link>
                );
            })}
            </nav>

            {/* Recent Posts - Only when expanded */}
            {!isCollapsed && (
            <div className="mt-6">
                <div className={sectionTitle()}>Recent Posts</div>
                <div className="flex flex-col gap-1">
                {recentPosts.map(post => (
                    <a key={post.slug} href={`/blog/${post.slug}/`} className={recentPost()}>
                    {post.title}
                    </a>
                ))}
                </div>
            </div>
            )}

            <div className="mt-auto pt-4">
            {/* Theme Toggle - wrapped to handle collapsed state visual */}
            <div className={`flex ${isCollapsed ? 'justify-center' : 'justify-start px-3'}`}>
                <ThemeToggle />
            </div>
            </div>
        </div>
        </aside>
    </>
  );
}
