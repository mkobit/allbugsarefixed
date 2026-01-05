import fs from 'node:fs';
import path from 'node:path';

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');
// Matches YYYY-MM-DD_slug (underscore separator)
const DATE_PREFIX_REGEX = /^\d{4}-\d{2}-\d{2}_/;

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
    if (!DATE_PREFIX_REGEX.test(entry.name)) {
      console.error(`[ERROR] Blog folder "${entry.name}" does not match pattern YYYY-MM-DD_slug.`);
      hasError = true;
    } else {
        // Optional: strict temporal validation could go here
        // const datePart = entry.name.split('_')[0];
        // try { Temporal.PlainDate.from(datePart); } ...
        console.log(`[OK] ${entry.name}`);
    }
  } else {
      console.warn(`[WARN] Found file "${entry.name}" in root of blog/ directory. Prefer using folders per post.`);
  }
}

if (hasError) {
  console.error('\nVerification failed. Please rename folders to match YYYY-MM-DD_slug pattern.');
  process.exit(1);
} else {
  console.log('\nVerification passed.');
}
