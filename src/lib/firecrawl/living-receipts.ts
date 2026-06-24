import { createHash } from 'crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { firecrawlScrape, hasFirecrawlKey } from './client';
import { getAllMonitoredSources, type MonitoredSource } from './source-registry';
import type { LivingReceiptEntry, LivingReceiptsPayload } from '@/types/rxt-extended';

const SNAPSHOT_PATH = join(process.cwd(), 'data', 'living-receipts-snapshot.json');

type SnapshotStore = Record<string, { hash: string; checkedAt: string; changedAt?: string }>;

function loadSnapshot(): SnapshotStore {
  if (!existsSync(SNAPSHOT_PATH)) return {};
  try {
    return JSON.parse(readFileSync(SNAPSHOT_PATH, 'utf8')) as SnapshotStore;
  } catch {
    return {};
  }
}

function saveSnapshot(store: SnapshotStore): void {
  const dir = join(process.cwd(), 'data');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(SNAPSHOT_PATH, JSON.stringify(store, null, 2));
}

function hashContent(content: string): string {
  return createHash('sha256').update(content).digest('hex').slice(0, 16);
}

async function checkSource(source: MonitoredSource, prior: SnapshotStore): Promise<LivingReceiptEntry> {
  const now = new Date().toISOString();
  try {
    const { markdown } = await firecrawlScrape(source.url);
    const h = hashContent(markdown);
    const prev = prior[source.id];
    let status: LivingReceiptEntry['status'] = 'new';
    if (prev) {
      status = prev.hash === h ? 'same' : 'changed';
    }
    prior[source.id] = {
      hash: h,
      checkedAt: now,
      changedAt: status === 'changed' ? now : prev?.changedAt,
    };
    return {
      id: source.id,
      url: source.url,
      label: source.label,
      vertical: source.vertical,
      status,
      lastChecked: now,
      lastChanged: status === 'changed' ? now : prev?.changedAt,
      contentHash: h,
    };
  } catch (err) {
    return {
      id: source.id,
      url: source.url,
      label: source.label,
      vertical: source.vertical,
      status: 'error',
      lastChecked: now,
      error: err instanceof Error ? err.message : 'check failed',
    };
  }
}

export async function runLivingReceiptsCheck(options?: {
  limit?: number;
  vertical?: string;
}): Promise<LivingReceiptsPayload> {
  if (!hasFirecrawlKey()) {
    throw new Error('FIRECRAWL_API_KEY required for living receipts');
  }

  let sources = getAllMonitoredSources();
  if (options?.vertical) {
    sources = sources.filter((s) => s.vertical === options.vertical);
  }
  if (options?.limit) {
    sources = sources.slice(0, options.limit);
  }

  const prior = loadSnapshot();
  const entries: LivingReceiptEntry[] = [];

  // Sequential to respect Firecrawl concurrency / credits
  for (const source of sources) {
    entries.push(await checkSource(source, prior));
  }

  saveSnapshot(prior);

  return {
    entries,
    checkedAt: new Date().toISOString(),
    changedCount: entries.filter((e) => e.status === 'changed').length,
  };
}

export function getLastLivingReceiptsSnapshot(): LivingReceiptsPayload | null {
  const store = loadSnapshot();
  const sources = getAllMonitoredSources();
  if (Object.keys(store).length === 0) return null;

  const entries: LivingReceiptEntry[] = sources
    .filter((s) => store[s.id])
    .map((s) => ({
      id: s.id,
      url: s.url,
      label: s.label,
      vertical: s.vertical,
      status: 'same' as const,
      lastChecked: store[s.id].checkedAt,
      lastChanged: store[s.id].changedAt,
      contentHash: store[s.id].hash,
    }));

  return {
    entries,
    checkedAt: new Date().toISOString(),
    changedCount: 0,
  };
}