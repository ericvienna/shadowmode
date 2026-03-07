import { NextResponse } from 'next/server';

export interface AVService {
  company: string;
  city: string;
  supervision: string;        // 'Autonomous' | 'Safety Driver' | 'Safety Attendant' | ...
  access: string;             // 'Public' | 'Waitlist' | 'Testing' | ...
  vehicles: string;
  fares: string;
  serviceModel: string;
  since: string;              // ISO date of service_created
  lastUpdate: string;         // ISO date of most recent event
}

export interface CompanyStats {
  name: string;
  slug: string;
  totalCities: number;
  autonomousCities: number;
  publicCities: number;
  usOnlyCities: number;
  services: AVService[];
}

export interface AVDataResponse {
  companies: CompanyStats[];
  allServices: AVService[];
  lastFetched: string;
}

// Cities that are clearly US-based (filter for US-focused view)
const US_CITIES = new Set([
  'Phoenix', 'San Francisco', 'Los Angeles', 'Austin', 'Bay Area',
  'Atlanta', 'Dallas', 'Houston', 'Miami', 'Orlando', 'San Antonio',
  'Silicon Valley', 'Stanford', 'Las Vegas', 'Seattle', 'Detroit',
  'Arlington, TX', 'Grand Rapids, MI', 'Grand Rapids, MN', 'Ann Arbor, MI',
  'Peachtree Corners, GA', 'Lake Nona, FL', 'Jacksonville, FL',
  'San Ramon, CA', 'Walnut Creek, CA', 'Honolulu',
]);

let cache: AVDataResponse | null = null;
let cacheTs = 0;
const CACHE_MS = 60 * 60 * 1000; // 1 hour

export async function GET() {
  if (cache && Date.now() - cacheTs < CACHE_MS) {
    return NextResponse.json(cache);
  }

  try {
    const res = await fetch(
      'https://raw.githubusercontent.com/EthanMcKanna/av-map-data/main/events.csv',
      { signal: AbortSignal.timeout(8000), next: { revalidate: 3600 } }
    );
    if (!res.ok) throw new Error('CSV fetch failed');

    const csv = await res.text();
    const lines = csv.trim().split('\n');
    const headers = parseCSVLine(lines[0]);

    // Build event-sourced current state
    const serviceMap = new Map<string, Record<string, string>>();

    for (let i = 1; i < lines.length; i++) {
      const vals = parseCSVLine(lines[i]);
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => { row[h] = vals[idx] ?? ''; });

      const key = `${row.company}::${row.city}`;
      const et = row.event_type;

      if (et === 'service_created') {
        serviceMap.set(key, { ...row, _since: row.date });
      } else if (serviceMap.has(key)) {
        const existing = serviceMap.get(key)!;
        if (et === 'service_ended') { existing._ended = 'true'; }
        // Apply field updates from all event types
        for (const f of ['vehicles', 'supervision', 'access', 'fares', 'platform', 'service_model']) {
          if (row[f]) existing[f] = row[f];
        }
        existing.date = row.date; // track last update
      }
    }

    // Convert to structured services
    const allServices: AVService[] = [];
    for (const [, s] of serviceMap) {
      if (s._ended === 'true') continue;
      allServices.push({
        company: s.company,
        city: s.city,
        supervision: s.supervision || 'Unknown',
        access: s.access || 'Unknown',
        vehicles: s.vehicles || '',
        fares: s.fares || '',
        serviceModel: s.service_model || '',
        since: s._since || s.date,
        lastUpdate: s.date,
      });
    }

    // Group by company
    const companyMap = new Map<string, AVService[]>();
    for (const svc of allServices) {
      if (!companyMap.has(svc.company)) companyMap.set(svc.company, []);
      companyMap.get(svc.company)!.push(svc);
    }

    const companies: CompanyStats[] = [];
    for (const [name, svcs] of companyMap) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const usSvcs = svcs.filter(s => US_CITIES.has(s.city));
      companies.push({
        name,
        slug,
        totalCities: svcs.length,
        autonomousCities: svcs.filter(s => s.supervision === 'Autonomous').length,
        publicCities: svcs.filter(s => s.access === 'Public').length,
        usOnlyCities: usSvcs.length,
        services: svcs.sort((a, b) => a.city.localeCompare(b.city)),
      });
    }

    // Sort: most autonomous cities first
    companies.sort((a, b) => b.autonomousCities - a.autonomousCities || b.totalCities - a.totalCities);

    const result: AVDataResponse = {
      companies,
      allServices,
      lastFetched: new Date().toISOString(),
    };

    cache = result;
    cacheTs = Date.now();

    return NextResponse.json(result);
  } catch (err) {
    console.error('[av-data]', err);
    if (cache) return NextResponse.json(cache); // serve stale on error
    return NextResponse.json({ error: 'Failed to load AV data' }, { status: 500 });
  }
}

// Minimal CSV parser that handles quoted fields
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { inQ = !inQ; }
    else if (c === ',' && !inQ) { result.push(cur.trim()); cur = ''; }
    else { cur += c; }
  }
  result.push(cur.trim());
  return result;
}
