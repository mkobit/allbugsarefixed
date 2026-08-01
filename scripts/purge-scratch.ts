import fs from 'node:fs'
import path from 'node:path'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkMdx from 'remark-mdx'
import type { Root } from 'mdast'
import { findScratchSection } from '../src/lib/remark/scratch-section.ts'

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog')

const folderName = process.argv[2]

if (!folderName) {
  console.error('Please provide the blog post folder to purge.')
  console.error('Usage: bun run purge-scratch <YYYY-MM-DD_slug>')
  process.exit(1)
}

const postPath = path.join(BLOG_DIR, folderName, 'index.mdx')

if (!fs.existsSync(postPath)) {
  console.error(`No index.mdx found at ${postPath}`)
  process.exit(1)
}

const source = fs.readFileSync(postPath, 'utf-8')
const tree = unified().use(remarkParse).use(remarkMdx).parse(source) as Root
const section = findScratchSection(tree)

if (!section) {
  console.log(`No "## Scratch" section found in ${folderName}; nothing to purge.`)
  process.exit(0)
}

const purged = source.slice(0, section.start) + source.slice(section.end)
fs.writeFileSync(postPath, purged)
console.log(`Purged scratch section from ${postPath} (removed ${section.end - section.start} bytes).`)
