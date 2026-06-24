'use client';

import { ExternalLink, DollarSign } from 'lucide-react';
import type { RxtCommunityOps } from '@/types/rxt-extended';

export function CommunityOpsPanel({ data, loading }: { data: RxtCommunityOps | null; loading?: boolean }) {
  if (loading) {
    return (
      <div className="animate-pulse rounded-xl border border-neutral-800 bg-neutral-950 p-3">
        <div className="mb-2 h-3 w-40 rounded bg-neutral-800" />
        <div className="grid grid-cols-2 gap-2">
          <div className="h-10 rounded bg-neutral-900" />
          <div className="h-10 rounded bg-neutral-900" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3 font-mono uppercase tracking-wide">
      <div className="mb-2 flex items-center gap-2">
        <DollarSign className="h-4 w-4 text-green-400" />
        <span className="text-[10px] text-neutral-500">Community ops</span>
        <a
          href={data.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto flex items-center gap-1 text-[9px] text-neutral-600 hover:text-neutral-400"
        >
          robotaxitracker.com <ExternalLink className="h-2.5 w-2.5" />
        </a>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <div className="text-lg font-bold tabular-nums text-white">{data.totalRides.toLocaleString()}</div>
          <div className="text-[9px] text-neutral-500">Logged rides</div>
        </div>
        <div>
          <div className="text-lg font-bold tabular-nums text-white">
            {data.medianFare != null ? `$${data.medianFare.toFixed(2)}` : '—'}
          </div>
          <div className="text-[9px] text-neutral-500">Median fare</div>
        </div>
        <div>
          <div className="text-lg font-bold tabular-nums text-white">
            {data.farePerMile != null ? `$${data.farePerMile.toFixed(2)}` : '—'}
          </div>
          <div className="text-[9px] text-neutral-500">Per mile</div>
        </div>
        <div>
          <div className="text-lg font-bold tabular-nums text-white">
            {data.avgMiles != null ? `${data.avgMiles.toFixed(1)} mi` : '—'}
          </div>
          <div className="text-[9px] text-neutral-500">Avg trip</div>
        </div>
      </div>
      <p className="mt-2 text-[8px] normal-case text-neutral-600">{data.methodologyNote}</p>
    </div>
  );
}