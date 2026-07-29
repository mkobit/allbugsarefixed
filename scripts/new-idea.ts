import fs from 'node:fs'
import path from 'node:path'
import { Temporal } from '@js-temporal/polyfill'

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog')

// Join all arguments after the script name to form the title
const title = process.argv.slice(2).join(' ')

if (!title) {
  console.error('Please provide a title for the new idea.')
  console.error('Usage: bun run new-idea "My Idea Title"')
  process.exit(1)
}

// Generate slug
const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')

// Get current date as YYYY-MM-DD
const now = Temporal.Now.plainDateISO()
const dateStr = now.toString()

const folderName = `${dateStr}_${slug}`
const folderPath = path.join(BLOG_DIR, folderName)

if (!fs.existsSync(folderPath)) {
  fs.mkdirSync(folderPath, { recursive: true })
  console.log(`Created folder: ${folderPath}`)
}
else {
  console.log(`Folder already exists: ${folderPath}`)
}

const notebookPath = path.join(folderPath, 'notebook.md')

if (!fs.existsSync(notebookPath)) {
  // Notebook template (no frontmatter as per instructions for scratchpad).
  // Headers are capture buckets, not essay sections -- none of them should
  // read as "write the post here". Publish-ready prose belongs in index.mdx,
  // written by the human, not here.
  const notebookContent = `# ${title}

## Links & sources

## Facts & data

## Rough thoughts (human)

## Agent research notes

## Open questions
`
  fs.writeFileSync(notebookPath, notebookContent)
  console.log(`Created notebook: ${notebookPath}`)
}
else {
  console.log(`Notebook already exists: ${notebookPath}`)
}
