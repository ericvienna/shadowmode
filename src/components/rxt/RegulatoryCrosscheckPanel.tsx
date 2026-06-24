'use client';

import { ExternalLink, Scale } from 'lucide-react';
import type { RxtRegulatoryCrosscheck } from '@/types/rxt-extended';

export function RegulatoryCrosscheckPanel({
  data,
  communityFleetTotal,
  loading,
}: {
  data: RxtRegulatoryCrosscheck | null;
  communityFleetTotal?: number;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="animate-pulse rounded-xl border border-neutral-800 bg-neutral-950 p-3">
        <div className="h-3 w-44 rounded bg-neutral-800" />
      </div>
    );
  }

  if (!data) return null;

  const gap =
    communityFleetTotal != null && data.texasDmvRegistered > 0
      ? data.texasDmvRegistered - communityFleetTotal
      : null;

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3 font-mono uppercase tracking-wide">
      <div className="mb-2 flex items-center gap-2">
        <Scale className="h-4 w-4 text-purple-400" />
        <span className="text-[10px] text-neutral-500">Regulatory cross-check</span>
        <a
          href={data.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto flex items-center gap-1 text-[9px] text-neutral-600 hover:text-neutral-400"
        >
          TxDMV + RXT <ExternalLink className="h-2.5 w-2.5" />
        </a>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-lg font-bold tabular-nums text-white">{data.texasDmvRegistered}</div>
          <div className="text-[8px] text-neutral-500">TX DMV registered</div>
        </div>
        <div>
          <div className="text-lg font-bold tabular-nums text-white">{data.communityVinMatches}</div>
          <div className="text-[8px] text-neutral-500">VIN-matched (community)</div>
        </div>
      </div>
      {gap != null && gap > 0 && (
        <p className="mt-2 text-[8px] normal-case text-neutral-500">
          ~{gap} DMV-registered units not community-tracked (service area unknown per vehicle).
        </p>
      )}
      <p className="mt-1 text-[8px] normal-case text-neutral-600">{data.methodologyNote}</p>
    </div>
  );
}