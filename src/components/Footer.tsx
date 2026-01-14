import React from 'react'
import { tv } from 'tailwind-variants'
import { Temporal } from '@js-temporal/polyfill'
import { SITE_TITLE, SITE_DESCRIPTION, FOOTER_LINKS } from '../consts'
import { Link } from './ui/link'

const footerStyles = tv({
  slots: {
    base: 'mt-auto py-12 bg-gray-100 dark:bg-black/20 border-t border-gray-200 dark:border-white/10',
    brandDescription: 'text-gray-600 dark:text-gray-400 max-w-xs',
    brandSection: 'flex flex-col space-y-4',
    brandTitle: 'font-bold text-lg text-brand-text',
    container: 'max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 text-sm',
    copyright: 'text-gray-500',
    navSection: 'flex flex-col space-y-2',
    navTitle: 'font-bold text-gray-900 dark:text-gray-100 mb-2',
  },
})

export function Footer() {
  const currentYear = Temporal.Now.plainDateISO().year
  const { base, container, brandSection, brandTitle, brandDescription, copyright, navSection, navTitle }
    = footerStyles()

  return (
    <footer className={base()}>
      <div className={container()}>
        <div className={brandSection()}>
          <span className={brandTitle()}>{SITE_TITLE}</span>
          <p className={brandDescription()}>{SITE_DESCRIPTION}</p>
          <p className={copyright()}>
            &copy;
            {currentYear}
            {' '}
            All Rights Reserved.
          </p>
        </div>

        <div className={navSection()}>
          <h3 className={navTitle()}>Navigation</h3>
          {FOOTER_LINKS.general.map(link => (
            <Link key={link.href} href={link.href} variant="default">
              {link.text}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
