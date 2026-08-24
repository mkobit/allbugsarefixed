import fs from 'node:fs'
import path from 'node:path'

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

const indexPath = path.join(folderPath, 'index.mdx')

if (!fs.existsSync(indexPath)) {
  // Everything lives in one index.mdx now: frontmatter plus a `## Scratch`
  // section for research capture. The capture-bucket headers are demoted to
  // depth 3 so they nest inside `## Scratch` instead of ending it early --
  // findScratchSection() only breaks on a heading at depth <= 2. None of the
  // headers should read as "write the post here"; publish-ready prose goes
  // outside `## Scratch`, written by the human.
  //
  // `description` has no schema default and there's no post content yet to
  // summarize, so it's seeded with the title as a placeholder for the human
  // to replace once real content exists.
  const indexContent = `---
title: "${title}"
pubDate: ${dateStr}
visibility: "hidden"
description: "${title}"
---

## Scratch

### Links & sources

### Facts & data

### Rough thoughts (human)

### Agent research notes

### Open questions
`
  fs.writeFileSync(indexPath, indexContent)
  console.log(`Created index: ${indexPath}`)
}
else {
  console.log(`Index already exists: ${indexPath}`)
}
