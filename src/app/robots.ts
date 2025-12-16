import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',        // API routes (OG image generator, etc.)
        '/_next/',      // Next.js internal routes
        '/icon.png',    // Asset files
        '/apple-icon.png',
      ],
    },
    sitemap: 'https://shadowmode.us/sitemap.xml',
  };
}
