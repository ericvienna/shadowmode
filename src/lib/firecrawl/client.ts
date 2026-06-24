const FIRECRAWL_API = 'https://api.firecrawl.dev/v1/scrape';

export interface FirecrawlScrapeResult {
  markdown: string;
  url: string;
  fetchedAt: string;
}

export function hasFirecrawlKey(): boolean {
  return Boolean(process.env.FIRECRAWL_API_KEY?.trim());
}

export async function firecrawlScrape(
  url: string,
  options?: { waitFor?: number; onlyMainContent?: boolean }
): Promise<FirecrawlScrapeResult> {
  const apiKey = process.env.FIRECRAWL_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('FIRECRAWL_API_KEY not configured');
  }

  const response = await fetch(FIRECRAWL_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url,
      formats: ['markdown'],
      onlyMainContent: options?.onlyMainContent ?? true,
      waitFor: options?.waitFor ?? 2000,
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Firecrawl scrape failed ${response.status} for ${url}: ${body.slice(0, 200)}`);
  }

  const json = (await response.json()) as {
    success?: boolean;
    data?: { markdown?: string };
  };

  const markdown = json.data?.markdown ?? '';
  if (!markdown.trim()) {
    throw new Error(`Firecrawl returned empty markdown for ${url}`);
  }

  return { markdown, url, fetchedAt: new Date().toISOString() };
}

/** Plain fetch fallback when Firecrawl key absent (dev/local). */
export async function fetchPageFallback(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (compatible; ShadowmodeBot/1.0; +https://shadowmode.us) AppleWebKit/537.36',
      Accept: 'text/html,application/xhtml+xml',
    },
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) throw new Error(`Fetch failed ${response.status} for ${url}`);
  return response.text();
}