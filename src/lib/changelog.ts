export type ChangelogCategory = 'authoring-tooling' | 'info' | 'platform' | 'testing'

export interface ChangelogEntry {
  category: ChangelogCategory
  closedAt: string
  id: string
  issueType: string
  labels: string[]
  parent?: string
  title: string
}

export interface ChangelogData {
  entries: ChangelogEntry[]
  generatedAt: string
}
