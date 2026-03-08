import { NextResponse } from 'next/server';

interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  date: string;
  snippet?: string;
}

// Cache news for 15 minutes
let cachedNews: NewsItem[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

// Parse Google News RSS feed
function parseRSS(xml: string): NewsItem[] {
  const items: NewsItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  let index = 0;

  while ((match = itemRegex.exec(xml)) !== null && index < 20) {
    const itemXml = match[1];

    const titleMatch = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/);
    const linkMatch = itemXml.match(/<link>(.*?)<\/link>/);
    const pubDateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/);
    const sourceMatch = itemXml.match(/<source.*?>(.*?)<\/source>/);

    if (titleMatch && linkMatch) {
      const title = (titleMatch[1] || titleMatch[2] || '').trim();
      const url = linkMatch[1].trim();

      // Skip if title contains common spam patterns
      if (title.includes('[Removed]') || !title) continue;

      // Extract source from title if not in source tag (Google News format: "Title - Source")
      let source = sourceMatch ? sourceMatch[1].trim() : '';
      if (!source && title.includes(' - ')) {
        const parts = title.split(' - ');
        source = parts[parts.length - 1];
      }

      // Parse date
      let date = new Date().toISOString().split('T')[0];
      if (pubDateMatch) {
        try {
          date = new Date(pubDateMatch[1]).toISOString().split('T')[0];
        } catch {
          // Keep default date
        }
      }

      items.push({
        id: `news-${index}-${Date.now()}`,
        title: title.replace(/ - [^-]+$/, ''), // Remove source from title
        source: source || 'News',
        url,
        date,
      });

      index++;
    }
  }

  return items;
}

export async function GET() {
  // Return cached data if still valid
  if (cachedNews && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return NextResponse.json({ articles: cachedNews, cached: true });
  }

  try {
    // Fetch from Google News RSS - search for Tesla robotaxi news
    const searchQuery = encodeURIComponent('tesla robotaxi OR tesla FSD autonomous');
    const response = await fetch(
      `https://news.google.com/rss/search?q=${searchQuery}&hl=en-US&gl=US&ceid=US:en`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ShadowMode/1.0)',
        },
        next: { revalidate: 900 },
      }
    );

    if (!response.ok) {
      throw new Error(`Google News RSS error: ${response.status}`);
    }

    const xml = await response.text();
    const articles = parseRSS(xml);

    if (articles.length === 0) {
      throw new Error('No articles parsed from RSS');
    }

    // Cache the results
    cachedNews = articles;
    cacheTimestamp = Date.now();

    return NextResponse.json({ articles, cached: false });
  } catch (error) {
    console.error('News RSS error:', error);

    // Return cached data if available, even if expired
    if (cachedNews) {
      return NextResponse.json({ articles: cachedNews, cached: true, stale: true });
    }

    return NextResponse.json(
      { error: 'Failed to fetch news', articles: [] },
      { status: 500 }
    );
  }
}
