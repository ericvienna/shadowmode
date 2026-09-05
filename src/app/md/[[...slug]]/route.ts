import { MARKDOWN_PAGES } from '@/lib/markdown-pages';

export const dynamic = 'force-static';

/**
 * Markdown variants of the content pages, at their own URLs.
 *
 * Deliberately NOT served by Accept negotiation on /about. That was built,
 * deployed and then removed on 2026-09-05, because it cannot be made safe here:
 * Next owns the Vary header for RSC routing and strips Accept from it, and a
 * vercel.json edge header does not survive either — verified on production,
 * where /about came back `Vary: rsc, next-router-*` with `x-vercel-cache: HIT`.
 * Negotiating two representations at one URL while the CDN keys the cache
 * without Accept means an agent asking for markdown can be handed a cached HTML
 * page, or a browser handed markdown. Two URLs have no such failure mode.
 *
 * Discovery instead comes from <link rel="alternate" type="text/markdown"> in
 * the document head, the entries in /llms.txt, and the guessable path itself.
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
