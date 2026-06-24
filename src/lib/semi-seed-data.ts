import type { SemiPanelData } from '@/types/semi';

/**
 * Sourced seed — Jeff verified 2026-06-20.
 * specs/SEED-data-energy-semi.md
 * Discipline gate: no sourceUrl = excluded from render.
 * 4 unverified rows (Costco, Walmart US, Pride, Ryder) = admin TODO, not public.
 */
export const semiPanelData: SemiPanelData = {
  thesisLine:
    'Freight is ~10% of US diesel demand. Every Semi delivered is grid load that used to be a diesel pump. The order book is the signal — if the contracts convert, the energy shift is real.',
  lastCompiled: '2026-06-20',
  compiledBy: 'jeff',
  conversionFlags: [
    {
      id: 'conversion-live',
      headline: 'Conversion is happening — not vaporware',
      detail:
        'Volume production line live Apr 29 2026. Real deliveries: PepsiCo, DHL, Saia, ArcBest, Nevoya, RoadOne, Martin Brower. WattEV 370-unit order (~$100M). Old "still just reservations" framing is dead.',
      severity: 'hot',
    },
    {
      id: 'hvip-demand',
      headline: 'CA HVIP: 965 of 1,067 vouchers = Tesla Semi',
      detail:
        '90%+ of CA clean-truck voucher applications (Jan 2025–Feb 2026) — government-sourced, least-spinnable demand signal.',
      severity: 'hot',
    },
    {
      id: 'stale-signal',
      headline: 'Stale 2017 reservations are themselves a signal',
      detail:
        'UPS (125), Sysco (50), AB (40), FedEx (20), J.B. Hunt — no 2024+ delivery update. Reservation ≠ delivery.',
      severity: 'warning',
    },
  ],
  disclaimers: [
    'Tesla does not report Semi deliveries separately (buried in "Other Models") — this ledger is the only delivery proxy.',
    'Reservation ≠ delivery. STALE rows (2017–2022, no 2024+ update) are themselves a signal.',
  ],
  scoreboard: [
    {
      label: 'CA HVIP Demand',
      value: '965 / 1,067',
      subtitle: '90%+ of CA clean-truck vouchers · govt program',
      sourceUrl:
        'https://californiahvip.org/wp-content/uploads/2026/04/HVIP-Tesla-Semi-Truck-Facts-FAQ_04.14.26_KDL_Final.pdf',
    },
    {
      label: 'Volume Line Live',
      value: 'Apr 29, 2026',
      subtitle: 'First truck off high-volume production line',
      sourceUrl: 'https://electrek.co/2026/04/29/tesla-semi-first-truck-high-volume-production-line/',
    },
    {
      label: 'Stated Capacity',
      value: '50,000/yr',
      subtitle: 'Giga Nevada · 1.7M sq ft dedicated factory',
      sourceUrl: 'https://electrek.co/2026/04/29/tesla-semi-first-truck-high-volume-production-line/',
    },
    {
      label: 'WattEV Order',
      value: '370 units',
      subtitle: '~$100M · deliveries starting 2026',
      sourceUrl:
        'https://electrek.co/2026/05/05/wattev-orders-370-tesla-semis-california-largest-ev-truck-deployment/',
    },
  ],
  infraMilestones: [
    {
      label: 'Pricing (Feb 2026)',
      value: '$260K (325-mi) / $290K (500-mi)',
      note: '1,072 hp tri-motor · Standard + Long Range',
      sourceUrl: 'https://electrek.co/2026/02/10/tesla-quoting-price-500-miles-electric-semi-truck/',
    },
    {
      label: 'Federal CFI Grant (IL corridor)',
      value: '$100M E-FREIGHT',
      note: 'Jan 2025 · Tesla ~$40M share of consortium award',
      sourceUrl:
        'https://electrek.co/2025/01/18/illinois-awards-100m-for-electric-truck-charging-corridor-tesla-to-get-40m/',
    },
    {
      label: 'Megacharger — Ontario CA live',
      value: '1 customer-facing station',
      note: 'Mar 8 2026 · 4265 E Guasti Rd',
      sourceUrl:
        'https://electrek.co/2026/03/08/tesla-opens-first-megacharger-ontario-california-semi-customers/',
    },
    {
      label: 'Megacharger — network mapped',
      value: '64 new + 2 operational',
      note: 'Feb 2026 · 15 states on Tesla Find Us map',
      sourceUrl:
        'https://electrek.co/2026/02/24/tesla-megacharger-64-locations-semi-truck-charging-network-map/',
    },
    {
      label: 'Pilot Flying J partnership',
      value: 'Summer 2026 first sites',
      note: 'Jan 2026 · I-5 / I-10 corridors · 4–8 stalls/site',
      sourceUrl:
        'https://electrek.co/2026/01/27/tesla-lands-major-semi-charging-deal-largest-truck-stop-operator/',
    },
  ],
  contracts: [
    {
      customer: 'WattEV',
      units: '370 ordered (~$100M)',
      status: 'deposit-order',
      firstAnnounced: 'May 2026',
      latestUpdate: 'First 50 deliver 2026; Port of Oakland drayage',
      sourceUrl:
        'https://electrek.co/2026/05/05/wattev-orders-370-tesla-semis-california-largest-ev-truck-deployment/',
    },
    {
      customer: 'PepsiCo',
      units: '86 operating',
      status: 'operating-pilot',
      firstAnnounced: '2017',
      latestUpdate: 'Sept 2024: Modesto 15 / Sacramento 21 / Fresno 50',
      sourceUrl: 'https://www.truckinginfo.com/news/tesla-and-pepsico-give-semi-update-at-iaa-2024',
    },
    {
      customer: 'DHL Supply Chain',
      units: '1 delivered, more for 2026',
      status: 'operating-pilot',
      firstAnnounced: '2017',
      latestUpdate: 'First DHL delivery Dec 2025',
      sourceUrl:
        'https://www.dhl.com/us-en/home/press/press-archive/2025/dhl-supply-chain-accelerates-sustainability-with-first-tesla-semi-delivery.html',
    },
    {
      customer: 'Nevoya',
      units: '5 delivered',
      status: 'operating-pilot',
      firstAnnounced: '2025',
      latestUpdate: 'July 2025: first payment-collected commercial deliveries',
      sourceUrl:
        'https://cleantechnica.com/2025/07/22/electric-truck-startup-nevoya-raises-more-cash-to-spread-its-wings-fly/',
    },
    {
      customer: 'Saia LTL',
      units: '2 delivered',
      status: 'operating-pilot',
      firstAnnounced: 'Jan 2025',
      latestUpdate: '1.73 kWh/mi commercial pilot',
      sourceUrl: 'https://www.truckinginfo.com/news/saia-partners-with-tesla-to-launch-two-electric-semis',
    },
    {
      customer: 'ArcBest / ABF',
      units: '2 purchased',
      status: 'operating-pilot',
      firstAnnounced: '2025',
      latestUpdate: 'June 2026: bought after pilot (1.55 kWh/mi)',
      sourceUrl: 'https://electrek.co/2026/06/11/arcbest-buys-tesla-semis-abf-freight-pilot/',
    },
    {
      customer: 'RoadOne',
      units: 'up to 10',
      status: 'operating-pilot',
      firstAnnounced: 'Jan 2026',
      latestUpdate: 'Expanding 1→10 on performance',
      sourceUrl: 'https://evxl.co/2026/01/15/tesla-semi-roadone-plans-10-truck-fleet/',
    },
    {
      customer: 'Martin Brower',
      units: '2',
      status: 'operating-pilot',
      firstAnnounced: '2024',
      latestUpdate: 'Stockton DC pilot',
      sourceUrl: 'https://martinbrower.com/newsroom/martin-brower-pilots-tesla-all-electric-semis',
    },
    {
      customer: 'Walmart Canada',
      units: '130 reserved',
      status: 'reserved',
      firstAnnounced: '2017',
      latestUpdate: 'May 2024: tripled 15→130',
      sourceUrl:
        'https://www.newswire.ca/news-releases/walmart-canada-more-than-triples-order-of-tesla-semi-trucks-819028752.html',
    },
    {
      customer: 'Loblaw (Canada)',
      units: '~50 on order',
      status: 'reserved',
      firstAnnounced: '2017',
      latestUpdate: 'Doubled fleet; +25 on order',
      sourceUrl:
        'https://www.fleetmanagementweekly.com/grocery-giant-loblaw-doubles-electric-semi-fleet-has-25-tesla-semis-on-order/',
    },
    {
      customer: 'UPS',
      units: '125 reserved',
      status: 'reserved-stale',
      firstAnnounced: '2017',
      latestUpdate: 'No delivery / no 2024+ update',
      sourceUrl: 'https://techcrunch.com/?p=1579783',
      stale: true,
    },
    {
      customer: 'Sysco',
      units: '50 deposit',
      status: 'reserved-stale',
      firstAnnounced: '2017',
      latestUpdate: '2022: still in queue',
      sourceUrl:
        'https://www.torquenews.com/1084/tesla-semi-truck-customers-are-still-waiting-sysco-says-we-put-deposit-50-trucks-2017-they',
      stale: true,
    },
    {
      customer: 'Anheuser-Busch',
      units: '40 ordered',
      status: 'reserved-stale',
      firstAnnounced: '2017',
      latestUpdate: 'No delivery confirmed',
      sourceUrl:
        'https://greenlivingguy.com/2022/10/anheuser-busch-and-sysco-order-more-than-15m-in-tesla-electric-semi-trucks-in-one-day/',
      stale: true,
    },
    {
      customer: 'FedEx',
      units: '20 reserved',
      status: 'reserved-stale',
      firstAnnounced: '2022',
      latestUpdate: 'FedEx Freight LTL; no delivery',
      sourceUrl: 'https://www.ttnews.com/articles/fedex-orders-20-tesla-semis',
      stale: true,
    },
    {
      customer: 'J.B. Hunt',
      units: 'multiple',
      status: 'reserved-stale',
      firstAnnounced: '2017',
      latestUpdate: 'No delivery / no update',
      sourceUrl: 'https://fortune.com/2017/11/17/tesla-semi-truck-meijer-jb-hunt',
      stale: true,
    },
  ],
};

export function getRenderableContracts() {
  return semiPanelData.contracts.filter((r) => r.sourceUrl?.startsWith('http'));
}

const STATUS_SORT_ORDER: Record<string, number> = {
  'delivered-volume': 0,
  'operating-pilot': 1,
  'deposit-order': 2,
  reserved: 3,
  'reserved-stale': 4,
};

export function getSortedContracts() {
  return [...getRenderableContracts()].sort(
    (a, b) => (STATUS_SORT_ORDER[a.status] ?? 99) - (STATUS_SORT_ORDER[b.status] ?? 99)
  );
}

/** Parse numeric unit counts for conversion buckets (best-effort, excludes "multiple") */
export function getSemiConversionStats() {
  const rows = getRenderableContracts();
  let operating = 0;
  let onOrder = 0;
  let activeReserved = 0;
  let stale = 0;

  for (const row of rows) {
    const match = row.units.match(/(\d+)/);
    const n = match ? parseInt(match[1], 10) : 0;
    if (row.status === 'operating-pilot' || row.status === 'delivered-volume') {
      operating += n;
    } else if (row.status === 'deposit-order') {
      onOrder += n;
    } else if (row.status === 'reserved-stale') {
      stale += n;
    } else if (row.status === 'reserved') {
      activeReserved += n;
    }
  }

  return {
    operatingUnits: operating,
    onOrderUnits: onOrder,
    activeReservedUnits: activeReserved,
    staleReservedUnits: stale,
    operatingCustomers: rows.filter(
      (r) => r.status === 'operating-pilot' || r.status === 'delivered-volume'
    ).length,
    onOrderCustomers: rows.filter((r) => r.status === 'deposit-order').length,
    activeReservedCustomers: rows.filter((r) => r.status === 'reserved').length,
    staleCustomers: rows.filter((r) => r.status === 'reserved-stale').length,
  };
}