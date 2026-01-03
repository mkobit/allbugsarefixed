import React from 'react';
import { SITE_TITLE, NAV_LINKS } from "../consts";
import ThemeToggle from "./ThemeToggle";
import { Link } from "./ui/link";

export function Header() {
  return (
    <header className="w-full px-6 py-4 md:py-6 border-b border-gray-200 dark:border-white/10 backdrop-blur-sm bg-white/50 dark:bg-brand-bg/50 sticky top-1 z-40">
      <div className="max-w-5xl mx-auto flex justify-between items-center">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight hover:text-brand-primary transition-colors truncate max-w-[200px] md:max-w-none text-brand-text"
        >
          {SITE_TITLE}
        </Link>
        <nav className="flex items-center gap-4 md:gap-6 font-medium text-sm">
          {NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href} variant="nav" className="text-brand-text hover:text-brand-primary">
              {link.text}
            </Link>
          ))}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
