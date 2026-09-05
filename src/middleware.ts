import { NextResponse, type NextRequest } from 'next/server';

/**
 * Accept negotiation for the content pages.
 *
 * Two jobs:
 *
 * 1. Rewrite to the markdown variant when a client actually prefers markdown.
 * 2. Set `Vary: Accept` on the markdown response.
 *
 * Vary matters more than it looks: a shared CDN caches whichever variant it saw
 * first and serves it to everyone, so without it an agent asking for markdown
 * gets whatever a browser fetched a moment earlier.
 *
 * The HTML side cannot be fixed from here. Next owns the Vary header for RSC
 * routing and overwrites it downstream of both middleware and next.config
 * headers() — verified against `next start`: a sibling probe header set in the
 * same headers() block arrives intact while Vary comes back as
 * `rsc, next-router-*, Accept-Encoding` with Accept stripped. So the HTML
 * variant's Vary is declared at the edge in vercel.json instead, which is the
 * layer that actually owns the CDN cache key. If that file is ever removed,
 * this negotiation becomes unsafe — the two belong together.
 */

const NEGOTIABLE = new Set(['/', '/about', '/contact', '/privacy']);

/**
 * True only when the client ranks text/markdown above text/html by q-value.
 * A browser sends `text/html,...,*\/*;q=0.8` — the wildcard must not count as
 * a request for markdown, or every browser gets served plain text.
 */
function prefersMarkdown(accept: string | null): boolean {
  if (!accept) return false;

  let markdownQ = -1;
  let htmlQ = -1;

  for (const raw of accept.split(',')) {
    const [type, ...params] = raw.trim().split(';');
    const mediaType = type.trim().toLowerCase();

    let q = 1;
    for (const p of params) {
      const [k, v] = p.split('=').map((s) => s.trim());
      if (k === 'q') {
        const parsed = Number.parseFloat(v);
        if (!Number.isNaN(parsed)) q = parsed;
      }
    }

    if (mediaType === 'text/markdown' || mediaType === 'text/x-markdown') {
      markdownQ = Math.max(markdownQ, q);
    } else if (mediaType === 'text/html' || mediaType === 'application/xhtml+xml') {
      htmlQ = Math.max(htmlQ, q);
    }
  }

  return markdownQ > 0 && markdownQ >= htmlQ;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!NEGOTIABLE.has(pathname)) return NextResponse.next();

  const vary = 'Accept, Accept-Encoding';

  if (prefersMarkdown(request.headers.get('accept'))) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === '/' ? '/md' : `/md${pathname}`;
    const response = NextResponse.rewrite(url);
    response.headers.set('Vary', vary);
    return response;
  }

  // No Vary set here: Next strips Accept from it (see the note above). The HTML
  // variant gets its Vary from vercel.json at the edge.
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/about', '/contact', '/privacy'],
};
