'use client';

import { useMemo } from 'react';
import { Shield, Car, Newspaper, Clock, CheckCircle2 } from 'lucide-react';
import type { State } from '@/types/robotaxi';
import { calculateSafetyMetrics } from '@/lib/utils';

interface SafetySignalsProps {
  states: State[];
}

export function SafetySignals({ states }: SafetySignalsProps) {
  const safety = useMemo(() => calculateSafetyMetrics(states), [states]);

  const formatMiles = (miles: number) => {
    if (miles >= 1000000) return `${(miles / 1000000).toFixed(1)}M`;
    if (miles >= 1000) return `${(miles / 1000).toFixed(0)}K`;
    return miles.toString();
  };

  const ratingConfig = {
    excellent: {
      color: 'text-green-400',
      bgColor: 'bg-green-500/10 border-green-500/30',
      label: 'Excellent',
      icon: <CheckCircle2 className="w-5 h-5 text-green-400" />,
    },
    good: {
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10 border-yellow-500/30',
      label: 'Good',
      icon: <CheckCircle2 className="w-5 h-5 text-yellow-400" />,
    },
    monitoring: {
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10 border-orange-500/30',
      label: 'Monitoring',
      icon: <Shield className="w-5 h-5 text-orange-400" />,
    },
  };

  const rating = ratingConfig[safety.safetyRating];

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <div>
              <h3 className="text-sm font-semibold text-neutral-200">Safety Signals</h3>
              <p className="text-[10px] text-neutral-500">Preempting the safety question</p>
            </div>
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border ${rating.bgColor}`}>
            {rating.icon}
            <span className={`text-xs font-semibold ${rating.color}`}>{rating.label}</span>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {/* Miles Driven */}
          <div className="bg-neutral-800/50 rounded-lg p-3 text-center">
            <Car className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-neutral-200">
              {formatMiles(safety.estimatedMilesDriven)}
            </p>
            <p className="text-[9px] text-neutral-500">Est. Miles (Driverless)</p>
          </div>

          {/* Incident Headlines */}
          <div className="bg-neutral-800/50 rounded-lg p-3 text-center">
            <Newspaper className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-neutral-200">
              {safety.incidentHeadlinesLast90Days}
            </p>
            <p className="text-[9px] text-neutral-500">Incidents (90d)</p>
          </div>

          {/* Days Since Incident */}
          <div className="bg-neutral-800/50 rounded-lg p-3 text-center">
            <Clock className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-neutral-200">
              {safety.daysSinceLastIncident ?? 'N/A'}
            </p>
            <p className="text-[9px] text-neutral-500">Days Since Last</p>
          </div>
        </div>

        {/* Safety Narrative */}
        <div className="bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-lg p-3 mb-4">
          <p className="text-[11px] text-neutral-300 leading-relaxed">
            <span className="font-semibold text-emerald-400">No major safety incidents reported</span>{' '}
            in Tesla robotaxi testing. The driverless operation in Austin began Dec 14, 2024 with
            third-party route and safety validation completed prior to launch.
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
            Mile estimates based on fleet size × avg daily miles. Incident tracking from public reports only.
          </p>
        </div>

        {/* Why This Matters */}
        <div className="mt-4 pt-3 border-t border-neutral-800">
          <p className="text-[10px] text-neutral-500 leading-relaxed">
            <span className="font-semibold text-emerald-400">Why we show this:</span>{' '}
            Safety skepticism is the #1 criticism. Transparently tracking what we know (and don&apos;t know)
            disarms critics and builds credibility without overclaiming.
          </p>
        </div>
      </div>
    </div>
  );
}
