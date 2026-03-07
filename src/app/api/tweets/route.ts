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
  source: 'nitter' | 'syndication' | 'none';
}

let cache: TweetsResponse | null = null;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Try many instances in parallel — first success wins
const NITTER_INSTANCES = [
  'nitter.poast.org',
  'nitter.privacydev.net',
  'nitter.tiekoetter.com',
  'nitter.1d4.us',
  'nitter.d420.de',
  'nitter.fdn.fr',
  'n.opnxng.com',
  'nitter.kavin.rocks',
  'nitter.it',
  'nttr.stream',
  'nitter.mint.lgbt',
  'nitter.nixnet.services',
  'nitter.pussthecat.org',
  'xcancel.com',
  'nitter.unixfox.eu',
];

function parseNitterRSS(xml: string, handle: string): TweetData | null {
  const itemMatch = xml.match(/<item>([\s\S]*?)<\/item>/);
  if (!itemMatch) return null;

  const itemXml = itemMatch[1];
  const titleMatch = itemXml.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>|<title>([\s\S]*?)<\/title>/);
  const linkMatch = itemXml.match(/<link>(https?:\/\/[^\s<]+)<\/link>/);
  const pubDateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/);

  if (!titleMatch || !linkMatch) return null;

  let text = (titleMatch[1] || titleMatch[2] || '').trim();
  text = text.replace(/^R to @\w+:\s*/, '').replace(/^@\w+:\s*/, '');
  if (!text) return null;

  let date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (pubDateMatch) {
    try { date = new Date(pubDateMatch[1]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }
    catch { /* keep default */ }
  }

  const xUrl = linkMatch[1].trim().replace(/^https?:\/\/[^/]+\//, 'https://x.com/');

  return {
    account: handle === 'elonmusk' ? 'Elon Musk' : '@robotaxi',
    handle,
    text,
    url: xUrl,
    date,
  };
}

// Fire all Nitter instances in parallel, return first success
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

// Twitter's own syndication API — powers official embedded timelines
// Returns HTML with __NEXT_DATA__ JSON containing real tweet content
async function fetchFromSyndication(handle: string): Promise<TweetData | null> {
  try {
    const res = await fetch(
      `https://syndication.twitter.com/srv/timeline-profile/screen-name/${handle}?count=3&lang=en`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Referer': 'https://platform.twitter.com/',
        },
        signal: AbortSignal.timeout(6000),
        next: { revalidate: 0 },
      }
    );
    if (!res.ok) return null;

    const html = await res.text();

    // Extract embedded JSON from Next.js data script
    const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([^<]+)<\/script>/);
    if (!match) return null;

    const data = JSON.parse(match[1]);
    const entries: unknown[] = data?.props?.pageProps?.timeline?.entries ?? [];
    if (!Array.isArray(entries) || entries.length === 0) return null;

    // Find first real tweet entry (skip pinned/promoted)
    const entry = entries.find(
      (e): e is { content: { tweet: Record<string, unknown> } } =>
        typeof e === 'object' && e !== null &&
        'content' in e && typeof (e as Record<string,unknown>).content === 'object' &&
        (e as { content: Record<string,unknown> }).content !== null &&
        'tweet' in ((e as { content: Record<string,unknown> }).content)
    );
    if (!entry) return null;

    const tweet = entry.content.tweet;
    let text = (tweet.full_text ?? tweet.text ?? '') as string;
    if (!text) return null;
    // Decode common HTML entities from syndication API
    text = text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

    const tweetId = (tweet.id_str ?? tweet.id ?? '') as string;
    const createdAt = tweet.created_at as string | undefined;

    let date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (createdAt) {
      try { date = new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }
      catch { /* keep default */ }
    }

    return {
      account: handle === 'elonmusk' ? 'Elon Musk' : '@robotaxi',
      handle,
      text,
      url: tweetId ? `https://x.com/${handle}/status/${tweetId}` : `https://x.com/${handle}`,
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

  // Try Nitter (all instances in parallel) and syndication simultaneously
  const [[elonNitter, robotaxiNitter], [elonSyndication, robotaxiSyndication]] = await Promise.all([
    Promise.all([fetchFromNitter('elonmusk'), fetchFromNitter('robotaxi')]),
    Promise.all([fetchFromSyndication('elonmusk'), fetchFromSyndication('robotaxi')]),
  ]);

  const elon     = elonNitter     ?? elonSyndication     ?? null;
  const robotaxi = robotaxiNitter ?? robotaxiSyndication ?? null;
  const source: TweetsResponse['source'] =
    (elonNitter || robotaxiNitter)     ? 'nitter'       :
    (elonSyndication || robotaxiSyndication) ? 'syndication' : 'none';

  const result: TweetsResponse = {
    elon,
    robotaxi,
    timestamp: Date.now(),
    source,
  };

  // Only cache if we got real data
  if (elon || robotaxi) cache = result;

  return NextResponse.json(result);
}
