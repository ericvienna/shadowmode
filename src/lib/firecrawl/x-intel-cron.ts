import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { firecrawlScrape, hasFirecrawlKey } from './client';
import {
  X_INTEL_PROFILES,
  parseXProfileMarkdown,
  postsToRawTweets,
  filterAvPosts,
} from './x-profile-parser';
import type { RawTweet } from '@/types/x-intel';

const CACHE_PATH = join(process.cwd(), 'data', 'x-intel-firecrawl-cache.json');

let memoryCache: { tweets: RawTweet[]; fetchedAt: string } | null = null;

export async function runXIntelFirecrawlCron(): Promise<{
  tweets: RawTweet[];
  fetchedAt: string;
  profiles: string[];
}> {
  if (!hasFirecrawlKey()) {
    throw new Error('FIRECRAWL_API_KEY required for X intel cron');
  }

  const allTweets: RawTweet[] = [];
  const profiles: string[] = [];

  for (const profile of X_INTEL_PROFILES) {
    const { markdown } = await firecrawlScrape(profile.url, { waitFor: 3000 });
    const posts = parseXProfileMarkdown(markdown, profile.handle);
    const relevant = profile.handle === 'elonmusk' ? filterAvPosts(posts) : posts;
    const tweets = postsToRawTweets(relevant.length > 0 ? relevant : posts.slice(0, 5), profile.handle);
    allTweets.push(...tweets);
    profiles.push(profile.handle);
  }

  const payload = { tweets: allTweets, fetchedAt: new Date().toISOString() };
  memoryCache = payload;

  try {
    const dir = join(process.cwd(), 'data');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(CACHE_PATH, JSON.stringify(payload, null, 2));
  } catch {
    // serverless — memory cache only
  }

  return { ...payload, profiles };
}

export function getXIntelFirecrawlCache(): { tweets: RawTweet[]; fetchedAt: string } | null {
  return memoryCache;
}