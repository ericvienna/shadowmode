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
  /* Optional: several entries are first-party observations of our own
     terminal, or had an attribution removed as incorrect (see the
     2026-08-12 entry). An absent source renders as no link.

     ── DEFERRED REFACTOR — do this before adding many more entries ──
     This field is the wrong shape and it caused a real defect on 2026-08-12.
     A data citation and a CREDIT are structurally identical here: both are
     just { label, url }. The site footer carries "Inspired by @<handle>" as a
     credit; that same handle ended up attached to a crash statistic as its
     SOURCE. Nothing in the type — and nothing a later reader, human or model,
     can see — distinguishes "this person produced this figure" from "this
     person inspired the project". A captured credit is worse than an invented
     source: the name is real, the spelling is right, it genuinely is in the
     repo, so it passes every check except the one nobody runs.

     Intended shape:

       source: {
         kind: 'primary' | 'compilation' | 'credit' | 'unsourced';
         label?: string;
         url?: string;
       }

     Two deliberate properties, both load-bearing:

     1. The DISCRIMINATOR stops a credit being silently promoted into a
        citation — promotion now requires typing a different `kind`, so
        someone has to mean it.
     2. REQUIRED, with an explicit 'unsourced' kind, rather than optional.
        Optional makes an absent source and an unsourced figure the same
        byte, so you can never tell "nobody filled it in" from "nobody needed
        to". Required turns absence into a DECLARATION: greppable, countable,
        renderable ("7 of 41 figures are unsourced"), and gateable in CI. The
        hardcoded crash count that started all this had no source at all —
        the discriminator alone would still not have caught it.

     Credit: mechanism found while retiring the safety panel; the
     required-plus-unsourced argument is gonzo's, from hitting the identical
     hole in their own transmission schema (empty array and missing array
     meaning the same nothing, hiding 45 unsourced signals). */
  source?: { label: string; url: string };
}

export const CHANGELOG: ChangeLogEntry[] = [
  {
    id: 'cl-2026-08-12-safety-panel-retired',
    date: '2026-08-12',
    scope: 'Terminal',
    kind: 'correction',
    change: 'Safety Signals panel retired and replaced with Fleet Buildout.',
    detail:
      'The panel reported a crash count and a crashes-per-mile rate. Three problems, found together: the mileage denominator was modeled from assumed constants (fleet size x 100 mi/day x 180 days) rather than measured; the crash count was a hardcoded figure that had not changed since Dec 2025, so the displayed rate improved automatically as the fleet grew even though no new crash data had arrived; and the cited source was a private individual with no discernible connection to autonomous-vehicle reporting, who never produced the figure attributed to him. That attribution has been removed from this changelog as well. Rather than publish a corrected estimate, the panel has been replaced with Fleet Buildout, which counts vehicles deployed, driverless cities and active states directly from the milestone record — no modeling and no third-party attribution. Tesla does not publish robotaxi production figures, so deployment is what can be counted and is labelled as such.',
    tier: 'sourced',
  },
  {
    id: 'cl-2026-07-03-miami-launch',
    date: '2026-07-03',
    scope: 'Miami, FL',
    kind: 'milestone',
    change: 'Miami goes live: public robotaxi rides, unsupervised from day one.',
    detail:
      "Tesla launched public robotaxi service in Miami on Jul 3, 2026: its first market outside Texas and California and first on the East Coast. No driver or in-car safety monitor from day one. Model Y fleet. Roughly 20 sq mi zone including MIA airport (no terminal pickups yet). Milestones flipped: public_test_program_launched, no_safety_monitor, robotaxi_app_access_opens.",
    tier: 'sourced',
    source: {
      label: 'Not a Tesla App, Jul 3 2026',
      url: 'https://www.notateslaapp.com/news/4394/tesla-launches-unsupervised-robotaxi-rides-in-miami',
    },
  },
  {
    id: 'cl-2026-07-02-safety-correction',
    date: '2026-07-02',
    scope: 'Terminal',
    kind: 'correction',
    change: 'Safety panel corrected: "0 incidents · Excellent" removed.',
    detail:
      'The panel previously hardcoded zero incidents and an "Excellent" verdict. It was replaced with reported crash figures attributed to a third-party compilation. The attribution was later found to be incorrect and the whole panel was retired on Aug 12, 2026 — see that entry.',
    tier: 'sourced',
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
  },
  {
    id: 'cl-2026-01-austin-public-driverless',
    date: '2026-01',
    scope: 'Austin, TX',
    kind: 'milestone',
    change: 'Public driverless rides began (no safety monitor).',
    tier: 'sourced',
  },
  {
    id: 'cl-2025-12-14-austin-internal',
    date: '2025-12-14',
    scope: 'Austin, TX',
    kind: 'milestone',
    change: 'Internal/employee driverless testing observed — empty driver seat confirmed on ~2 vehicles.',
    tier: 'sourced',
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
