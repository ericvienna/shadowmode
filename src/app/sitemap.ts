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
    ...cityUrls,
  ];
}
