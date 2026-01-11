
import { visit } from 'unist-util-visit';
import { createHighlighter } from 'shiki';
import {
  transformerMetaHighlight,
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight
} from '@shikijs/transformers';

let highlighterPromise;

// Initialize highlighter once
async function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['github-dark'],
      langs: [
        'javascript',
        'typescript',
        'tsx',
        'jsx',
        'json',
        'css',
        'html',
        'bash',
        'shell',
        'markdown',
        'yaml',
        'python',
        'rust',
        'go',
        'java',
        'c',
        'cpp',
        'kotlin'
      ]
    });
  }
  return highlighterPromise;
}

/**
 * Remark plugin to transform code blocks into <CodeBlock /> MDX components.
 * Highlights code at build time using Shiki.
 */
export function remarkCodeToComponent() {
  return async (tree) => {
    let highlighter;
    try {
      highlighter = await getHighlighter();
    } catch (e) {
      throw new Error(`remarkCodeToComponent: Failed to init highlighter: ${e.message}`);
    }

    const nodesToTransform = [];

    visit(tree, 'code', (node, index, parent) => {
      nodesToTransform.push({ node, index, parent });
    });

    await Promise.all(nodesToTransform.map(async ({ node, index, parent }) => {
      const lang = node.lang || 'plaintext';
      const meta = node.meta || '';
      let code = node.value;

      // Extract title
      const titleMatch = meta.match(/title=(["'])(.*?)\1/);
      const title = titleMatch ? titleMatch[2] : undefined;

      // Extract line numbers flag
      const showLineNumbers = /\b(showLineNumbers|numbers)\b/.test(meta);

      // Extract lines subset (e.g., lines="2-5" or lines="2..5")
      const linesMatch = meta.match(/lines=(["']?)(\d+)(?:[-..]+)(\d+)\1/);
      let startLine = 1;

      if (linesMatch) {
        const start = parseInt(linesMatch[2], 10);
        const end = parseInt(linesMatch[3], 10);

        if (!isNaN(start) && !isNaN(end) && start <= end) {
           const lines = code.split('\n');
           // Slice is 0-indexed, so start-1. End is inclusive in user intent, so end.
           // However, if lines < start, handle gracefully.
           code = lines.slice(Math.max(0, start - 1), end).join('\n');
           startLine = start;
        }
      }

      // Highlight the code
      let html = '';
      try {
        html = highlighter.codeToHtml(code, {
          lang,
          theme: 'github-dark',
          transformers: [
            transformerMetaHighlight(), // Handles {1-3} from meta
            transformerNotationDiff(),
            transformerNotationHighlight(),
            transformerNotationWordHighlight()
          ],
          meta: {
             __raw: meta // Pass meta for transformerMetaHighlight
          }
        });
      } catch (e) {
        console.warn(`Failed to highlight code block (lang: ${lang}):`, e.message);
        html = `<pre><code>${code}</code></pre>`;
      }

      // Create the MDX JSX Flow Element
      const mdxNode = {
        type: 'mdxJsxFlowElement',
        name: 'CodeBlock',
        attributes: [
          { type: 'mdxJsxAttribute', name: 'code', value: code },
          { type: 'mdxJsxAttribute', name: 'lang', value: lang },
          { type: 'mdxJsxAttribute', name: 'html', value: html },
        ],
        children: []
      };

      if (title) {
        mdxNode.attributes.push({ type: 'mdxJsxAttribute', name: 'title', value: title });
      }

      if (showLineNumbers) {
        mdxNode.attributes.push({ type: 'mdxJsxAttribute', name: 'showLineNumbers', value: "true" });
      }

      if (startLine !== 1) {
        mdxNode.attributes.push({ type: 'mdxJsxAttribute', name: 'startLine', value: String(startLine) });
      }

      // Replace the original code node with the MDX component node
      parent.children[index] = mdxNode;
    }));
  };
}
