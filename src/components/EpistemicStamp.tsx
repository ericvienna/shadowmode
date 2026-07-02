/**
 * Epistemic tiering — every number on the terminal wears one of three stamps.
 *
 * SOURCED — traceable to a primary source (permit filing, official statement, public record)
 * MODELED — our estimate, computed from stated assumptions; never wears a verdict badge
 * CLAIMED — asserted by a company or individual; reported, not independently verified
 */

export type EpistemicTier = 'sourced' | 'modeled' | 'claimed';

const TIER_CONFIG: Record<EpistemicTier, { label: string; className: string; title: string }> = {
  sourced: {
    label: 'Sourced',
    className: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/5',
    title: 'Traceable to a primary source — permit filing, official statement, or public record.',
  },
  modeled: {
    label: 'Modeled',
    className: 'text-amber-400 border-amber-500/40 bg-amber-500/5',
    title: 'Our estimate, computed from stated assumptions. Not a reported figure.',
  },
  claimed: {
    label: 'Claimed',
    className: 'text-sky-400 border-sky-500/40 bg-sky-500/5',
    title: 'Asserted by a company or individual. Reported, not independently verified.',
  },
};

interface EpistemicStampProps {
  tier: EpistemicTier;
  className?: string;
}

export function EpistemicStamp({ tier, className = '' }: EpistemicStampProps) {
  const config = TIER_CONFIG[tier];
  return (
    <span
      title={config.title}
      className={`inline-flex items-center px-1.5 py-0.5 border rounded-sm text-[8px] font-bold tracking-[0.15em] uppercase ${config.className} ${className}`}
    >
      {config.label}
    </span>
  );
}
