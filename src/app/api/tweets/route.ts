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
  source: 'fxtwitter' | 'syndication' | 'nitter' | 'none';
}

let cache: TweetsResponse | null = null;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

const ROBOTAXI_KEYWORDS =
  /robotaxi|cybercab|fsd|full self.?driving|driverless|autonomous|unsupervised|safety monitor|geofence/i;

const GARBAGE_PATTERNS =
  /rss reader not yet whitelist|verifying your browser|nitter|enable javascript|access denied|rate limit/i;

const NITTER_INSTANCES = [
  'nitter.tiekoetter.com',
  'nitter.d420.de',
  'nitter.fdn.fr',
];

type FxStatus = {
  text?: string;
  url?: string;
  created_at?: string;
  author?: { screen_name?: string };
};

function decodeHtml(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function formatTweetDate(raw?: string): string {
  if (!raw) {
    return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  try {
    return new Date(raw).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

function isValidTweet(text: string, url?: string): boolean {
  if (!text || text.length < 3) return false;
  if (GARBAGE_PATTERNS.test(text)) return false;
  if (url && (url.endsWith('/rss') || url.includes('rss.xcancel'))) return false;
  return true;
}

function toTweetData(status: FxStatus, handle: string, account: string): TweetData | null {
  const text = decodeHtml((status.text ?? '').trim());
  const url = status.url ?? '';
  if (!isValidTweet(text, url)) return null;
  return {
    account,
    handle,
    text,
    url: url || `https://x.com/${handle}`,
    date: formatTweetDate(status.created_at),
  };
}

async function fetchFxStatuses(path: string): Promise<FxStatus[]> {
  try {
    const res = await fetch(`https://api.fxtwitter.com${path}`, {
      headers: { 'User-Agent': 'ShadowMode/1.0 (+https://shadowmode.us)' },
      signal: AbortSignal.timeout(10000),
      next: { revalidate: 0 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.results) ? data.results : [];
  } catch {
    return [];
  }
}

async function fetchFromFxTwitter(handle: string): Promise<TweetData | null> {
  const account = handle === 'elonmusk' ? 'Elon Musk' : '@robotaxi';

  if (handle === 'elonmusk') {
    const searchQuery = encodeURIComponent(
      'from:elonmusk (robotaxi OR cybercab OR FSD OR driverless OR autonomous OR unsupervised)'
    );
    const searchHits = await fetchFxStatuses(`/2/search?q=${searchQuery}`);
    for (const hit of searchHits) {
      const tweet = toTweetData(hit, handle, account);
      if (tweet) return tweet;
    }
  }

  const timeline = await fetchFxStatuses(`/2/profile/${handle}/statuses`);
  for (const hit of timeline) {
    const author = hit.author?.screen_name?.toLowerCase();
    if (author && author !== handle.toLowerCase()) continue;
    const text = decodeHtml((hit.text ?? '').trim());
    if (handle === 'elonmusk' && !ROBOTAXI_KEYWORDS.test(text)) continue;
    const tweet = toTweetData(hit, handle, account);
    if (tweet) return tweet;
  }

  return null;
}

function parseNitterRSS(xml: string, handle: string): TweetData | null {
  const itemMatch = xml.match(/<item>([\s\S]*?)<\/item>/);
  if (!itemMatch) return null;

  const itemXml = itemMatch[1];
  const titleMatch = itemXml.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>|<title>([\s\S]*?)<\/title>/);
  const linkMatch = itemXml.match(/<link>(https?:\/\/[^\s<]+)<\/link>/);
  const pubDateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/);

  if (!titleMatch || !linkMatch) return null;

  let text = decodeHtml((titleMatch[1] || titleMatch[2] || '').trim());
  text = text.replace(/^R to @\w+:\s*/, '').replace(/^@\w+:\s*/, '');
  const xUrl = linkMatch[1].trim().replace(/^https?:\/\/[^/]+\//, 'https://x.com/');
  if (!isValidTweet(text, xUrl)) return null;

  let date = formatTweetDate();
  if (pubDateMatch) date = formatTweetDate(pubDateMatch[1]);

  return {
    account: handle === 'elonmusk' ? 'Elon Musk' : '@robotaxi',
    handle,
    text,
    url: xUrl,
    date,
  };
}

async function fetchFromNitter(handle: string): Promise<TweetData | null> {
  const attempts = NITTER_INSTANCES.map(async (instance) => {
    const res = await fetch(`https://${instance}/${handle}/rss`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ShadowMode/1.0)' },
      signal: AbortSignal.timeout(3000),
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error('not ok');
    const xml = await res.text();
    const tweet = parseNitterRSS(xml, handle);
    if (!tweet) throw new Error('no tweet');
    return tweet;
  });

  try {
    return await Promise.any(attempts);
  } catch {
    return null;
  }
}

async function fetchFromSyndication(handle: string): Promise<TweetData | null> {
  try {
    const res = await fetch(
      `https://syndication.twitter.com/srv/timeline-profile/screen-name/${handle}?count=5&lang=en`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          Referer: 'https://platform.twitter.com/',
        },
        signal: AbortSignal.timeout(6000),
        next: { revalidate: 0 },
      }
    );
    if (!res.ok) return null;

    const html = await res.text();
    const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([^<]+)<\/script>/);
    if (!match) return null;

    const data = JSON.parse(match[1]);
    const entries: unknown[] = data?.props?.pageProps?.timeline?.entries ?? [];
    if (!Array.isArray(entries) || entries.length === 0) return null;

    for (const entry of entries) {
      if (
        typeof entry !== 'object' ||
        entry === null ||
        !('content' in entry) ||
        typeof (entry as Record<string, unknown>).content !== 'object' ||
        (entry as { content: Record<string, unknown> }).content === null ||
        !('tweet' in (entry as { content: Record<string, unknown> }).content)
      ) {
        continue;
      }

      const tweet = (entry as { content: { tweet: Record<string, unknown> } }).content.tweet;
      const text = decodeHtml(((tweet.full_text ?? tweet.text ?? '') as string).trim());
      if (!isValidTweet(text)) continue;
      if (handle === 'elonmusk' && !ROBOTAXI_KEYWORDS.test(text)) continue;

      const tweetId = (tweet.id_str ?? tweet.id ?? '') as string;
      const url = tweetId ? `https://x.com/${handle}/status/${tweetId}` : `https://x.com/${handle}`;

      return {
        account: handle === 'elonmusk' ? 'Elon Musk' : '@robotaxi',
        handle,
        text,
        url,
        date: formatTweetDate(tweet.created_at as string | undefined),
      };
    }

    return null;
  } catch {
    return null;
  }
}

export async function GET() {
  if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
    return NextResponse.json(cache);
  }

  const [elonFx, robotaxiFx, elonNitter, robotaxiNitter, elonSyndication, robotaxiSyndication] =
    await Promise.all([
      fetchFromFxTwitter('elonmusk'),
      fetchFromFxTwitter('robotaxi'),
      fetchFromNitter('elonmusk'),
      fetchFromNitter('robotaxi'),
      fetchFromSyndication('elonmusk'),
      fetchFromSyndication('robotaxi'),
    ]);

  const elon = elonFx ?? elonSyndication ?? elonNitter ?? null;
  const robotaxi = robotaxiFx ?? robotaxiSyndication ?? robotaxiNitter ?? null;
  const source: TweetsResponse['source'] = elonFx || robotaxiFx
    ? 'fxtwitter'
    : elonSyndication || robotaxiSyndication
      ? 'syndication'
      : elonNitter || robotaxiNitter
        ? 'nitter'
        : 'none';

  const result: TweetsResponse = {
    elon,
    robotaxi,
    timestamp: Date.now(),
    source,
  };

  if (elon || robotaxi) cache = result;

  return NextResponse.json(result);
}