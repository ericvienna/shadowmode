import type { EpistemicTier } from '@/components/EpistemicStamp';

/**
 * The change log — the diff is the product.
 *
 * Every tracked cell that flips gets a timestamped, sourced entry here.
 * Corrections to our own numbers get entries too; the ledger scores us
 * the same way it scores Tesla. Newest entries first.
 *
 * `date` accepts YYYY-MM-DD (day precision) or YYYY-MM (month precision —
 * used when the public record supports the month but not the day).
 */

export type ChangeKind = 'milestone' | 'correction' | 'data' | 'terminal';

export interface ChangeLogEntry {
  id: string;
  /** YYYY-MM-DD or YYYY-MM */
  date: string;
  scope: string;
  kind: ChangeKind;
  change: string;
  detail?: string;
  tier: EpistemicTier;
  source: { label: string; url: string };
}

export const CHANGELOG: ChangeLogEntry[] = [
  {
    id: 'cl-2026-07-02-safety-correction',
    date: '2026-07-02',
    scope: 'Terminal',
    kind: 'correction',
    change: 'Safety panel corrected: "0 incidents · Excellent" removed.',
    detail:
      'The panel previously hardcoded zero incidents and an "Excellent" verdict. Public reports compiled by the Stokes tracker record 7 crashes since Jun 2025 (~1 per 40K mi). The panel now shows the reported figures and no verdict badge.',
    tier: 'sourced',
    source: { label: '@JonathanWStokes tracker', url: 'https://x.com/JonathanWStokes' },
  },
  {
    id: 'cl-2026-07-02-austin-date-correction',
    date: '2026-07-02',
    scope: 'Terminal',
    kind: 'correction',
    change: 'Austin driverless start date corrected: Dec 14, 2024 → Dec 14, 2025 (internal) / Jan 2026 (public).',
    detail:
      'Two panels showed "Dec 14, 2024" for the start of Austin driverless operations — a year off from the sourced record. Internal/employee driverless testing began Dec 14, 2025; public driverless rides began Jan 2026.',
    tier: 'sourced',
    source: { label: '@JonathanWStokes tracker', url: 'https://x.com/JonathanWStokes' },
  },
  {
    id: 'cl-2026-07-02-epistemic-tiers',
    date: '2026-07-02',
    scope: 'Terminal',
    kind: 'terminal',
    change: 'Epistemic tiering shipped: every number now wears SOURCED, MODELED, or CLAIMED.',
    detail:
      'Modeled figures (TAM, projections, readiness scores, mile estimates) no longer carry verdict badges. Verdicts are earned only by sourced data.',
    tier: 'sourced',
    source: { label: 'This terminal', url: 'https://shadowmode.us' },
  },
  {
    id: 'cl-2026-04-dallas-houston',
    date: '2026-04',
    scope: 'Dallas & Houston, TX',
    kind: 'milestone',
    change: 'Driverless service began in Dallas and Houston.',
    tier: 'sourced',
    source: { label: 'Public reports', url: 'https://x.com/JonathanWStokes' },
  },
  {
    id: 'cl-2026-01-austin-public-driverless',
    date: '2026-01',
    scope: 'Austin, TX',
    kind: 'milestone',
    change: 'Public driverless rides began (no safety monitor).',
    tier: 'sourced',
    source: { label: 'Public reports', url: 'https://x.com/JonathanWStokes' },
  },
  {
    id: 'cl-2025-12-14-austin-internal',
    date: '2025-12-14',
    scope: 'Austin, TX',
    kind: 'milestone',
    change: 'Internal/employee driverless testing observed — empty driver seat confirmed on ~2 vehicles.',
    tier: 'sourced',
    source: { label: '@JonathanWStokes tracker', url: 'https://x.com/JonathanWStokes' },
  },
  {
    id: 'cl-2025-11-17-az-approval',
    date: '2025-11-17',
    scope: 'Phoenix / Mesa / Tempe, AZ',
    kind: 'milestone',
    change: 'Final regulatory approval granted in Arizona.',
    tier: 'sourced',
    source: { label: 'AZ DOT', url: 'https://azdot.gov' },
  },
  {
    id: 'cl-2025-09-19-az-permit',
    date: '2025-09-19',
    scope: 'Arizona',
    kind: 'milestone',
    change: 'AV permit received (applied Jun 26, 2025 — 85 days to grant).',
    tier: 'sourced',
    source: { label: 'AZ DOT', url: 'https://azdot.gov' },
  },
];

/** 'YYYY-MM' → 'Mon YYYY'; 'YYYY-MM-DD' → 'Mon D, YYYY' */
export function formatChangeDate(date: string): string {
  const [y, m, d] = date.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[parseInt(m, 10) - 1];
  return d ? `${month} ${parseInt(d, 10)}, ${y}` : `${month} ${y}`;
}

/** For RSS pubDate — month-precision entries resolve to the 1st. */
export function changeDateToISO(date: string): string {
  return date.length === 7 ? `${date}-01T00:00:00Z` : `${date}T00:00:00Z`;
}
