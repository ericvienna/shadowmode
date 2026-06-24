'use client';

import type { ReactNode } from 'react';

export interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  iconClassName?: string;
  valueClassName?: string;
  highlight?: boolean;
  trailing?: ReactNode;
}

/** Shared stat tile — matches StatsCards technical mono layout */
export function MetricCard({
  label,
  value,
  subtitle,
  icon,
  iconClassName = 'text-neutral-400',
  valueClassName = 'text-white',
  highlight = false,
  trailing,
}: MetricCardProps) {
  return (
    <div
      className={`rounded-xl border bg-neutral-950 p-4 font-mono uppercase tracking-wide ${
        highlight ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-neutral-800'
      }`}
    >
      <div className="mb-3 flex items-start justify-between">
        <div
          className={`rounded-lg p-2 ${
            highlight ? 'bg-yellow-500/10' : 'bg-neutral-800'
          }`}
        >
          <span className={iconClassName}>{icon}</span>
        </div>
        {trailing}
      </div>
      <div className={`mb-1 text-2xl font-bold tabular-nums leading-none ${valueClassName}`}>
        {value}
      </div>
      <div className="text-xs text-neutral-400">{label}</div>
      {subtitle && <div className="mt-1 text-[10px] text-neutral-600">{subtitle}</div>}
    </div>
  );
}