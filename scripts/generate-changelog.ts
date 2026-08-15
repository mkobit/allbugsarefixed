import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { Temporal } from '@js-temporal/polyfill'
import type { ChangelogCategory, ChangelogData, ChangelogEntry } from '../src/lib/changelog'

export interface RawBeadIssue {
  closed_at?: string
  close_reason?: string
  created_at?: string
  description?: string
  id: string
  issue_type?: string
  labels?: string[]
  parent?: string
  priority?: number
  status: string
  title: string
  updated_at?: string
}

export function categorizeIssue(issue: RawBeadIssue): ChangelogCategory | 'exclude' {
  const title = (issue.title || '').toLowerCase()
  const labels = issue.labels || []
  const type = (issue.issue_type || '').toLowerCase()

  if (
    labels.includes('type:sync')
    || title.startsWith('expand tasks')
    || title === 'openspec-sync'
    || title === 'openspec-workflow'
    || title.startsWith('proposal:')
    || title.startsWith('specs:')
    || title.startsWith('design & adversarial review:')
    || title.startsWith('scope reconciliation:')
    || title.startsWith('tasks & hydration:')
    || title.startsWith('retrospective:')
    || title.startsWith('reflection:')
    || title.startsWith('archive:')
    || type === 'molecule'
  ) {
    return 'exclude'
  }

  if (
    title.startsWith('researching:')
    || title.startsWith('drafting:')
    || (labels.includes('blog') && !labels.includes('meta:authoring') && !labels.includes('meta:blog-flow'))
    || labels.some(l => l.includes('blog-lifecycle'))
  ) {
    return 'exclude'
  }

  if (
    labels.includes('type:test')
    || labels.includes('meta:testing')
    || title.includes('test')
    || title.includes('coverage')
    || title.includes('ci')
    || title.includes('eslint')
    || title.includes('lint')
    || title.includes('typecheck')
  ) {
    return 'testing'
  }

  if (
    labels.includes('meta:blog-flow')
    || labels.includes('meta:authoring')
    || title.includes('new-idea')
    || title.includes('drafting workflow')
    || title.includes('blog-lifecycle')
    || title.includes('authoring')
    || title.includes('formula')
  ) {
    return 'authoring-tooling'
  }

  if (
    labels.includes('meta:beads-flow')
    || labels.includes('meta:docs')
    || title.includes('agents.md')
    || title.includes('readme')
    || title.includes('guidelines')
    || title.includes('documentation')
    || title.includes('grooming')
    || title.includes('spec')
  ) {
    return 'info'
  }

  return 'platform'
}

function fetchClosedIssues(targetFile: string): RawBeadIssue[] {
  try {
    const raw = execSync('bd list --status closed --limit 0 --json', { encoding: 'utf-8' })
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : parsed.issues || []
  }
  catch (error) {
    console.warn('Warning: Could not fetch closed beads via bd CLI. Falling back to existing json file if present.', error)
    if (existsSync(targetFile)) {
      const existing = readFileSync(targetFile, 'utf-8')
      const parsedData = JSON.parse(existing) as ChangelogData
      return parsedData.entries.map(entry => ({
        closed_at: entry.closedAt,
        id: entry.id,
        issue_type: entry.issueType,
        labels: entry.labels,
        parent: entry.parent,
        status: 'closed',
        title: entry.title,
      }))
    }
    return []
  }
}

export function generateChangelogData(): ChangelogData {
  const targetFile = join(process.cwd(), 'src/data/changelog.json')
  const rawIssues = fetchClosedIssues(targetFile)

  const entries: ChangelogEntry[] = rawIssues.reduce<ChangelogEntry[]>((acc, issue) => {
    const category = categorizeIssue(issue)
    if (category === 'exclude') {
      return acc
    }
    const entry: ChangelogEntry = {
      category,
      closedAt: issue.closed_at || issue.updated_at || issue.created_at || Temporal.Now.instant().toString(),
      id: issue.id,
      issueType: issue.issue_type || 'task',
      labels: issue.labels || [],
      parent: issue.parent,
      title: issue.title,
    }
    return [...acc, entry]
  }, [])

  const sortedEntries = [...entries].sort((a, b) => {
    const instantA = Temporal.Instant.from(a.closedAt).epochMilliseconds
    const instantB = Temporal.Instant.from(b.closedAt).epochMilliseconds
    return Number(instantB - instantA)
  })

  return {
    entries: sortedEntries,
    generatedAt: Temporal.Now.instant().toString(),
  }
}

if (import.meta.main || process.argv[1]?.endsWith('generate-changelog.ts')) {
  const data = generateChangelogData()
  const targetFile = join(process.cwd(), 'src/data/changelog.json')
  const targetDir = join(process.cwd(), 'src/data')
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true })
  }
  writeFileSync(targetFile, `${JSON.stringify(data, null, 2)}\n`, 'utf-8')
  console.log(`Successfully generated changelog with ${data.entries.length} entries at ${targetFile}`)
}
