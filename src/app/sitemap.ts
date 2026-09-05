import { MetadataRoute } from 'next';
import { SEED_DATA } from '@/lib/seed-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://shadowmode.us';

  // Generate city URLs
  const cityUrls: MetadataRoute.Sitemap = [];

  SEED_DATA.forEach(state => {
    state.cities.forEach(city => {
      const slug = `${city.name.toLowerCase().replace(/[,\s]+/g, '-')}-${state.abbreviation.toLowerCase()}`;
      cityUrls.push({
        url: `${baseUrl}/city/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      });
    });
  });

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
    {
      url: `${baseUrl}/energy`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/semi`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    // Trust anchors — the pages an agent checks before it will cite a source.
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    ...cityUrls,
  ];
}
