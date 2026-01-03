import React from 'react';
import { Temporal } from "@js-temporal/polyfill";
import { SITE_TITLE, SITE_DESCRIPTION, FOOTER_LINKS } from "../consts";
import { Link } from "./ui/link";

export function Footer() {
  const currentYear = Temporal.Now.plainDateISO().year;

  return (
    <footer className="mt-auto py-12 bg-gray-100 dark:bg-black/20 border-t border-gray-200 dark:border-white/10">
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">

        <div className="flex flex-col space-y-4">
          <span className="font-bold text-lg text-brand-text">{SITE_TITLE}</span>
          <p className="text-gray-600 dark:text-gray-400 max-w-xs">
            {SITE_DESCRIPTION}
          </p>
          <p className="text-gray-500">
            &copy; {currentYear} All Rights Reserved.
          </p>
        </div>

        <div className="flex flex-col space-y-2">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Navigation</h3>
          {FOOTER_LINKS.general.map(link => (
            <Link key={link.href} href={link.href} variant="default">
              {link.text}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
