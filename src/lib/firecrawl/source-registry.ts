import { energyPanelData } from '@/lib/energy-seed-data';
import { semiPanelData } from '@/lib/semi-seed-data';

export interface MonitoredSource {
  id: string;
  url: string;
  label: string;
  vertical: 'energy' | 'semi' | 'rxt' | 'regulatory';
}

const RXT_SOURCES: MonitoredSource[] = [
  { id: 'rxt-unsupervised', url: 'https://robotaxitracker.com/unsupervised', label: 'RXT Unsupervised Monitor', vertical: 'rxt' },
  { id: 'rxt-rides', url: 'https://robotaxitracker.com/rides', label: 'RXT Ride Analytics', vertical: 'rxt' },
  { id: 'rxt-pricing', url: 'https://robotaxitracker.com/pricing', label: 'RXT Ride Pricing', vertical: 'rxt' },
  { id: 'rxt-texas-dmv', url: 'https://robotaxitracker.com/texas-dmv', label: 'RXT Texas DMV', vertical: 'regulatory' },
  { id: 'rxt-austin', url: 'https://robotaxitracker.com/?provider=tesla&area=austin', label: 'RXT Austin Fleet', vertical: 'rxt' },
  { id: 'rxt-dallas', url: 'https://robotaxitracker.com/?provider=tesla&area=dallas', label: 'RXT Dallas Fleet', vertical: 'rxt' },
  { id: 'rxt-houston', url: 'https://robotaxitracker.com/?provider=tesla&area=houston', label: 'RXT Houston Fleet', vertical: 'rxt' },
  { id: 'rxt-bay-area', url: 'https://robotaxitracker.com/?provider=tesla&area=bay-area', label: 'RXT Bay Area Fleet', vertical: 'rxt' },
];

function rowLabel(row: {
  label?: string;
  quarter?: string;
  customer?: string;
  site?: string;
  sourceUrl?: string;
}): string {
  return row.label ?? row.quarter ?? row.customer ?? row.site ?? row.sourceUrl ?? 'source';
}

function collectSeedUrls(
  rows: { sourceUrl?: string; label?: string; quarter?: string; customer?: string; site?: string }[],
  vertical: 'energy' | 'semi',
  prefix: string
): MonitoredSource[] {
  const seen = new Set<string>();
  const out: MonitoredSource[] = [];
  for (const row of rows) {
    const url = row.sourceUrl?.trim();
    if (!url || seen.has(url)) continue;
    seen.add(url);
    out.push({
      id: `${prefix}-${out.length}`,
      url,
      label: rowLabel(row),
      vertical,
    });
  }
  return out;
}

export function getAllMonitoredSources(): MonitoredSource[] {
  const energyRows = [
    energyPanelData.grossMargin,
    ...(energyPanelData.grossMarginNormalized ? [energyPanelData.grossMarginNormalized] : []),
    ...energyPanelData.deployments,
    ...energyPanelData.megafactories,
    ...energyPanelData.megapackDeals,
  ];
  const semiRows = [
    ...semiPanelData.scoreboard,
    ...semiPanelData.infraMilestones,
    ...semiPanelData.contracts,
  ];

  return [
    ...collectSeedUrls(energyRows, 'energy', 'energy'),
    ...collectSeedUrls(semiRows, 'semi', 'semi'),
    ...RXT_SOURCES,
  ];
}

export function getSourceUrls(): string[] {
  return getAllMonitoredSources().map((s) => s.url);
}