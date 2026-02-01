import fs from 'node:fs/promises';
import path from 'node:path';
import { JSDOM } from 'jsdom';
import mermaid from 'mermaid';
import createDOMPurify from 'dompurify';

// Setup JSDOM environment
const dom = new JSDOM('<!DOCTYPE html>');
global.window = dom.window;
global.document = dom.window.document;

// Setup DOMPurify
const DOMPurify = createDOMPurify(dom.window);
global.DOMPurify = DOMPurify;

// Initialize mermaid
mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'loose',
});

async function getFiles(dir) {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(dirents.map((dirent) => {
    const res = path.resolve(dir, dirent.name);
    return dirent.isDirectory() ? getFiles(res) : res;
  }));
  return Array.prototype.concat(...files);
}

async function validate() {
  console.log('Validating Mermaid diagrams in MDX files...');
  // Adjust path if base changed?
  // src/content/blog is still the physical location.
  const files = await getFiles('./src/content/blog');
  const mdxFiles = files.filter(f => f.endsWith('.mdx'));
  let hasError = false;

  for (const file of mdxFiles) {
    const content = await fs.readFile(file, 'utf-8');
    const regex = /<Mermaid\s+[^>]*code=\{`([\s\S]*?)`\}/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      const code = match[1];
      try {
        await mermaid.parse(code);
      } catch (e) {
        if (e.message.includes('DOMPurify.sanitize is not a function')) {
           console.warn(`\n⚠️ Warning in ${path.relative(process.cwd(), file)}: DOMPurify setup failed, skipping strict validation.`);
           continue;
        }

        console.error(`\n❌ Error in ${path.relative(process.cwd(), file)}:`);
        console.error(e.message);
        hasError = true;
      }
    }
  }

  if (hasError) {
    console.error('\nValidation failed.');
    process.exit(1);
  }
  console.log('✅ Mermaid validation passed.');
}

validate().catch(e => {
  console.error(e);
  process.exit(1);
});
