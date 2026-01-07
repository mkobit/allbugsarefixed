import React, { useState, useEffect } from 'react';
import { tv } from 'tailwind-variants';
import { ChevronLeft, Menu, Home, BookOpen, Info } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { Link } from './ui/link';
import { NAV_LINKS } from '../consts';
import { SidebarSearch } from './SidebarSearch';

const sidebarStyles = tv({
  slots: {
    content: 'flex-1 overflow-y-auto overflow-x-hidden flex flex-col gap-4 p-4',
    header: 'flex items-center justify-between mb-4 h-12',
    logo: 'font-bold text-base whitespace-nowrap overflow-hidden text-brand-text transition-opacity duration-300',
    nav: 'flex flex-col gap-2',
    navIcon: 'w-5 h-5 min-w-[20px]',
    navItem: 'flex items-center gap-3 px-3 py-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-brand-text transition-colors whitespace-nowrap',
    overlay: 'fixed inset-0 bg-black/50 z-[55] md:hidden transition-opacity duration-300', // z-55 to be above sticky header (z-50) but below sidebar (z-60)
    recentPost: 'text-xs text-brand-text hover:text-brand-primary truncate px-3 py-1 block',
    sectionTitle: 'text-[10px] font-semibold text-gray-500 uppercase tracking-wider mt-4 mb-2 px-3 whitespace-nowrap overflow-hidden',
    toggleBtn: 'p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-brand-text transition-colors',
    wrapper: 'fixed top-0 left-0 h-full z-[60] bg-brand-surface border-r border-gray-200 dark:border-white/10 transition-all duration-300 flex flex-col', // z-60 to cover everything
  },
  variants: {
    collapsed: {
      false: {
        content: 'items-stretch',
        logo: 'opacity-100 w-auto',
        navItem: 'justify-start',
        overlay: 'opacity-100 visible',
        recentPost: 'block',
        sectionTitle: 'block',
        wrapper: 'w-64', // Expanded width
      },
      true: {
        content: 'items-center px-1',
        logo: 'opacity-0 w-0',
        navItem: 'justify-center px-0',
        overlay: 'opacity-0 invisible pointer-events-none',
        recentPost: 'hidden',
        sectionTitle: 'hidden',
        wrapper: 'w-12', // Sliver width
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

export function Sidebar({ recentPosts, allPosts }: Readonly<SidebarProps>) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { wrapper, content, header, logo, toggleBtn, nav, navItem, navIcon, sectionTitle, recentPost, overlay } = sidebarStyles({ collapsed: isCollapsed });

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
        const width = isCollapsed ? '3rem' : '16rem';
        document.documentElement.style.setProperty('--sidebar-width', width);
    } else {
        document.documentElement.style.setProperty('--sidebar-width', '3rem');
    }
  }, [isCollapsed, isMobile]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleOverlayClick = () => {
    if (isMobile) setIsCollapsed(true);
  };

  const handleExpand = () => {
      setIsCollapsed(false);
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

            {/* Search Component */}
            <SidebarSearch
                allPosts={allPosts}
                isCollapsed={isCollapsed}
                onExpand={handleExpand}
            />

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
                <ThemeToggle collapsed={isCollapsed} />
            </div>
            </div>
        </div>
        </aside>
    </>
  );
}
