import type { EcosystemVertical } from '@/types/ecosystem';

export const ECOSYSTEM_THESIS =
  'ENERGY → COMPUTE → INTELLIGENCE → MONEY. SHADOWMODE TRACKS TESLA\'S PHYSICAL LAYER — THE POWER-AND-COMPUTE BOUND PRODUCTS THAT ABSORB GRID LOAD AND SHIP AUTONOMY.';

export const ECOSYSTEM_VERTICALS: EcosystemVertical[] = [
  {
    id: 'robotaxi',
    label: 'Robotaxi',
    tagline: 'COMPUTE ON WHEELS',
    href: '/#deployment-pulse',
    signal: '21 CITIES TRACKED',
    signalDetail: 'FSD DEPLOYMENT MILESTONES · PERMITS · DRIVERLESS STATUS',
    sourceUrl: 'https://shadowmode.us',
    status: 'live',
  },
  {
    id: 'energy',
    label: 'Energy',
    tagline: 'GRID RELEASE VALVE',
    href: '/energy',
    signal: '8.8 GWH Q1\'26',
    signalDetail: 'MISS VS CONSENSUS · MEGAPACK DEAL LEDGER',
    sourceUrl:
      'https://ir.tesla.com/press-release/tesla-first-quarter-2026-production-deliveries-and-deployments',
    status: 'live',
    flag: 'MISS',
  },
  {
    id: 'semi',
    label: 'Semi',
    tagline: 'DIESEL → GRID LOAD',
    href: '/semi',
    signal: '965/1,067 HVIP',
    signalDetail: 'CONTRACT LEDGER · CONVERSION LIVE · STALE RESERVATIONS FLAGGED',
    sourceUrl:
      'https://electrek.co/2026/05/05/wattev-orders-370-tesla-semis-california-largest-ev-truck-deployment/',
    status: 'ramping',
  },
  {
    id: 'optimus',
    label: 'Optimus',
    tagline: 'LABOR → ELECTRIFIED',
    href: '/#optimus',
    signal: 'PROD JUL–AUG \'26',
    signalDetail: 'FREMONT LINE CONVERSION · NO 2026 VOLUME TARGET',
    sourceUrl: 'https://electrek.co/2026/04/22/tesla-optimus-production-fremont-model-sx-line/',
    status: 'planned',
    flag: 'NO VOL TARGET',
  },
];

export const OPTIMUS_MILESTONES = [
  {
    label: 'MODEL S/X LINE ENDS',
    value: 'EARLY MAY 2026',
    sourceUrl: 'https://electrek.co/2026/04/22/tesla-optimus-production-fremont-model-sx-line/',
  },
  {
    label: 'FREMONT OPTIMUS PRODUCTION',
    value: 'LATE JUL / AUG 2026',
    note: 'INITIAL OUTPUT "QUITE SLOW" — MUSK, Q1 CALL',
    sourceUrl: 'https://electrek.co/2026/04/22/tesla-optimus-production-fremont-model-sx-line/',
  },
  {
    label: 'GIGA TEXAS OPTIMUS FACTORY',
    value: 'SUMMER 2027',
    note: 'SECOND LINE · GEN 4 VOLUME TARGET',
    sourceUrl: 'https://electrek.co/2026/04/22/tesla-optimus-production-fremont-model-sx-line/',
  },
  {
    label: 'USEFUL WORK IN FACTORIES',
    value: 'ZERO (JAN 2026)',
    note: 'MUSK ADMISSION — TRACK CONVERSION HONESTLY',
    sourceUrl: 'https://electrek.co/2026/01/28/musk-admits-no-optimus-robots-are-doing-useful-work-at-tesla-after-claiming-otherwise/',
  },
];