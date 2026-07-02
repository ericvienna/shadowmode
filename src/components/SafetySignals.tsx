'use client';

import { useMemo } from 'react';
import { Shield, Car, FileText, Gauge, AlertTriangle } from 'lucide-react';
import type { State } from '@/types/robotaxi';
import type { IncidentFlash } from '@/types/x-intel';
import { calculateSafetyMetrics } from '@/lib/utils';
import { EpistemicStamp } from './EpistemicStamp';

interface SafetySignalsProps {
  states: State[];
  incidentFlashes?: IncidentFlash[];
}

export function SafetySignals({ states, incidentFlashes }: SafetySignalsProps) {
  const safety = useMemo(() => calculateSafetyMetrics(states), [states]);

  const formatMiles = (miles: number) => {
    if (miles >= 1000000) return `${(miles / 1000000).toFixed(1)}M`;
    if (miles >= 1000) return `${(miles / 1000).toFixed(0)}K`;
    return miles.toString();
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <div>
              <h3 className="text-sm font-semibold text-neutral-200">Safety Signals</h3>
              <p className="text-[10px] text-neutral-500">What the public record shows</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {/* Miles Driven — modeled */}
          <div className="bg-neutral-800/50 rounded-lg p-3 text-center">
            <Car className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-neutral-200">
              {formatMiles(safety.estimatedMilesDriven)}
            </p>
            <p className="text-[9px] text-neutral-500 mb-1">Est. Miles (Driverless)</p>
            <EpistemicStamp tier="modeled" />
          </div>

          {/* Reported Crashes — sourced */}
          <div className="bg-neutral-800/50 rounded-lg p-3 text-center">
            <FileText className="w-5 h-5 text-orange-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-neutral-200">{safety.reportedCrashes}</p>
            <p className="text-[9px] text-neutral-500 mb-1">
              Crashes reported since {safety.reportedCrashesSince}
            </p>
            <EpistemicStamp tier="sourced" />
          </div>

          {/* Crash Rate — modeled */}
          <div className="bg-neutral-800/50 rounded-lg p-3 text-center">
            <Gauge className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-neutral-200">{safety.reportedCrashRate}</p>
            <p className="text-[9px] text-neutral-500 mb-1">Reported crash rate</p>
            <EpistemicStamp tier="modeled" />
          </div>
        </div>

        {/* The Record */}
        <div className="bg-neutral-800/30 border border-neutral-800 rounded-lg p-3 mb-4">
          <p className="text-[11px] text-neutral-300 leading-relaxed">
            {safety.reportedCrashes} crashes reported in Austin robotaxi operations since{' '}
            {safety.reportedCrashesSince} per public reports ({safety.reportedCrashRate}).
            Internal driverless testing began Dec 14, 2025; public driverless rides began Jan 2026.
            No independent audit of these figures exists.
          </p>
        </div>

        {/* Confidence Note */}
        <div className="space-y-2">
          <p className="text-[10px] text-neutral-500 uppercase">Data Confidence</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div className="h-full w-2/3 bg-yellow-500 rounded-full" />
            </div>
            <span className="text-[10px] text-yellow-400">Medium</span>
          </div>
          <p className="text-[9px] text-neutral-600">
            Mile estimates based on fleet size × avg daily miles. Crash tracking from public reports
            only — Tesla does not publish per-mile safety data for this fleet.
          </p>
        </div>

        {/* X Incident Flash — live early warning */}
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
            Safety is the question that decides this rollout. We publish what the public record
            supports — and label what it doesn&apos;t.
          </p>
        </div>
      </div>
    </div>
  );
}
