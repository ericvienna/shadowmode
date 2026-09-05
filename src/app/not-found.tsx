import Link from 'next/link';

export const metadata = {
  title: 'Not found — SHADOWMODE',
};

/**
 * A 404 an agent can recover from.
 *
 * The default returned a real 404 status but an empty app shell, so a client
 * that guessed a URL learned only that it was wrong — not where to look next.
 * The links below are the site map in the response body.
 */
export default function NotFound() {
  return (
    <main className="min-h-screen bg-black text-neutral-300">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <p className="text-xs tracking-widest text-neutral-600">404</p>
        <h1 className="mt-4 text-2xl font-semibold tracking-widest text-neutral-100">
          NO PAGE HERE
        </h1>

        <div className="prose-shadowmode mt-8 normal-case leading-relaxed text-neutral-400">
          <p>
            That path does not exist on SHADOWMODE. It was not moved and it is not
            temporarily down — there is nothing at this URL. Here is everything there is:
          </p>

          <h2>Pages</h2>
          <ul>
            <li><Link href="/">Terminal</Link> — robotaxi deployment matrix, map and timeline</li>
            <li><Link href="/energy">Energy</Link> — storage deployment and Megapack scoreboard</li>
            <li><Link href="/semi">Semi</Link> — Tesla Semi contract ledger</li>
            <li><Link href="/about">About</Link> — sourcing, corrections, and what this will not answer</li>
            <li><Link href="/contact">Contact</Link> · <Link href="/privacy">Privacy</Link></li>
          </ul>

          <h2>Machine-readable</h2>
          <ul>
            <li><a href="/openapi.json">/openapi.json</a> — full API contract</li>
            <li><a href="/llms.txt">/llms.txt</a> — when to use each endpoint</li>
            <li><a href="/sitemap.xml">/sitemap.xml</a> — every page</li>
            <li><a href="/md">/md</a> — these pages as markdown</li>
          </ul>

          <p>
            Looking for a city? City pages live at <code>/city/&lt;name&gt;-&lt;state&gt;</code>,
            for example <Link href="/city/austin-tx">/city/austin-tx</Link>. The full list is in
            the sitemap.
          </p>
        </div>
      </div>
    </main>
  );
}
