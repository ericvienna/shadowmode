'use client';

import { useMemo, useState } from 'react';
import { Gauge, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import type { State } from '@/types/robotaxi';
import {
  calculateAllReadinessScores,
  calculateStateReadiness,
  calculateNationalReadinessTrend,
} from '@/lib/utils';

interface ReadinessIndexProps {
  states: State[];
}

export function ReadinessIndex({ states }: ReadinessIndexProps) {
  const [showAll, setShowAll] = useState(false);

  const cityScores = useMemo(() => calculateAllReadinessScores(states), [states]);
  const stateScores = useMemo(() => calculateStateReadiness(states), [states]);
  const nationalTrend = useMemo(() => calculateNationalReadinessTrend(states), [states]);

  // National average
  const nationalAvg = useMemo(() => {
    if (cityScores.length === 0) return 0;
    return Math.round(cityScores.reduce((sum, c) => sum + c.score, 0) / cityScores.length);
  }, [cityScores]);

  const displayedCities = showAll ? cityScores : cityScores.slice(0, 6);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    if (score >= 25) return 'text-orange-400';
    return 'text-neutral-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    if (score >= 25) return 'bg-orange-500';
    return 'bg-neutral-600';
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'rising') return <TrendingUp className="w-3 h-3 text-green-400" />;
    return null;
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-blue-400" />
          <div>
            <h3 className="text-sm font-semibold text-neutral-200">Readiness Index</h3>
            <p className="text-[10px] text-neutral-500">Weighted deployment score (0-100)</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-neutral-500 uppercase">National Avg</p>
          <p className={`text-lg font-bold ${getScoreColor(nationalAvg)}`}>{nationalAvg}</p>
        </div>
      </div>

      <div className="p-4">
        {/* National Trend Sparkline */}
        <div className="mb-4 pb-4 border-b border-neutral-800">
          <p className="text-[10px] text-neutral-500 uppercase mb-2">6-Month Trend</p>
          <div className="flex items-end gap-1 h-8">
            {nationalTrend.map((value, idx) => (
              <div
                key={idx}
                className="flex-1 bg-blue-500/30 rounded-t transition-all"
                style={{ height: `${Math.max((value / 100) * 100, 10)}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-neutral-600">6mo ago</span>
            <span className="text-[9px] text-neutral-600">Now</span>
          </div>
        </div>

        {/* Top Cities by Readiness */}
        <div className="mb-4">
          <p className="text-[10px] text-neutral-500 uppercase mb-2">City Readiness Rankings</p>
          <div className="space-y-2">
            {displayedCities.map((city, idx) => (
              <div key={city.cityId} className="flex items-center gap-2">
                <span className="text-[10px] text-neutral-600 w-4">{idx + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-neutral-300">{city.cityName}</span>
                      {getTrendIcon(city.trend)}
                    </div>
                    <span className={`text-xs font-bold ${getScoreColor(city.score)}`}>
                      {city.score}
                    </span>
                  </div>
                  <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${getScoreBg(city.score)}`}
                      style={{ width: `${city.score}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {cityScores.length > 6 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full mt-3 py-2 text-[10px] text-neutral-400 hover:text-neutral-200 flex items-center justify-center gap-1 transition-colors"
            >
              {showAll ? (
                <>
                  <ChevronUp className="w-3 h-3" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" />
                  Show All {cityScores.length} Cities
                </>
              )}
            </button>
          )}
        </div>

        {/* State Averages */}
        <div className="pt-4 border-t border-neutral-800">
          <p className="text-[10px] text-neutral-500 uppercase mb-2">State Averages</p>
          <div className="grid grid-cols-3 gap-2">
            {stateScores.slice(0, 6).map(state => (
              <div
                key={state.stateId}
                className="bg-neutral-800/50 rounded px-2 py-1.5 text-center"
              >
                <p className="text-[10px] text-neutral-400">{state.stateName}</p>
                <p className={`text-sm font-bold ${getScoreColor(state.avgScore)}`}>
                  {state.avgScore}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Weight Methodology */}
        <div className="mt-4 pt-3 border-t border-neutral-800">
          <p className="text-[9px] text-neutral-600 leading-relaxed">
            Score weights: Regulatory (30%) + Insurance (20%) + App Access (15%) + Fleet (15%) + Driverless (20%)
          </p>
        </div>

      </div>
    </div>
  );
}
