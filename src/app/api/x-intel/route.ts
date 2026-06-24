import { NextResponse } from 'next/server';
import { getDashboardDataFromDB } from '@/lib/db';
import { fetchAllRawTweets } from '@/lib/x-intel/fetcher';
import { analyzeXIntel, getFallbackPayload } from '@/lib/x-intel/analyzer';
import type { XIntelPayload } from '@/types/x-intel';

let cache: { payload: XIntelPayload; timestamp: number } | null = null;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

export async function GET() {
  if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
    return NextResponse.json(cache.payload);
  }

  try {
    const [dashboard, raw] = await Promise.all([
      getDashboardDataFromDB(),
      fetchAllRawTweets(),
    ]);

    const payload = analyzeXIntel(raw.tweets, dashboard.states, raw.liveCount);
    cache = { payload, timestamp: Date.now() };

    return NextResponse.json(payload);
  } catch (err) {
    console.error('[x-intel] fetch failed:', err);

    try {
      const dashboard = await getDashboardDataFromDB();
      const fallback = getFallbackPayload(dashboard.states);
      return NextResponse.json({ ...fallback, source: 'seed' as const });
    } catch {
      return NextResponse.json(
        { error: 'X intelligence unavailable' },
        { status: 500 }
      );
    }
  }
}