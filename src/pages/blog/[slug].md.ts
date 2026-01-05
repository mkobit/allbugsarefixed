import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

/**
 * Returns a simplified Markdown representation of the post.
 * This is "AI-friendly" - just the frontmatter and the body text.
 */
export const GET: APIRoute = async ({ params }) => {
  const { slug } = params;

  if (!slug) {
    return new Response('Not found', { status: 404 });
  }

  const posts = await getCollection('blog');

  // Find the post. Since we strictly use folder-per-post with date prefixes now,
  // the slug passed here (from getStaticPaths) matches the folder name logic.
  // In getStaticPaths we strip /index.mdx.
  const post = posts.find((p) => {
      const normalizedId = p.id.replace(/\/index\.mdx$/, '').replace(/\.mdx?$/, '');
      return normalizedId === slug;
  });

  if (!post) {
    return new Response('Not found', { status: 404 });
  }

  // Generate clean output
  // We manually reconstruct a clean frontmatter to avoid leaking internal fields if any
  const frontmatter = [
    '---',
    `title: "${post.data.title}"`,
    `description: "${post.data.description}"`,
    `pubDate: ${post.data.pubDate.toISOString()}`,
    post.data.tags ? `tags: [${post.data.tags.join(', ')}]` : null,
    '---',
    '',
  ].filter(Boolean).join('\n');

  // Simply return the raw body from the file
  // This might include component imports, but that's acceptable for "raw" source
  // The user requested "massive reduction", but stripping imports robustly with Regex is risky.
  // Let's at least provide the direct file content which is standard for "Raw View".
  // If we really want to strip imports:
  const cleanBody = post.body.replace(/^import .*$/gm, '').trim();

  return new Response(frontmatter + cleanBody, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map((post) => {
    // ID is like "2024-05-20-tech-demo/index.mdx"
    // Slug should be "2024-05-20-tech-demo"
    const slug = post.id.replace(/\/index\.mdx$/, '').replace(/\.mdx?$/, '');

    return {
      params: { slug },
    };
  });
}
