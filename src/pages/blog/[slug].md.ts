import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ params }) => {
  const { slug } = params;

  if (!slug) {
    return new Response('Not found', { status: 404 });
  }

  const posts = await getCollection('blog');
  const post = posts.find((p) => p.id === slug || p.id === `${slug}/index.mdx` || p.id.startsWith(slug));

  if (!post) {
    return new Response('Not found', { status: 404 });
  }

  // We want to return the raw body
  // Since we are using the glob loader, the body is available as standard.
  // However, with Content Collections in Astro 5, `body` might not be directly exposed if using MDX?
  // Actually, for `glob` loader with MDX, `body` is the raw content.

  return new Response(post.body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map((post) => {
    // Handle the ID which might be "folder/index" or just "id"
    // We want the slug to be the folder name
    const slug = post.id.endsWith('/index.mdx')
        ? post.id.replace('/index.mdx', '')
        : post.id.replace('.mdx', '');

    return {
      params: { slug },
    };
  });
}
