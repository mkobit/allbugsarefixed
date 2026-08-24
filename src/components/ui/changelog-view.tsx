import React, { useMemo, useState } from 'react'
import type { ChangelogCategory, ChangelogData, ChangelogEntry } from '../../lib/changelog'
import { Badge } from './badge'
import { Button } from './button'

interface ChangelogViewProps {
  readonly data: ChangelogData
}

const CATEGORY_LABELS: Record<ChangelogCategory, string> = {
  'authoring-tooling': 'Authoring Tooling',
  'info': 'Info & Docs',
  'platform': 'Platform Features',
  'testing': 'Testing & CI',
}

const CATEGORY_BADGES: Record<ChangelogCategory, { label: string, style: string }> = {
  'authoring-tooling': {
    label: 'Authoring',
    style: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800',
  },
  'info': {
    label: 'Info',
    style: 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950 dark:text-purple-200 dark:border-purple-800',
  },
  'platform': {
    label: 'Platform',
    style: 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800',
  },
  'testing': {
    label: 'Testing',
    style: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800',
  },
}

function formatDate(isoString: string): string {
  try {
    return Temporal.Instant.from(isoString).toZonedDateTimeISO('UTC').toPlainDate().toString()
  }
  catch {
    return isoString.split('T')[0] ?? isoString
  }
}

export function ChangelogView({ data }: Readonly<ChangelogViewProps>) {
  const [selectedCategory, setSelectedCategory] = useState<ChangelogCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const counts = useMemo(() => {
    return data.entries.reduce<Record<string, number>>(
      (acc, entry) => {
        const catCount = acc[entry.category] ?? 0
        return {
          ...acc,
          all: acc.all + 1,
          [entry.category]: catCount + 1,
        }
      },
      { all: 0 },
    )
  }, [data.entries])

  const filteredEntries = useMemo(() => {
    return data.entries.filter((entry: ChangelogEntry) => {
      if (selectedCategory !== 'all' && entry.category !== selectedCategory) {
        return false
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase()
        const matchesTitle = entry.title.toLowerCase().includes(q)
        const matchesId = entry.id.toLowerCase().includes(q)
        return matchesTitle || matchesId
      }
      return true
    })
  }, [data.entries, selectedCategory, searchQuery])

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-ui-border-strong pb-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-text">Changelog</h1>
          <p className="text-sm text-brand-muted mt-1">
            Automated release log derived from closed beads issue history.
          </p>
        </div>
        <div className="text-xs text-brand-muted">
          Last updated:
          {' '}
          <time dateTime={data.generatedAt}>
            {formatDate(data.generatedAt)}
          </time>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant={selectedCategory === 'all' ? 'primary' : 'outline'}
            onClick={() => setSelectedCategory('all')}
          >
            All (
            {counts.all ?? 0}
            )
          </Button>
          {(Object.keys(CATEGORY_LABELS) as ChangelogCategory[]).map(cat => (
            <Button
              key={cat}
              size="sm"
              variant={selectedCategory === cat ? 'primary' : 'outline'}
              onClick={() => setSelectedCategory(cat)}
            >
              {CATEGORY_LABELS[cat]}
              {' '}
              (
              {counts[cat] ?? 0}
              )
            </Button>
          ))}
        </div>

        <div className="w-full md:w-64">
          <input
            className="w-full rounded-md border border-ui-border-strong bg-transparent px-3 py-1.5 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-primary"
            placeholder="Search changes..."
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-3">
        {filteredEntries.length === 0
          ? (
              <div className="p-8 text-center text-sm text-brand-muted border border-dashed border-ui-border-strong rounded-lg">
                No changes match the selected filter.
              </div>
            )
          : (
              filteredEntries.map((entry: ChangelogEntry) => {
                const badgeMeta = CATEGORY_BADGES[entry.category]
                return (
                  <div
                    key={entry.id}
                    className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 p-4 rounded-lg border border-ui-border-strong hover:bg-ui-surface-hover transition-colors"
                  >
                    <div className="flex items-baseline gap-3 flex-1 min-w-0">
                      <span className="font-mono text-xs font-semibold text-brand-muted shrink-0">
                        {entry.id}
                      </span>
                      <span className="text-sm font-medium text-brand-text break-words">
                        {entry.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
                      <Badge variant="outline" className={`border ${badgeMeta.style}`}>
                        {badgeMeta.label}
                      </Badge>
                      <time dateTime={entry.closedAt} className="text-xs text-brand-muted font-mono">
                        {formatDate(entry.closedAt)}
                      </time>
                    </div>
                  </div>
                )
              })
            )}
      </div>
    </div>
  )
}
