import { NextResponse } from 'next/server';

interface NewsAPIArticle {
  title: string;
  source: { name: string };
  url: string;
  publishedAt: string;
  description: string | null;
}

interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  date: string;
  snippet?: string;
}

// Cache news for 15 minutes to avoid rate limiting
let cachedNews: NewsItem[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

const NEWS_API_KEY = process.env.NEWS_API_KEY || '75d8b37e8cfd432ab7d80405536d19cf';

export async function GET() {
  // Return cached data if still valid
  if (cachedNews && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return NextResponse.json({ articles: cachedNews, cached: true });
  }

  try {
    // Search for Tesla robotaxi news
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=tesla+robotaxi+OR+tesla+FSD+OR+tesla+autonomous&sortBy=publishedAt&language=en&pageSize=20&apiKey=${NEWS_API_KEY}`,
      {
        headers: {
          'User-Agent': 'ShadowMode/1.0',
        },
        next: { revalidate: 900 }, // 15 minutes
      }
    );

    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'ok') {
      throw new Error(data.message || 'NewsAPI returned error');
    }

    // Transform to our format
    const articles: NewsItem[] = data.articles
      .filter((article: NewsAPIArticle) =>
        article.title &&
        article.url &&
        !article.title.includes('[Removed]') &&
        article.source?.name
      )
      .map((article: NewsAPIArticle, index: number) => ({
        id: `news-${index}-${Date.now()}`,
        title: article.title,
        source: article.source.name,
        url: article.url,
        date: article.publishedAt.split('T')[0],
        snippet: article.description || undefined,
      }));

    // Cache the results
    cachedNews = articles;
    cacheTimestamp = Date.now();

    return NextResponse.json({ articles, cached: false });
  } catch (error) {
    console.error('News API error:', error);

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
