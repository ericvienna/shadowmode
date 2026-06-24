import type { EnergyPanelData } from '@/types/energy';

/**
 * Sourced seed — Jeff verified 2026-06-20.
 * specs/SEED-data-energy-semi.md
 * Discipline gate: no sourceUrl = excluded from render.
 */
export const energyPanelData: EnergyPanelData = {
  thesisLine:
    'Storage is the grid\'s release valve. Track whether Tesla is actually building the bottleneck-breaker — or just talking about it.',
  lastCompiled: '2026-06-20',
  compiledBy: 'jeff',
  flags: [
    {
      id: 'q1-miss',
      headline: 'Q1\'26 storage MISS',
      detail: '8.8 GWh deployed vs ~14.4 GWh consensus — down 38% QoQ. Show it; don\'t hide it.',
      severity: 'warning',
    },
    {
      id: 'margin-inflation',
      headline: 'Q1\'26 margin asterisk',
      detail:
        'Reported energy gross margin 39.5% inflated by one-time warranty/tariff items. Normalized est. ~28–32% — do not trend the headline number.',
      severity: 'warning',
    },
    {
      id: 'ira-credits',
      headline: 'IRA credits in margin',
      detail: '$756M (FY2024) vs $115M (FY2023) embedded in energy margin — flag separately from ops improvement.',
      severity: 'info',
    },
  ],
  deployments: [
    {
      quarter: 'FY2024',
      gwh: 31.4,
      yoyNote: '+114% YoY',
      sourceUrl: 'https://www.sec.gov/Archives/edgar/data/1318605/000162828025003063/tsla-20241231.htm',
    },
    {
      quarter: 'Q1 2025',
      gwh: 10.4,
      sourceUrl: 'https://ir.tesla.com/press-release/tesla-first-quarter-2025-production-deliveries-deployments',
    },
    {
      quarter: 'Q2 2025',
      gwh: 9.6,
      sourceUrl: 'https://ir.tesla.com/press-release/tesla-second-quarter-2025-production-deliveries-deployments',
    },
    {
      quarter: 'Q3 2025',
      gwh: 12.5,
      flag: 'record',
      flagNote: 'Record at time',
      sourceUrl: 'https://ir.tesla.com/press-release/tesla-third-quarter-2025-production-deliveries-deployments',
    },
    {
      quarter: 'Q4 2025',
      gwh: 14.2,
      flag: 'record',
      flagNote: 'Record',
      sourceUrl: 'https://ir.tesla.com/press-release/tesla-fourth-quarter-2025-production-deliveries-deployments',
    },
    {
      quarter: 'FY2025',
      gwh: 46.7,
      yoyNote: '+49% YoY',
      sourceUrl: 'https://ir.tesla.com/press-release/tesla-fourth-quarter-2025-production-deliveries-deployments',
    },
    {
      quarter: 'Q1 2026',
      gwh: 8.8,
      flag: 'miss',
      flagNote: 'MISS vs ~14.4 consensus · -38% QoQ',
      sourceUrl:
        'https://ir.tesla.com/press-release/tesla-first-quarter-2026-production-deliveries-and-deployments',
    },
  ],
  grossMargin: {
    value: '39.5%',
    sourceUrl: 'https://electrek.co/2026/04/22/tesla-tsla-q1-2026-one-time-benefits-warranty-tariff-refunds-margins/',
    sourceDate: 'Q1 2026',
    note: 'Reported — includes one-time warranty/tariff items',
  },
  grossMarginNormalized: {
    value: '28–32%',
    sourceUrl: 'https://electrek.co/2026/04/22/tesla-tsla-q1-2026-one-time-benefits-warranty-tariff-refunds-margins/',
    sourceDate: 'Q1 2026',
    note: 'Normalized est. — use for trend baseline',
    estimated: true,
  },
  megafactories: [
    {
      site: 'Lathrop, CA',
      capacityGwhPerYear: '40',
      status: 'operational',
      sourceUrl: 'https://www.tesla.com/megapack',
    },
    {
      site: 'Shanghai',
      capacityGwhPerYear: '40',
      status: 'ramping',
      note: '~8 GWh deployed 2025',
      sourceUrl: 'https://www.tesla.com/megapack',
    },
    {
      site: 'Houston, TX',
      capacityGwhPerYear: '50',
      status: 'planned',
      note: 'Announced Sept 2025 — not operational',
      sourceUrl: 'https://www.tesla.com/megapack',
    },
  ],
  megapackDeals: [
    {
      customer: 'Intersect Power',
      capacity: '15.3 GWh',
      location: 'CA + TX',
      status: 'announced',
      date: 'Jul 2024',
      sourceUrl:
        'https://www.intersect.com/historical-releases/tesla-provides-intersect-power-with-15-3-gwh-of-megapacks-for-solar-storage-projects',
    },
    {
      customer: 'Matrix Renewables',
      capacity: '500 MW / 1 GWh',
      location: 'Scotland',
      status: 'under-construction',
      date: 'Dec 2025',
      sourceUrl:
        'https://matrixrenewables.com/matrix-renewables-signs-full-epc-agreement-with-tesla-for-landmark-standalone-battery-energy-storage-project-in-the-uk/',
    },
    {
      customer: 'Nucor (Ameresco / AEPCO)',
      capacity: '50 MW / 200 MWh',
      location: 'Kingman, AZ',
      status: 'operational',
      date: 'Oct 2025',
      sourceUrl:
        'https://teslanorth.com/2025/10/18/tesla-megapacks-now-operational-at-51-million-energy-storage-project-in-arizona/',
    },
  ],
};

/** Rows without verified sourceUrl are filtered at render time */
export function getRenderableDeals() {
  return energyPanelData.megapackDeals.filter((r) => r.sourceUrl?.startsWith('http'));
}