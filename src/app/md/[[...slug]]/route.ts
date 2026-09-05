import { MARKDOWN_PAGES } from '@/lib/markdown-pages';

export const dynamic = 'force-static';

/**
 * Markdown variants of the content pages, served under Accept negotiation.
 *
 * middleware.ts rewrites here when a client asks for text/markdown and sets
 * `Vary: Accept` on every response so a CDN cannot hand the HTML variant to an
 * agent that asked for markdown (or the reverse) depending on which one landed
 * in cache first. The path is also directly fetchable — /md/about — because an
 * agent that cannot set headers should still be able to get the text.
 *
 * These carry no figures. Numbers live behind /openapi.json where they arrive
 * with their source and caveat attached; a number copied into prose here would
 * be a second, silently stale copy.
 */

export function generateStaticParams() {
  return Object.keys(MARKDOWN_PAGES).map((slug) => ({
    slug: slug === '' ? [] : slug.split('/'),
  }));
}

type Ctx = { params: Promise<{ slug?: string[] }> };

export async function GET(_request: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const key = (slug ?? []).join('/');
  const body = MARKDOWN_PAGES[key];

  if (!body) {
    return new Response(
      `# Not found\n\nNo markdown variant for \`/${key}\`.\n\n` +
        `Available: ${Object.keys(MARKDOWN_PAGES)
          .map((k) => `\`/${k}\``)
          .join(', ')}\n\n` +
        `Machine-readable API: https://shadowmode.us/openapi.json\n`,
      {
        status: 404,
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          Vary: 'Accept, Accept-Encoding',
          'Cache-Control': 'no-store',
        },
      }
    );
  }

  return new Response(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      Vary: 'Accept, Accept-Encoding',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
