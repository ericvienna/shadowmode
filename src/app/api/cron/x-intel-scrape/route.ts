import { NextResponse } from 'next/server';
import { runXIntelFirecrawlCron } from '@/lib/firecrawl/x-intel-cron';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV === 'development';
  return request.headers.get('authorization') === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runXIntelFirecrawlCron();
    return NextResponse.json({
      ok: true,
      profiles: result.profiles,
      tweetCount: result.tweets.length,
      fetchedAt: result.fetchedAt,
    });
  } catch (error) {
    console.error('[cron/x-intel-scrape]', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'scrape failed' },
      { status: 500 }
    );
  }
}