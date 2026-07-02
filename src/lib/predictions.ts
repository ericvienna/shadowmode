/**
 * The predictions ledger — calls on the record, scored in public.
 *
 * Every prediction states a probability, a resolution date, and the method
 * that will judge it. Resolved calls are scored with the Brier score
 * (mean squared error of stated probability vs outcome; 0 = perfect,
 * 0.25 = coin-flip calibration). Entries are never edited after posting —
 * revisions get a new entry that references the old one.
 */

export type PredictionStatus = 'open' | 'correct' | 'incorrect' | 'void';

export interface Prediction {
  id: string;
  statement: string;
  /** Stated probability at time of posting, 0–1 */
  probability: number;
  madeOn: string;
  resolveBy: string;
  /** How the call will be judged — must be checkable */
  method: string;
  status: PredictionStatus;
  resolvedOn?: string;
  outcomeNote?: string;
}

export const PREDICTIONS: Prediction[] = [
  {
    id: 'pred-2026-07-5-metros',
    statement:
      'Tesla operates public driverless robotaxi service (no safety monitor) in at least 5 US metros by Dec 31, 2026.',
    probability: 0.55,
    madeOn: '2026-07-02',
    resolveBy: '2026-12-31',
    method:
      'Counted on this terminal\'s milestone matrix: "No Safety Monitor" completed in ≥5 metros, each backed by a sourced entry in the change log. Austin, Dallas, Houston count as 3 at posting.',
    status: 'open',
  },
  {
    id: 'pred-2026-07-bay-area-permit',
    statement:
      'California grants Tesla driverless deployment permission for public rides in the Bay Area by Dec 31, 2026.',
    probability: 0.3,
    madeOn: '2026-07-02',
    resolveBy: '2026-12-31',
    method:
      'CA DMV driverless deployment permit + CPUC authorization both granted, per the agencies\' public records. Bay Area service is supervised-only at posting.',
    status: 'open',
  },
  {
    id: 'pred-2026-07-nhtsa-ea26002',
    statement:
      'NHTSA Engineering Analysis EA26002 results in a mandatory recall affecting the robotaxi fleet by Jun 30, 2027.',
    probability: 0.35,
    madeOn: '2026-07-02',
    resolveBy: '2027-06-30',
    method:
      'A recall citing EA26002 that applies to vehicles operating in Tesla\'s driverless service, per NHTSA\'s public database.',
    status: 'open',
  },
  {
    id: 'pred-2026-07-safety-data',
    statement:
      'Tesla publishes per-mile safety data for its robotaxi fleet (crashes or interventions per mile, city-level) by Jun 30, 2027.',
    probability: 0.25,
    madeOn: '2026-07-02',
    resolveBy: '2027-06-30',
    method:
      'An official Tesla publication (report, filing, or investor material) with per-mile robotaxi safety figures. Aggregate FSD-wide claims do not count.',
    status: 'open',
  },
];

export interface LedgerScore {
  resolvedCount: number;
  openCount: number;
  brier: number | null;
  nextResolutionDue: string | null;
}

export function scoreLedger(predictions: Prediction[]): LedgerScore {
  const resolved = predictions.filter(p => p.status === 'correct' || p.status === 'incorrect');
  const open = predictions.filter(p => p.status === 'open');

  const brier =
    resolved.length > 0
      ? resolved.reduce((sum, p) => {
          const outcome = p.status === 'correct' ? 1 : 0;
          return sum + (p.probability - outcome) ** 2;
        }, 0) / resolved.length
      : null;

  const nextResolutionDue =
    open.length > 0 ? open.map(p => p.resolveBy).sort()[0] : null;

  return {
    resolvedCount: resolved.length,
    openCount: open.length,
    brier,
    nextResolutionDue,
  };
}
