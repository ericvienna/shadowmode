'use client';

import { useMemo } from 'react';
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { State } from '@/types/robotaxi';
import { calculateVelocityMetrics } from '@/lib/utils';

interface RolloutVelocityProps {
  states: State[];
}

export function RolloutVelocity({ states }: RolloutVelocityProps) {
  const velocity = useMemo(() => calculateVelocityMetrics(states), [states]);

  const trendConfig = {
    accelerating: {
      icon: <TrendingUp className="w-4 h-4" />,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10 border-green-500/30',
      label: 'Accelerating',
    },
    stable: {
      icon: <Minus className="w-4 h-4" />,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10 border-yellow-500/30',
      label: 'Stable',
    },
    slowing: {
      icon: <TrendingDown className="w-4 h-4" />,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10 border-red-500/30',
      label: 'Slowing',
    },
  };

  const trend = trendConfig[velocity.overallTrend];

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-neutral-200">Rollout Velocity</h3>
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded border ${trend.bgColor}`}>
            <span className={trend.color}>{trend.icon}</span>
            <span className={`text-xs font-semibold ${trend.color}`}>{trend.label}</span>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Month-over-Month */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-neutral-800">
          <div className="text-center">
            <p className="text-[9px] text-neutral-500 uppercase">Last Mo</p>
            <p className="text-xl font-bold text-neutral-400">{velocity.newCitiesLastMonth}</p>
          </div>
          <div className="flex flex-col items-center">
            <div className={`text-2xl ${trend.color}`}>
              {velocity.newCitiesThisMonth > velocity.newCitiesLastMonth ? '→' :
               velocity.newCitiesThisMonth < velocity.newCitiesLastMonth ? '→' : '→'}
            </div>
          </div>
          <div className="text-center">
            <p className="text-[9px] text-neutral-500 uppercase">This Mo</p>
            <p className={`text-xl font-bold ${trend.color}`}>{velocity.newCitiesThisMonth}</p>
          </div>
        </div>

        {/* Key Stats */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-neutral-500 uppercase">60-Day Activity</span>
            <span className="text-sm font-bold text-neutral-200">
              {velocity.newCitiesThisMonth + velocity.newCitiesLastMonth} cities
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-neutral-500 uppercase">Quarter Launches</span>
            <span className="text-sm font-bold text-neutral-200">
              {velocity.testLaunchesThisQuarter} <span className="text-neutral-500 font-normal">vs {velocity.testLaunchesLastQuarter}</span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-neutral-500 uppercase">Driverless Events</span>
            <span className="text-sm font-bold text-green-400">{velocity.driverlessEventsThisYear}</span>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="mt-4 pt-3 border-t border-neutral-800">
          <p className="text-[9px] text-neutral-600 italic text-center">
            {velocity.overallTrend === 'accelerating'
              ? 'Momentum compounding. Watch for network effects.'
              : velocity.overallTrend === 'slowing'
                ? 'Deceleration phase. Regulatory bottleneck likely.'
                : 'Consolidation before expansion, or ceiling?'}
          </p>
        </div>
      </div>
    </div>
  );
}
