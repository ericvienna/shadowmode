'use client';

import { useEffect, useState } from 'react';
import type { State } from '@/types/robotaxi';
import { getCountdownStats } from '@/lib/utils';
import { Timer, TrendingUp, Calendar } from 'lucide-react';

interface CountdownWidgetProps {
  states: State[];
}

interface CountdownStatsType {
  mostRecentMilestone: { city: string; state: string; milestone: string; date: string; daysAgo: number } | null;
  citiesUntilNextDriverless: number;
  milestonesThisMonth: number;
}

export function CountdownWidget({ states }: CountdownWidgetProps) {
  const [stats, setStats] = useState<CountdownStatsType | null>(null);

  useEffect(() => {
    setStats(getCountdownStats(states));
  }, [states]);

  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Days Since Last Milestone */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Timer className="w-4 h-4 text-yellow-500" />
          <span className="text-[10px] text-neutral-500 uppercase">Days Since</span>
        </div>
        <div className="text-2xl font-bold text-white animate-count-up">
          {stats.mostRecentMilestone?.daysAgo ?? '—'}
        </div>
        <div className="text-[10px] text-neutral-400 mt-1 truncate">
          {stats.mostRecentMilestone
            ? `${stats.mostRecentMilestone.milestone} in ${stats.mostRecentMilestone.city}`
            : 'No recent milestones'
          }
        </div>
      </div>

      {/* Milestones This Month */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4 text-green-500" />
          <span className="text-[10px] text-neutral-500 uppercase">This Month</span>
        </div>
        <div className="text-2xl font-bold text-green-400 animate-count-up">
          {stats.milestonesThisMonth}
        </div>
        <div className="text-[10px] text-neutral-400 mt-1">
          Milestones completed
        </div>
      </div>

      {/* Latest Elon Tweet */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          <span className="text-[10px] text-neutral-500 uppercase">Elon Musk</span>
          <span className="text-[8px] text-neutral-600 ml-auto">Dec 14</span>
        </div>
        <div className="text-[11px] text-white leading-relaxed">
          Testing is underway with no occupants in the car
        </div>
        <a
          href="https://x.com/elonmusk/status/2000302654837371181"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[9px] text-blue-400 hover:underline mt-2 block"
        >
          View on X →
        </a>
      </div>

      {/* Progress Momentum */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-blue-500" />
          <span className="text-[10px] text-neutral-500 uppercase">Momentum</span>
        </div>
        <div className={`text-2xl font-bold animate-count-up ${
          stats.milestonesThisMonth > 5 ? 'text-green-400' :
          stats.milestonesThisMonth > 2 ? 'text-yellow-400' : 'text-neutral-400'
        }`}>
          {stats.milestonesThisMonth > 5 ? 'High' :
           stats.milestonesThisMonth > 2 ? 'Med' : 'Low'}
        </div>
        <div className="text-[10px] text-neutral-400 mt-1">
          Activity level
        </div>
      </div>
    </div>
  );
}
