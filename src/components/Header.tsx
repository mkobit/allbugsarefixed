import React, { useState, useEffect } from 'react';
import { tv } from 'tailwind-variants';
import { Menu, X, Home, BookOpen, Info } from 'lucide-react';
import { NAV_LINKS } from '../consts';
import { Link } from './ui/link';
import ThemeToggle from './ThemeToggle';
import { Search } from './Search';

const headerStyles = tv({
  slots: {
    desktopNav: 'hidden md:flex items-center gap-6',
    logo: 'font-bold text-lg text-brand-text hover:text-brand-primary transition-colors',
    mobileMenu: 'fixed inset-x-0 top-14 bottom-0 bg-brand-surface z-40 p-4 flex flex-col gap-4 border-t border-gray-200 dark:border-white/10 transition-transform duration-300 md:hidden overflow-y-auto',
    mobileNavItem: 'flex items-center gap-3 p-3 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-brand-text font-medium text-base',
    mobileNavToggle: 'md:hidden p-2 -mr-2 text-brand-text hover:bg-black/5 dark:hover:bg-white/10 rounded-md',
    navItem: 'flex items-center gap-2 text-sm font-medium text-brand-text hover:text-brand-primary transition-colors',
    wrapper: 'fixed top-0 left-0 right-0 h-14 bg-brand-surface border-b border-gray-200 dark:border-white/10 z-50 flex items-center justify-between px-4 lg:px-6 transition-colors duration-300',
  },
  variants: {
    menuOpen: {
      false: {
        mobileMenu: 'translate-x-full',
      },
      true: {
        mobileMenu: 'translate-x-0',
      }
    }
  }
});

interface Post {
  readonly title: string;
  readonly slug: string;
  readonly description?: string;
  readonly labels?: readonly string[];
}

interface HeaderProps {
  readonly allPosts: readonly Post[];
}

export function Header({ allPosts }: Readonly<HeaderProps>) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu when route changes or resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const { wrapper, logo, desktopNav, mobileNavToggle, mobileMenu, navItem, mobileNavItem } = headerStyles({ menuOpen: isMenuOpen });

  // Helper for Icon mapping (optional, but nice for mobile menu)
  const getIcon = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('blog')) return BookOpen;
    if (lower.includes('about')) return Info;
    return Home;
  };

  return (
    <>
      <header className={wrapper()}>
        <a href="/" className={logo()}>
          All Bugs Are Fixed
        </a>

        {/* Desktop Navigation */}
        <div className={desktopNav()}>
          <nav className="flex items-center gap-6">
             <Link href="/" className={navItem()} variant="unstyled">
                Home
             </Link>
             {NAV_LINKS.map(link => (
                <Link key={link.href} href={link.href} className={navItem()} variant="unstyled">
                  {link.text}
                </Link>
             ))}
          </nav>

          <div className="w-64">
            <Search allPosts={allPosts} />
          </div>

          <ThemeToggle />
        </div>

        {/* Mobile Toggle */}
        <button onClick={toggleMenu} className={mobileNavToggle()} aria-label={isMenuOpen ? "Close menu" : "Open menu"}>
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Menu */}
      <div className={mobileMenu()}>
        <div className="mb-2">
            <Search allPosts={allPosts} />
        </div>

        <nav className="flex flex-col gap-1">
          <Link href="/" className={mobileNavItem()} variant="unstyled" onClick={closeMenu}>
            <Home className="w-5 h-5" />
            Home
          </Link>
          {NAV_LINKS.map(link => {
            const Icon = getIcon(link.text);
            return (
                <Link key={link.href} href={link.href} className={mobileNavItem()} variant="unstyled" onClick={closeMenu}>
                    <Icon className="w-5 h-5" />
                    {link.text}
                </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-white/10 flex justify-between items-center">
            <span className="text-sm text-gray-500">Switch Theme</span>
            <ThemeToggle />
        </div>
      </div>
    </>
  );
}
