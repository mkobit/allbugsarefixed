
import { visit } from 'unist-util-visit';
import { createHighlighter } from 'shiki';

let highlighter;

/**
 * Remark plugin to transform code blocks into <CodeBlock /> MDX components.
 * Highlights code at build time using Shiki.
 */
export function remarkCodeToComponent() {
  return async (tree) => {
    if (!highlighter) {
      try {
        highlighter = await createHighlighter({
          themes: ['github-dark'],
          langs: [
            'javascript', 'typescript', 'tsx', 'jsx', 'json', 'css', 'html', 'bash', 'shell',
            'markdown', 'yaml', 'python', 'rust', 'go', 'java', 'c', 'cpp'
          ]
        });
      } catch (e) {
        console.error('remarkCodeToComponent: Failed to init highlighter', e);
      }
    }

    const nodesToTransform = [];

    visit(tree, 'code', (node, index, parent) => {
      nodesToTransform.push({ node, index, parent });
    });

    for (const { node, index, parent } of nodesToTransform) {
      const lang = node.lang || 'plaintext';
      const code = node.value;
      const meta = node.meta || '';

      // Extract title from meta
      const titleMatch = meta.match(/title=(["'])(.*?)\1/);
      const title = titleMatch ? titleMatch[2] : undefined;

      // Highlight the code
      let html = '';
      try {
        html = highlighter.codeToHtml(code, {
          lang,
          theme: 'github-dark'
        });
      } catch (e) {
        console.warn(`Failed to highlight code block (lang: ${lang}):`, e.message);
        // Fallback to plain text
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

      // Pass raw meta if needed
      if (meta) {
         mdxNode.attributes.push({ type: 'mdxJsxAttribute', name: 'meta', value: meta });
      }

      // Replace the original code node with the MDX component node
      parent.children[index] = mdxNode;
    }
  };
}
