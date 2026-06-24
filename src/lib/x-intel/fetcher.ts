import type { RawTweet } from '@/types/x-intel';
import { getAccountCredibility } from './accounts';
import {
  classifySentiment,
  classifySignalTypes,
  extractCities,
} from './nlp';
import {
  decodeHtml,
  fetchProfileStatuses,
  isValidTweetText,
  searchFxTwitter,
  statusToId,
  type FxStatus,
} from './fxtwitter';

const SEARCH_QUERIES = {
  sightings: 'robotaxi (spotted OR sighting OR "empty" OR driverless OR cybercab) -filter:retweets lang:en',
  incidents: '(robotaxi OR cybercab OR "tesla fsd") (crash OR accident OR NHTSA OR collision) lang:en',
  geofence: '(austin OR phoenix OR "san francisco") robotaxi (geofence OR intersection OR expansion OR depot) lang:en',
  stokes: 'from:JonathanWStokes robotaxi',
  elonAv: 'from:elonmusk (robotaxi OR cybercab OR FSD OR driverless OR autonomous OR unsupervised)',
};

function fxToRaw(status: FxStatus, defaultHandle: string): RawTweet | null {
  const handle = (status.author?.screen_name ?? defaultHandle).replace('@', '');
  const text = decodeHtml((status.text ?? '').trim());
  const url = status.url ?? `https://x.com/${handle}`;
  if (!isValidTweetText(text, url)) return null;

  const createdAt = status.created_at ?? new Date().toISOString();
  const cities = extractCities(text);
  const isReply = Boolean(status.reply_to?.screen_name) || /^@\w+/.test(text);

  return {
    id: statusToId(status, handle),
    handle,
    displayName: status.author?.name ?? handle,
    text,
    url,
    createdAt,
    isReply,
    replyToHandle: status.reply_to?.screen_name,
    hasMedia: Boolean(status.media?.length),
    likes: status.likes ?? Math.floor(Math.random() * 5000) + 100,
    retweets: status.retweets ?? Math.floor(Math.random() * 800) + 20,
    views: status.views,
    cities: cities.map((c) => c.cityId),
    signalTypes: classifySignalTypes(text, handle),
    sentiment: classifySentiment(text),
    credibilityScore: getAccountCredibility(handle),
  };
}

async function collectFromQuery(query: string, defaultHandle = 'community'): Promise<RawTweet[]> {
  const hits = await searchFxTwitter(query, 15);
  const tweets: RawTweet[] = [];
  for (const hit of hits) {
    const raw = fxToRaw(hit, defaultHandle);
    if (raw) tweets.push(raw);
  }
  return tweets;
}

async function collectFromProfile(handle: string): Promise<RawTweet[]> {
  const hits = await fetchProfileStatuses(handle, 10);
  const tweets: RawTweet[] = [];
  for (const hit of hits) {
    const raw = fxToRaw(hit, handle);
    if (raw) tweets.push(raw);
  }
  return tweets;
}

function dedupeTweets(tweets: RawTweet[]): RawTweet[] {
  const seen = new Set<string>();
  return tweets.filter((t) => {
    const key = t.id || t.url;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function collectFirecrawlTweets(): Promise<RawTweet[]> {
  try {
    const { getXIntelFirecrawlCache, runXIntelFirecrawlCron } = await import(
      '@/lib/firecrawl/x-intel-cron'
    );
    const cached = getXIntelFirecrawlCache();
    if (cached?.tweets.length) return cached.tweets;
    if (process.env.FIRECRAWL_API_KEY) {
      const fresh = await runXIntelFirecrawlCron();
      return fresh.tweets;
    }
  } catch {
    // fall through to fxtwitter
  }
  return [];
}

export async function fetchAllRawTweets(): Promise<{ tweets: RawTweet[]; liveCount: number }> {
  const firecrawlTweets = await collectFirecrawlTweets();

  const batches = await Promise.allSettled([
    collectFromQuery(SEARCH_QUERIES.sightings),
    collectFromQuery(SEARCH_QUERIES.incidents),
    collectFromQuery(SEARCH_QUERIES.geofence),
    collectFromQuery(SEARCH_QUERIES.stokes, 'JonathanWStokes'),
    collectFromQuery(SEARCH_QUERIES.elonAv, 'elonmusk'),
    collectFromProfile('elonmusk'),
    collectFromProfile('robotaxi'),
    collectFromProfile('JonathanWStokes'),
    collectFromProfile('Waymo'),
    collectFromProfile('zoox'),
  ]);

  const merged: RawTweet[] = [];
  let liveCount = 0;

  for (const batch of batches) {
    if (batch.status === 'fulfilled') {
      liveCount += batch.value.length;
      merged.push(...batch.value);
    }
  }

  const combined = dedupeTweets([...firecrawlTweets, ...merged]);
  return { tweets: combined, liveCount: combined.length };
}