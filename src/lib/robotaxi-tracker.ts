import type { RxtArea, RxtAreaStats, RxtPayload } from '@/types/robotaxi-tracker';
import { ingestRxtFleet } from '@/lib/firecrawl/rxt-ingestion';
import { hasFirecrawlKey } from '@/lib/firecrawl/client';
import { parseAreaFleet } from '@/lib/firecrawl/rxt-parser';
import { fetchPageFallback } from '@/lib/firecrawl/client';

export const RXT_AREAS: RxtArea[] = ['austin', 'bay-area', 'dallas', 'houston'];

const RXT_BASE = 'https://robotaxitracker.com';

const CACHE_TTL_MS = 15 * 60 * 1000;
const cache = new Map<string, { data: RxtPayload; ts: number }>();

async function fetchAreaStatsLegacy(area: RxtArea): Promise<RxtAreaStats> {
  const url = `${RXT_BASE}/?provider=tesla&area=${area}`;
  const html = await fetchPageFallback(url);
  return parseAreaFleet(html, area, url);
}

export async function getRobotaxiTrackerData(areas: RxtArea[] = RXT_AREAS): Promise<RxtPayload> {
  const key = areas.join(',');
  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < CACHE_TTL_MS) return hit.data;

  let payload: RxtPayload;

  if (hasFirecrawlKey()) {
    payload = await ingestRxtFleet(areas);
  } else {
    const results = await Promise.allSettled(areas.map((area) => fetchAreaStatsLegacy(area)));
    const resolved = results
      .filter((r): r is PromiseFulfilledResult<RxtAreaStats> => r.status === 'fulfilled')
      .map((r) => r.value);
    if (resolved.length === 0) {
      throw new Error('Failed to fetch any robotaxitracker areas');
    }
    payload = { areas: resolved, fetchedAt: new Date().toISOString() };
  }

  cache.set(key, { data: payload, ts: Date.now() });
  return payload;
}

export function getRxtAreaStats(payload: RxtPayload | null | undefined, area: RxtArea): RxtAreaStats | null {
  return payload?.areas.find((a) => a.area === area) ?? null;
}