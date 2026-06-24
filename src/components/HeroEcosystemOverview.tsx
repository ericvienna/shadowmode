'use client';

import Link from 'next/link';
import { differenceInDays, parseISO } from 'date-fns';
import { ArrowRight, Bot, Battery, Car, Truck } from 'lucide-react';
import type { State } from '@/types/robotaxi';
import { ECOSYSTEM_THESIS, ECOSYSTEM_VERTICALS, OPTIMUS_MILESTONES } from '@/lib/ecosystem-seed-data';
import { calculateStats } from '@/lib/utils';
import { SourceLink } from './energy/SourceLink';
import type { EcosystemVertical, EcosystemVerticalId } from '@/types/ecosystem';

const ICONS: Record<EcosystemVerticalId, typeof Car> = {
  robotaxi: Car,
  energy: Battery,
  semi: Truck,
  optimus: Bot,
};

const STATUS_STYLES = {
  live: 'border-green-500/30 bg-green-500/10 text-green-400',
  ramping: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400',
  planned: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
  watch: 'border-neutral-600 bg-neutral-800/50 text-neutral-400',
};

function getRobotaxiVertical(states: State[]): EcosystemVertical {
  const base = ECOSYSTEM_VERTICALS.find((v) => v.id === 'robotaxi')!;
  const stats = calculateStats(states);
  const austin = states.flatMap((s) => s.cities).find((c) => c.name.toLowerCase() === 'austin');
  const dl = austin?.milestones?.no_safety_monitor;

  if (dl?.status === 'in_progress' && dl.date && !/^\d{4}$/.test(dl.date)) {
    const days = differenceInDays(new Date(), parseISO(dl.date));
    return {
      ...base,
      signal: `AUSTIN DAY ${days}`,
      signalDetail: 'INTERNAL DRIVERLESS TESTING · LEAD MARKET',
      status: 'ramping',
      flag: 'TESTING',
    };
  }

  return {
    ...base,
    signal: `${stats.totalCities} CITIES`,
    signalDetail: `${stats.citiesWithDriverless} DRIVERLESS · ${stats.totalVehicles}+ FLEET TRACKED`,
  };
}

interface HeroEcosystemOverviewProps {
  states: State[];
}

export function HeroEcosystemOverview({ states }: HeroEcosystemOverviewProps) {
  const verticals = ECOSYSTEM_VERTICALS.map((v) =>
    v.id === 'robotaxi' ? getRobotaxiVertical(states) : v
  );

  return (
    <div className="shrink-0 border-b border-neutral-800 px-3 py-3 font-mono uppercase tracking-wide" id="tesla-ecosystem">
      <p className="mb-3 text-[10px] leading-relaxed text-neutral-400">{ECOSYSTEM_THESIS}</p>

      <div className="grid grid-cols-2 gap-2">
        {verticals.map((v) => {
          const Icon = ICONS[v.id];
          return (
            <Link
              key={v.id}
              href={v.href}
              className="group rounded-lg border border-neutral-800 bg-neutral-900/40 p-2.5 transition-colors hover:border-neutral-700 hover:bg-neutral-900"
            >
              <div className="mb-1.5 flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 text-neutral-400 group-hover:text-white" />
                  <span className="text-[10px] font-bold text-white">{v.label}</span>
                </div>
                <span className={`rounded px-1 py-0.5 text-[7px] font-bold uppercase ${STATUS_STYLES[v.status]}`}>
                  {v.status}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-bold tabular-nums text-white">{v.signal}</span>
                {v.flag && (
                  <span className="text-[7px] font-bold uppercase text-yellow-400">{v.flag}</span>
                )}
              </div>
              <p className="mt-0.5 line-clamp-2 text-[8px] text-neutral-500">{v.signalDetail}</p>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-[7px] uppercase tracking-wide text-neutral-600">{v.tagline}</span>
                <SourceLink url={v.sourceUrl} />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Optimus production timeline — honest, sourced */}
      <div className="mt-3 rounded-lg border border-neutral-800 bg-neutral-900/30 p-2.5" id="optimus">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Bot className="h-3.5 w-3.5 text-yellow-400" />
            <span className="text-[9px] font-bold text-white">OPTIMUS PRODUCTION</span>
          </div>
          <span className="text-[7px] text-neutral-600">Q1 2026 CALL · SOURCED</span>
        </div>
        <div className="space-y-1.5">
          {OPTIMUS_MILESTONES.map((m) => (
            <div key={m.label} className="flex items-start justify-between gap-2 text-[9px]">
              <div className="min-w-0">
                <span className="text-neutral-500">{m.label}</span>
                {m.note && <span className="ml-1 text-neutral-600">· {m.note}</span>}
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <span className="font-medium text-neutral-200">{m.value}</span>
                <SourceLink url={m.sourceUrl} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-end gap-3 text-[8px]">
        <Link href="/energy" className="flex items-center gap-0.5 text-green-400 hover:text-green-300">
          ENERGY PANEL <ArrowRight className="h-2.5 w-2.5" />
        </Link>
        <Link href="/semi" className="flex items-center gap-0.5 text-purple-400 hover:text-purple-300">
          SEMI LEDGER <ArrowRight className="h-2.5 w-2.5" />
        </Link>
      </div>
    </div>
  );
}