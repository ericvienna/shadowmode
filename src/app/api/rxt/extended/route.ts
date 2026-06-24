import { NextResponse } from 'next/server';
import { ingestRxtExtended } from '@/lib/firecrawl/rxt-ingestion';
import type { RxtExtendedPayload } from '@/types/rxt-extended';

export const revalidate = 900;

let cache: { data: RxtExtendedPayload; ts: number } | null = null;
const CACHE_MS = 15 * 60 * 1000;

export async function GET() {
  if (cache && Date.now() - cache.ts < CACHE_MS) {
    return NextResponse.json(cache.data);
  }

  try {
    const data = await ingestRxtExtended();
    cache = { data, ts: Date.now() };
    return NextResponse.json(data);
  } catch (error) {
    console.error('[rxt/extended]', error);
    return NextResponse.json({ error: 'RXT extended ingestion failed' }, { status: 502 });
  }
}