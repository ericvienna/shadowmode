'use client';

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, Zap, MapPin, Clock, Shield } from 'lucide-react';
import type { State } from '@/types/robotaxi';
import { generateExecutiveSummary } from '@/lib/utils';

interface ExecutiveSummaryProps {
  states: State[];
}

export function ExecutiveSummary({ states }: ExecutiveSummaryProps) {
  const summary = useMemo(() => generateExecutiveSummary(states), [states]);

  const trendIcon = {
    accelerating: <TrendingUp className="w-4 h-4 text-green-400" />,
    stable: <Minus className="w-4 h-4 text-yellow-400" />,
    slowing: <TrendingDown className="w-4 h-4 text-red-400" />,
  };

  const trendColor = {
    accelerating: 'text-green-400 bg-green-500/10 border-green-500/30',
    stable: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    slowing: 'text-red-400 bg-red-500/10 border-red-500/30',
  };

  const trendLabel = {
    accelerating: 'Accelerating',
    stable: 'Stable',
    slowing: 'Slowing',
  };

  return (
    <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-800 border border-neutral-700 rounded-lg p-4 mb-4">
      {/* Main Headline */}
      <p className="text-sm text-neutral-200 leading-relaxed mb-4">
        {summary.headline}
      </p>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Velocity Status */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${trendColor[summary.velocityStatus]}`}>
          {trendIcon[summary.velocityStatus]}
          <div>
            <p className="text-[10px] uppercase text-neutral-400">Velocity</p>
            <p className="text-xs font-semibold">{trendLabel[summary.velocityStatus]}</p>
          </div>
        </div>

        {/* Cities Active */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-700 bg-neutral-800/50">
          <MapPin className="w-4 h-4 text-blue-400" />
          <div>
            <p className="text-[10px] uppercase text-neutral-400">Active (60d)</p>
            <p className="text-xs font-semibold text-neutral-200">{summary.newCitiesLast60Days} cities</p>
          </div>
        </div>

        {/* Projected Driverless */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-700 bg-neutral-800/50">
          <Clock className="w-4 h-4 text-purple-400" />
          <div>
            <p className="text-[10px] uppercase text-neutral-400">Near-term</p>
            <p className="text-xs font-semibold text-neutral-200">{summary.projectedDriverlessNext6Months} in 6-9mo</p>
          </div>
        </div>

        {/* Highlights Count */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-700 bg-neutral-800/50">
          <Zap className="w-4 h-4 text-yellow-400" />
          <div>
            <p className="text-[10px] uppercase text-neutral-400">Highlights</p>
            <p className="text-xs font-semibold text-neutral-200">{summary.keyHighlights.length} signals</p>
          </div>
        </div>
      </div>

      {/* Key Highlights Pills */}
      {summary.keyHighlights.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-neutral-700/50">
          {summary.keyHighlights.map((highlight, idx) => (
            <span
              key={idx}
              className="text-[10px] px-2 py-1 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700"
            >
              {highlight}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
