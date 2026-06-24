import type { RxtArea, RxtAreaStats, RxtUnsupervisedRides } from '@/types/robotaxi-tracker';
import type {
  RxtCommunityOps,
  RxtMarketUnsupervised,
  RxtRegulatoryCrosscheck,
  RxtExtendedPayload,
} from '@/types/rxt-extended';

const AREA_LABELS: Record<RxtArea, string> = {
  austin: 'Austin, TX',
  'bay-area': 'Bay Area, CA',
  dallas: 'Dallas, TX',
  houston: 'Houston, TX',
};

function firstInt(text: string, patterns: RegExp[]): number | null {
  for (const p of patterns) {
    const m = text.match(p);
    if (m?.[1]) return parseInt(m[1].replace(/,/g, ''), 10);
  }
  return null;
}

function firstFloat(text: string, patterns: RegExp[]): number | null {
  for (const p of patterns) {
    const m = text.match(p);
    if (m?.[1]) return parseFloat(m[1].replace(/,/g, ''));
  }
  return null;
}

/** Parse fleet stats from Firecrawl markdown or HTML fallback. */
export function parseAreaFleet(content: string, area: RxtArea, sourceUrl: string): RxtAreaStats {
  const riderVehicles = firstInt(content, [/Rider Vehicles[\s\S]*?(\d+)/i, /(\d+)\s*\n[\s\S]*?Unsupervised/i]) ?? 0;
  const unsupervised30d = firstInt(content, [/Unsupervised[\s\S]*?(\d+)/i]);
  const inactive30d = firstInt(content, [/Inactive[\s\S]*?(\d+)/i]);
  const cybercabs = firstInt(content, [/Cybercabs[\s\S]*?(\d+)/i]);

  const pct = firstFloat(content, [/(\d+(?:\.\d+)?)%[\s\S]*?of\s+(\d+)\s+rides/i, /(\d+(?:\.\d+)?)%/]);
  const ridesMatch = content.match(/(\d+)\s+of\s+(\d+)\s+rides/i);
  let unsupervisedRides: RxtUnsupervisedRides | null = null;
  if (pct !== null && ridesMatch) {
    unsupervisedRides = {
      pct,
      completed: parseInt(ridesMatch[1], 10),
      total: parseInt(ridesMatch[2], 10),
      windowLabel: 'Last 7 days',
    };
  }

  return {
    area,
    areaLabel: AREA_LABELS[area],
    provider: 'tesla',
    riderVehicles,
    unsupervised30d,
    inactive30d,
    cybercabs,
    unsupervisedRides,
    sourceUrl,
    attribution: 'robotaxitracker.com',
    methodologyNote:
      'Community-discovered vehicles only — undercounts official fleet. Not affiliated with Tesla.',
    fetchedAt: new Date().toISOString(),
  };
}

export function parseCommunityOps(markdown: string): RxtCommunityOps {
  return {
    totalRides: firstInt(markdown, [/Total Rides[\s\S]*?(\d[\d,]*)/i]) ?? 0,
    pricedRides: firstInt(markdown, [/Priced Rides[\s\S]*?(\d[\d,]*)/i]) ?? 0,
    avgFare: firstFloat(markdown, [/Avg Fare[\s\S]*?\$(\d+\.\d+)/i, /Average Fare[\s\S]*?\$(\d+\.\d+)/i]),
    medianFare: firstFloat(markdown, [/Median Fare[\s\S]*?\$(\d+\.\d+)/i]),
    avgMiles: firstFloat(markdown, [/Avg Miles[\s\S]*?(\d+\.\d+)/i]),
    farePerMile: firstFloat(markdown, [/Fare\s*\/\s*Mile[\s\S]*?\$(\d+\.\d+)/i]),
    sourceUrl: 'https://robotaxitracker.com/rides',
    attribution: 'robotaxitracker.com',
    methodologyNote: 'Community-logged rides — not official Tesla data.',
    fetchedAt: new Date().toISOString(),
  };
}

export function parseUnsupervisedMonitor(markdown: string): {
  network: RxtMarketUnsupervised[];
  summary: { activeVehicles: number; loggedRides: number; sharePct: number; loggedMiles: number };
} {
  const activeVehicles = firstInt(markdown, [/Vehicles[\s\S]*?(\d+)[\s\S]*?network active/i]) ?? 0;
  const loggedRides = firstInt(markdown, [/Rides[\s\S]*?(\d+)[\s\S]*?logged unsupervised/i]) ?? 0;
  const sharePct = firstFloat(markdown, [/Share[\s\S]*?(\d+(?:\.\d+)?)%/i]) ?? 0;
  const loggedMiles = firstInt(markdown, [/Miles[\s\S]*?(\d+)K/i]) ?? 0;

  const markets: RxtMarketUnsupervised[] = [];
  const marketBlocks = markdown.matchAll(
    /(Austin|Dallas|Houston|Bay Area)[\s\S]*?(\d+)\s*vehicles[\s\S]*?(\d+)\s*rides[\s\S]*?(\d+(?:\.\d+)?)%/gi
  );
  for (const m of marketBlocks) {
    const name = m[1].toLowerCase().replace(' ', '-') as RxtMarketUnsupervised['market'];
    const key = name === 'bay-area' ? 'bay-area' : name;
    if (['austin', 'dallas', 'houston', 'bay-area'].includes(key)) {
      markets.push({
        market: key as RxtMarketUnsupervised['market'],
        vehicles: parseInt(m[2], 10),
        rides: parseInt(m[3], 10),
        unsupervisedSharePct: parseFloat(m[4]),
      });
    }
  }

  return {
    network: markets,
    summary: { activeVehicles, loggedRides, sharePct, loggedMiles: loggedMiles * 1000 },
  };
}

export function parseRegulatoryCrosscheck(markdown: string): RxtRegulatoryCrosscheck {
  return {
    texasDmvRegistered: firstInt(markdown, [/Texas DMV Registered[\s\S]*?(\d+)/i]) ?? 0,
    communityVinMatches: firstInt(markdown, [/Community VIN matches[\s\S]*?(\d+)/i]) ?? 0,
    complaintCasesOpen: firstInt(markdown, [/Complaint cases[\s\S]*?(\d+)\s*\n/i]) ?? 0,
    sourceUrl: 'https://robotaxitracker.com/texas-dmv',
    attribution: 'robotaxitracker.com + TxDMV MCCS',
    methodologyNote: 'Statewide DMV count; per-vehicle service area unknown unless community-tracked.',
    fetchedAt: new Date().toISOString(),
  };
}

export function buildExtendedPayload(parts: {
  communityOps?: RxtCommunityOps | null;
  unsupervised?: ReturnType<typeof parseUnsupervisedMonitor> | null;
  regulatory?: RxtRegulatoryCrosscheck | null;
}): RxtExtendedPayload {
  return {
    communityOps: parts.communityOps ?? null,
    unsupervisedMarkets: parts.unsupervised?.network ?? [],
    unsupervisedSummary: parts.unsupervised?.summary ?? null,
    regulatory: parts.regulatory ?? null,
    fetchedAt: new Date().toISOString(),
    ingestionMethod: 'firecrawl',
  };
}