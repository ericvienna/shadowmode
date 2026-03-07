import { NextResponse } from 'next/server';

export interface TweetData {
  account: string;
  handle: string;
  text: string;
  url: string;
  date: string;
}

interface TweetsResponse {
  elon: TweetData | null;
  robotaxi: TweetData | null;
  timestamp: number;
  source: 'nitter' | 'news' | 'fallback';
}

let cache: TweetsResponse | null = null;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

const NITTER_INSTANCES = [
  'nitter.poast.org',
  'nitter.privacydev.net',
  'nitter.tiekoetter.com',
];

function parseNitterRSS(xml: string, handle: string): TweetData | null {
  const itemMatch = xml.match(/<item>([\s\S]*?)<\/item>/);
  if (!itemMatch) return null;

  const itemXml = itemMatch[1];
  const titleMatch = itemXml.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>|<title>([\s\S]*?)<\/title>/);
  const linkMatch = itemXml.match(/<link>(https?:\/\/[^\s<]+)<\/link>/);
  const pubDateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/);

  if (!titleMatch || !linkMatch) return null;

  // Strip leading "handle: " prefix nitter adds
  let text = (titleMatch[1] || titleMatch[2] || '').trim();
  text = text.replace(/^R to @\w+:\s*/, '').replace(/^@\w+:\s*/, '');

  let date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (pubDateMatch) {
    try {
      date = new Date(pubDateMatch[1]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch { /* keep default */ }
  }

  const rawUrl = linkMatch[1].trim();
  // Rewrite nitter URL to x.com
  const xUrl = rawUrl.replace(/^https?:\/\/[^/]+\//, 'https://x.com/');

  return {
    account: handle === 'elonmusk' ? 'Elon Musk' : '@robotaxi',
    handle,
    text,
    url: xUrl,
    date,
  };
}

async function fetchFromNitter(handle: string): Promise<TweetData | null> {
  for (const instance of NITTER_INSTANCES) {
    try {
      const res = await fetch(`https://${instance}/${handle}/rss`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ShadowMode/1.0)' },
        signal: AbortSignal.timeout(4000),
        next: { revalidate: 0 },
      });
      if (!res.ok) continue;
      const xml = await res.text();
      const tweet = parseNitterRSS(xml, handle);
      if (tweet) return tweet;
    } catch {
      continue;
    }
  }
  return null;
}

// Fallback: pull latest mention from Google News RSS
async function fetchFromNewsSearch(query: string, account: string, handle: string): Promise<TweetData | null> {
  try {
    const encoded = encodeURIComponent(query);
    const res = await fetch(
      `https://news.google.com/rss/search?q=${encoded}&hl=en-US&gl=US&ceid=US:en`,
      {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ShadowMode/1.0)' },
        signal: AbortSignal.timeout(5000),
        next: { revalidate: 0 },
      }
    );
    if (!res.ok) return null;

    const xml = await res.text();
    const itemMatch = xml.match(/<item>([\s\S]*?)<\/item>/);
    if (!itemMatch) return null;

    const itemXml = itemMatch[1];
    const titleMatch = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/);
    const linkMatch = itemXml.match(/<link>(https?:\/\/[^\s<]+)<\/link>/);
    const pubDateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/);

    if (!titleMatch) return null;

    const text = (titleMatch[1] || titleMatch[2] || '').trim().replace(/ - [^-]+$/, '');
    let date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (pubDateMatch) {
      try {
        date = new Date(pubDateMatch[1]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } catch { /* keep default */ }
    }

    return {
      account,
      handle,
      text: `[via news] ${text}`,
      url: linkMatch?.[1] ?? `https://x.com/${handle}`,
      date,
    };
  } catch {
    return null;
  }
}

export async function GET() {
  if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
    return NextResponse.json(cache);
  }

  // Try nitter first for both accounts in parallel
  const [elonNitter, robotaxiNitter] = await Promise.all([
    fetchFromNitter('elonmusk'),
    fetchFromNitter('robotaxi'),
  ]);

  let source: TweetsResponse['source'] = 'nitter';

  // Fall back to news search for any that nitter couldn't fetch
  const [elonFallback, robotaxiFallback] = await Promise.all([
    elonNitter ? Promise.resolve(null) : fetchFromNewsSearch('elon musk robotaxi tesla', 'Elon Musk', 'elonmusk'),
    robotaxiNitter ? Promise.resolve(null) : fetchFromNewsSearch('tesla robotaxi app launch', '@robotaxi', 'robotaxi'),
  ]);

  if (!elonNitter || !robotaxiNitter) source = 'news';

  const result: TweetsResponse = {
    elon: elonNitter ?? elonFallback,
    robotaxi: robotaxiNitter ?? robotaxiFallback,
    timestamp: Date.now(),
    source,
  };

  if (result.elon || result.robotaxi) {
    cache = result;
  }

  return NextResponse.json(result);
}
