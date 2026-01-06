import fs from 'node:fs';
import path from 'node:path';
import { Temporal } from '@js-temporal/polyfill';

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');
const DATE_PREFIX_REGEX = /^(\d{4}-\d{2}-\d{2})_/;

// Exclude these files/folders from checking
const EXCLUDES = ['.DS_Store', 'AGENTS.md', 'CLAUDE.md'];

console.log('Verifying blog folder structure...');

if (!fs.existsSync(BLOG_DIR)) {
  console.error(`Blog directory not found at ${BLOG_DIR}`);
  process.exit(1);
}

const entries = fs.readdirSync(BLOG_DIR, { withFileTypes: true });
let hasError = false;

for (const entry of entries) {
  if (EXCLUDES.includes(entry.name)) continue;

  if (entry.isDirectory()) {
    const match = entry.name.match(DATE_PREFIX_REGEX);
    if (!match) {
      console.error(`[ERROR] Blog folder "${entry.name}" does not match pattern YYYY-MM-DD_slug.`);
      hasError = true;
    } else {
        const dateStr = match[1];
        try {
            Temporal.PlainDate.from(dateStr);
            console.log(`[OK] ${entry.name}`);
        } catch (e) {
            console.error(`[ERROR] Blog folder "${entry.name}" has an invalid date: ${dateStr}`);
            hasError = true;
        }
    }
  } else {
      console.warn(`[WARN] Found file "${entry.name}" in root of blog/ directory. Prefer using folders per post.`);
  }
}

if (hasError) {
  console.error('\nVerification failed. Please rename folders to match YYYY-MM-DD_slug pattern with a valid ISO date.');
  process.exit(1);
} else {
  console.log('\nVerification passed.');
}
