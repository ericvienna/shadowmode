'use client';

import { useMemo } from 'react';
import { Factory, Car, MapPin, Layers, AlertTriangle } from 'lucide-react';
import type { State } from '@/types/robotaxi';
import type { IncidentFlash } from '@/types/x-intel';
import { calculateStats } from '@/lib/utils';
import { EpistemicStamp } from './EpistemicStamp';

/* ─────────────────────────────────────────────────────────────
   FLEET BUILDOUT — replaced the Safety Signals panel, 2026-08-12.

   WHY THE OLD PANEL WAS REMOVED (Eric's call, and worth recording so
   nobody rebuilds it from an old screenshot):
   it displayed a crash count and a crashes-per-mile rate that had a
   defect at every layer. The denominator was MODELED off two
   unvalidated constants (fleet × 100 mi/day × 180 days, where the
   180 credits every vehicle with six months from the day it is added).
   The numerator was a hardcoded literal, frozen since Dec 2025, so the
   displayed rate improved automatically as the fleet grew with no new
   crash information entering the system. And the citation named a
   private individual who, on inspection, has no connection to
   autonomous vehicles at all — a real person publicly credited as the
   source of a safety statistic he never produced.

   WHAT THIS PANEL DOES DIFFERENTLY: every number here is counted from
   the per-city milestone records this site already maintains. Nothing
   is modeled, nothing is a literal, and there is no third-party
   attribution to go stale. If the underlying records change, these
   change with them.

   NOTE ON "PRODUCTION": this counts vehicles DEPLOYED, not vehicles
   manufactured. Tesla does not break out robotaxi production figures,
   so a manufacturing number here would be someone's estimate wearing
   our chrome. Deployment is the closest thing that is actually
   verifiable, and it is labelled as exactly that.
   ───────────────────────────────────────────────────────────── */

interface FleetBuildoutProps {
  states: State[];
  incidentFlashes?: IncidentFlash[];
}

export function FleetBuildout({ states, incidentFlashes }: FleetBuildoutProps) {
  const stats = useMemo(() => calculateStats(states), [states]);

  const vehiclesPerDriverlessCity =
    stats.citiesWithDriverless > 0
      ? Math.round(stats.totalVehicles / stats.citiesWithDriverless)
      : 0;

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <Factory className="w-4 h-4 text-emerald-400" />
          <div>
            <h3 className="text-sm font-semibold text-neutral-200">Fleet Buildout</h3>
            <p className="text-[10px] text-neutral-500">Vehicles on the road, and where</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Key Metrics — all counted from the milestone record */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-neutral-800/50 rounded-lg p-3 text-center">
            <Car className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-neutral-200">{stats.totalVehicles}</p>
            <p className="text-[9px] text-neutral-500 mb-1">Vehicles deployed</p>
            <EpistemicStamp tier="sourced" />
          </div>

          <div className="bg-neutral-800/50 rounded-lg p-3 text-center">
            <MapPin className="w-5 h-5 text-orange-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-neutral-200">{stats.citiesWithDriverless}</p>
            <p className="text-[9px] text-neutral-500 mb-1">Cities running driverless</p>
            <EpistemicStamp tier="sourced" />
          </div>

          <div className="bg-neutral-800/50 rounded-lg p-3 text-center">
            <Layers className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-neutral-200">{stats.statesCount}</p>
            <p className="text-[9px] text-neutral-500 mb-1">States with activity</p>
            <EpistemicStamp tier="sourced" />
          </div>
        </div>

        {/* Secondary line */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <p className="text-sm font-semibold text-neutral-300">{stats.citiesWithActivity}</p>
            <p className="text-[9px] text-neutral-500">Cities with any activity</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-neutral-300">{stats.citiesWithPublicProgram}</p>
            <p className="text-[9px] text-neutral-500">Public programs launched</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-neutral-300">
              {vehiclesPerDriverlessCity || '—'}
            </p>
            <p className="text-[9px] text-neutral-500">Avg vehicles per driverless city</p>
          </div>
        </div>

        {/* The Record */}
        <div className="bg-neutral-800/30 border border-neutral-800 rounded-lg p-3 mb-4">
          <p className="text-[11px] text-neutral-300 leading-relaxed">
            {stats.totalVehicles} vehicles counted across {stats.citiesWithDriverless} driverless{' '}
            {stats.citiesWithDriverless === 1 ? 'city' : 'cities'} in {stats.statesCount}{' '}
            {stats.statesCount === 1 ? 'state' : 'states'}, compiled from the per-city deployment
            record. These are vehicles <span className="text-neutral-200">deployed</span>, not
            manufactured — Tesla does not publish robotaxi production figures, so any
            manufacturing number would be an estimate rather than a count.
          </p>
        </div>

        {/* Confidence */}
        <div className="space-y-2">
          <p className="text-[10px] text-neutral-500 uppercase">Data Confidence</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div className="h-full w-4/5 bg-emerald-500 rounded-full" />
            </div>
            <span className="text-[10px] text-emerald-400">Counted</span>
          </div>
          <p className="text-[9px] text-neutral-600">
            Every figure above is a count of the milestone records behind this dashboard — no
            modeling, no assumed rates. It is as current as those records, and no more.
          </p>
        </div>

        {/* X Incident Flash — retained; live, and labelled as claimed */}
        {incidentFlashes && incidentFlashes.length > 0 && (
          <div className="mt-4 pt-4 border-t border-red-500/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <p className="text-[10px] text-red-400 uppercase font-medium">X Incident Flash</p>
              <EpistemicStamp tier="claimed" />
            </div>
            <div className="space-y-2 normal-case">
              {incidentFlashes.slice(0, 3).map((inc) => (
                <a
                  key={inc.id}
                  href={inc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-2 rounded bg-red-500/5 border border-red-500/20 hover:border-red-500/40"
                >
                  <p className="text-[10px] text-neutral-300">{inc.headline}</p>
                  {inc.xFirst && inc.newsLagHours && (
                    <p className="text-[8px] text-cyan-400 mt-0.5">X first · {inc.newsLagHours}h before news</p>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Why This Matters */}
        <div className="mt-4 pt-3 border-t border-neutral-800">
          <p className="text-[10px] text-neutral-500 leading-relaxed normal-case">
            <span className="font-semibold text-emerald-400">Why we show this:</span>{' '}
            Buildout is the rollout&apos;s real clock — how many cars, actually driverless, in how
            many places. We publish what can be counted, and label what can&apos;t.
          </p>
        </div>
      </div>
    </div>
  );
}
