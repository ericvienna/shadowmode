import type { RxtArea, RxtPayload } from '@/types/robotaxi-tracker';
import type { RxtExtendedPayload } from '@/types/rxt-extended';
import { firecrawlScrape, fetchPageFallback, hasFirecrawlKey } from './client';
import {
  parseAreaFleet,
  parseCommunityOps,
  parseUnsupervisedMonitor,
  parseRegulatoryCrosscheck,
  buildExtendedPayload,
} from './rxt-parser';
import { RXT_AREAS } from '@/lib/robotaxi-tracker';

const RXT_BASE = 'https://robotaxitracker.com';

async function fetchContent(url: string): Promise<string> {
  if (hasFirecrawlKey()) {
    const { markdown } = await firecrawlScrape(url, { waitFor: 2500 });
    return markdown;
  }
  return fetchPageFallback(url);
}

export async function ingestRxtFleet(areas: RxtArea[] = RXT_AREAS): Promise<RxtPayload> {
  const results = await Promise.allSettled(
    areas.map(async (area) => {
      const url = `${RXT_BASE}/?provider=tesla&area=${area}`;
      const content = await fetchContent(url);
      return parseAreaFleet(content, area, url);
    })
  );

  const resolved = results
    .filter((r): r is PromiseFulfilledResult<ReturnType<typeof parseAreaFleet>> => r.status === 'fulfilled')
    .map((r) => r.value);

  if (resolved.length === 0) {
    throw new Error('RXT fleet ingestion failed for all areas');
  }

  return { areas: resolved, fetchedAt: new Date().toISOString() };
}

export async function ingestRxtExtended(): Promise<RxtExtendedPayload> {
  const method = hasFirecrawlKey() ? 'firecrawl' : 'fallback';

  const [rides, unsupervised, regulatory] = await Promise.allSettled([
    fetchContent(`${RXT_BASE}/rides`).then(parseCommunityOps),
    fetchContent(`${RXT_BASE}/unsupervised`).then(parseUnsupervisedMonitor),
    fetchContent(`${RXT_BASE}/texas-dmv`).then(parseRegulatoryCrosscheck),
  ]);

  const payload = buildExtendedPayload({
    communityOps: rides.status === 'fulfilled' ? rides.value : null,
    unsupervised: unsupervised.status === 'fulfilled' ? unsupervised.value : null,
    regulatory: regulatory.status === 'fulfilled' ? regulatory.value : null,
  });

  return { ...payload, ingestionMethod: method };
}