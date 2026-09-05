import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        // The public read API is the product for an agent, not an internal
        // detail. Blanket-disallowing /api told every crawler to look away
        // from the only machine-readable surface this site has.
        '/api/fleet',
        '/api/av-data',
        '/api/rxt',
        '/api/stock',
        '/api/predictions',
        '/api/changelog',
        '/api/living-receipts',
        '/api/news',
        '/api/tweets',
        '/api/x-intel',
        '/openapi.json',
        '/llms.txt',
        '/md',
      ],
      disallow: [
        '/api/admin/',   // auth-gated
        '/api/cron/',    // scheduled jobs, not a public surface
        '/api/alerts/',  // dispatch
        '/api/subscribe',
        '/api/send-update',
        '/api/og',       // image generator, nothing to read
        '/admin',
        '/_next/',
        '/icon.png',
        '/apple-icon.png',
      ],
    },
    sitemap: 'https://shadowmode.us/sitemap.xml',
  };
}
