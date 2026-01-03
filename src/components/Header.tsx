import React from 'react';
import { tv } from 'tailwind-variants';
import { SITE_TITLE, NAV_LINKS } from "../consts";
import ThemeToggle from "./ThemeToggle";
import { Link } from "./ui/link";

const headerStyles = tv({
  slots: {
    base: 'w-full px-6 py-4 md:py-6 border-b border-gray-200 dark:border-white/10 backdrop-blur-sm bg-white/50 dark:bg-brand-bg/50 sticky top-1 z-40',
    container: 'max-w-5xl mx-auto flex justify-between items-center',
    logo: 'text-xl font-bold tracking-tight hover:text-brand-primary transition-colors truncate max-w-[200px] md:max-w-none text-brand-text',
    nav: 'flex items-center gap-4 md:gap-6 font-medium text-sm',
    navLink: 'text-brand-text hover:text-brand-primary'
  }
});

export function Header() {
  const { base, container, logo, nav, navLink } = headerStyles();

  return (
    <header className={base()}>
      <div className={container()}>
        <Link
          href="/"
          className={logo()}
        >
          {SITE_TITLE}
        </Link>
        <nav className={nav()}>
          {NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href} variant="nav" className={navLink()}>
              {link.text}
            </Link>
          ))}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
