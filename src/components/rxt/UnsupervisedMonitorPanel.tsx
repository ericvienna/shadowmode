'use client';

import { ExternalLink, Zap } from 'lucide-react';
import type { RxtExtendedPayload } from '@/types/rxt-extended';

export function UnsupervisedMonitorPanel({
  data,
  loading,
}: {
  data: RxtExtendedPayload | null;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="animate-pulse rounded-xl border border-neutral-800 bg-neutral-950 p-3">
        <div className="h-3 w-48 rounded bg-neutral-800" />
      </div>
    );
  }

  const summary = data?.unsupervisedSummary;
  const markets = data?.unsupervisedMarkets ?? [];
  if (!summary && markets.length === 0) return null;

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3 font-mono uppercase tracking-wide">
      <div className="mb-2 flex items-center gap-2">
        <Zap className="h-4 w-4 text-yellow-400" />
        <span className="text-[10px] text-neutral-500">Unsupervised conversion</span>
        <a
          href="https://robotaxitracker.com/unsupervised"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto flex items-center gap-1 text-[9px] text-neutral-600 hover:text-neutral-400"
        >
          robotaxitracker.com <ExternalLink className="h-2.5 w-2.5" />
        </a>
      </div>
      {summary && (
        <div className="mb-2 grid grid-cols-3 gap-2">
          <div>
            <div className="text-base font-bold text-white">{summary.activeVehicles}</div>
            <div className="text-[8px] text-neutral-500">Active 30d</div>
          </div>
          <div>
            <div className="text-base font-bold text-white">{summary.loggedRides}</div>
            <div className="text-[8px] text-neutral-500">Unsup. rides</div>
          </div>
          <div>
            <div className="text-base font-bold text-yellow-400">{summary.sharePct.toFixed(1)}%</div>
            <div className="text-[8px] text-neutral-500">Of tracked</div>
          </div>
        </div>
      )}
      {markets.length > 0 && (
        <div className="space-y-1">
          {markets.map((m) => (
            <div key={m.market} className="flex items-center justify-between text-[9px] text-neutral-400">
              <span className="capitalize">{m.market.replace('-', ' ')}</span>
              <span className="tabular-nums text-neutral-300">
                {m.vehicles}v · {m.rides}r · <span className="text-yellow-400/90">{m.unsupervisedSharePct}%</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}