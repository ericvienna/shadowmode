import { NextResponse } from 'next/server';

const AV_MAP_CSV =
  'https://raw.githubusercontent.com/path-avmap/av-map-data/main/events.csv';

export interface ServiceAreaStats {
  id: string;
  name: string;
  slug: string;
  provider: 'tesla' | 'waymo';
  vehicleCount: number;
  tripCount: number;
  totalMiles: number;
  supervision?: string;
  access?: string;
}

export interface FleetData {
  totalVehicles: number;
  totalTrips: number;
  totalMiles: number;
  teslaVehicles: number;
  waymoVehicles: number;
  serviceAreas: ServiceAreaStats[];
  lastUpdated: string;
  source: 'av-map-data';
  note: string;
}

let cachedData: FleetData | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000;

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') inQ = !inQ;
    else if (c === ',' && !inQ) {
      result.push(cur.trim());
      cur = '';
    } else cur += c;
  }
  result.push(cur.trim());
  return result;
}

function parseFleetHint(...parts: string[]): number {
  const text = parts.filter(Boolean).join(' ');
  const patterns = [
    /(\d+)\s+unsupervised/i,
    /~?\s*(\d+)\s+(?:robotaxi|model\s*y|vehicles?|configured)/i,
    /fleet\s+(?:hits?|of|at)\s+(\d+)/i,
    /(\d+)\s+Model\s+Y/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) return parseInt(m[1], 10);
  }
  return 0;
}

function providerFor(company: string): 'tesla' | 'waymo' | null {
  const c = company.toLowerCase();
  if (c.includes('tesla')) return 'tesla';
  if (c.includes('waymo')) return 'waymo';
  return null;
}

export async function GET() {
  if (cachedData && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return NextResponse.json(cachedData);
  }

  try {
    const response = await fetch(AV_MAP_CSV, {
      headers: { 'User-Agent': 'ShadowmodeBot/1.0 (shadowmode.us)' },
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) throw new Error('av-map-data CSV fetch failed');

    const csv = await response.text();
    const lines = csv.trim().split('\n');
    const headers = parseCSVLine(lines[0]);

    const serviceMap = new Map<string, Record<string, string>>();

    for (let i = 1; i < lines.length; i++) {
      const vals = parseCSVLine(lines[i]);
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = vals[idx] ?? '';
      });

      const provider = providerFor(row.company);
      if (!provider) continue;

      const key = `${row.company}::${row.city}`;
      const et = row.event_type;

      if (et === 'service_created') {
        serviceMap.set(key, { ...row, _since: row.date });
      } else if (serviceMap.has(key)) {
        const existing = serviceMap.get(key)!;
        if (et === 'service_ended') existing._ended = 'true';
        for (const f of [
          'vehicles',
          'supervision',
          'access',
          'fares',
          'platform',
          'service_model',
          'notes',
        ]) {
          if (row[f]) existing[f] = row[f];
        }
        existing.date = row.date;
      }
    }

    const serviceAreas: ServiceAreaStats[] = [];

    for (const [, s] of serviceMap) {
      if (s._ended === 'true') continue;
      const provider = providerFor(s.company);
      if (!provider) continue;

      const slug = `${provider}-${s.city}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const vehicleCount = parseFleetHint(s.vehicles, s.notes);

      serviceAreas.push({
        id: slug,
        name: s.city,
        slug,
        provider,
        vehicleCount,
        tripCount: 0,
        totalMiles: 0,
        supervision: s.supervision || undefined,
        access: s.access || undefined,
      });
    }

    serviceAreas.sort((a, b) => b.vehicleCount - a.vehicleCount || a.name.localeCompare(b.name));

    let teslaVehicles = 0;
    let waymoVehicles = 0;
    for (const area of serviceAreas) {
      if (area.provider === 'tesla') teslaVehicles += area.vehicleCount;
      else waymoVehicles += area.vehicleCount;
    }

    const fleetData: FleetData = {
      totalVehicles: teslaVehicles + waymoVehicles,
      totalTrips: 0,
      totalMiles: 0,
      teslaVehicles,
      waymoVehicles,
      serviceAreas,
      lastUpdated: new Date().toISOString(),
      source: 'av-map-data',
      note:
        'Deployment status from path-avmap/av-map-data. Vehicle counts only when cited in source notes; trips/miles require community feed (not live).',
    };

    cachedData = fleetData;
    cacheTimestamp = Date.now();

    return NextResponse.json(fleetData);
  } catch (error) {
    console.error('Fleet API error:', error);
    if (cachedData) return NextResponse.json(cachedData);
    return NextResponse.json({ error: 'Failed to fetch fleet data' }, { status: 500 });
  }
}