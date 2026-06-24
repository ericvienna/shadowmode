'use client';

import { ExternalLink, Radio } from 'lucide-react';
import type { RxtAreaStats } from '@/types/robotaxi-tracker';

interface RobotaxiTrackerStripProps {
  stats: RxtAreaStats | null;
  loading?: boolean;
  error?: string | null;
  compact?: boolean;
}

function InnerMetric({
  label,
  value,
  subtitle,
  valueClassName = 'text-white',
}: {
  label: string;
  value: number;
  subtitle: string;
  valueClassName?: string;
}) {
  return (
    <div className="font-mono uppercase tracking-wide">
      <div className={`mb-1 text-xl font-bold tabular-nums leading-none ${valueClassName}`}>{value}</div>
      <div className="text-[10px] text-neutral-400">{label}</div>
      <div className="mt-1 text-[9px] text-neutral-600">{subtitle}</div>
    </div>
  );
}

export function RobotaxiTrackerStrip({ stats, loading, error, compact }: RobotaxiTrackerStripProps) {
  if (loading && !stats) {
    return (
      <div className="animate-pulse rounded-xl border border-neutral-800 bg-neutral-950 p-3">
        <div className="mb-3 h-3 w-32 rounded bg-neutral-800" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-12 rounded bg-neutral-900" />
          <div className="h-12 rounded bg-neutral-900" />
        </div>
      </div>
    );
  }

  if (!stats) {
    if (error) {
      return (
        <a
          href="https://robotaxitracker.com/?provider=tesla&area=austin"
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-xl border border-neutral-800 bg-neutral-950 p-3 text-[10px] text-neutral-500 hover:text-neutral-300"
        >
          Community fleet unavailable · view on robotaxitracker.com →
        </a>
      );
    }
    return null;
  }

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3 font-mono uppercase tracking-wide">
      <div className="mb-3 flex items-center gap-2">
        <Radio className="h-4 w-4 text-green-500" />
        <span className="text-[10px] text-neutral-500">Community fleet</span>
        <span className="text-[9px] text-neutral-600">· {stats.areaLabel}</span>
        <a
          href={stats.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto flex items-center gap-1 text-[9px] text-neutral-600 hover:text-neutral-400"
        >
          robotaxitracker.com <ExternalLink className="h-2.5 w-2.5" />
        </a>
      </div>

      <div className={`grid gap-3 ${compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        <InnerMetric label="Rider vehicles" value={stats.riderVehicles} subtitle="Discovered" />
        {stats.unsupervised30d !== null && (
          <InnerMetric
            label="Unsupervised"
            value={stats.unsupervised30d}
            subtitle="30d active"
            valueClassName="text-green-400"
          />
        )}
        {stats.cybercabs !== null && (
          <InnerMetric
            label="Cybercabs"
            value={stats.cybercabs}
            subtitle="Test fleet"
            valueClassName="text-neutral-200"
          />
        )}
        {stats.inactive30d !== null && (
          <InnerMetric
            label="Inactive"
            value={stats.inactive30d}
            subtitle="30d unseen"
            valueClassName="text-neutral-400"
          />
        )}
      </div>

      {stats.unsupervisedRides && (
        <p className="mt-3 text-[10px] text-neutral-400">
          Unsupervised rides{' '}
          <span className="font-semibold text-green-400">{stats.unsupervisedRides.pct}%</span>
          {' · '}
          {stats.unsupervisedRides.completed} of {stats.unsupervisedRides.total} logged (
          {stats.unsupervisedRides.windowLabel.toLowerCase()})
        </p>
      )}
    </div>
  );
}