'use client';

import { useMemo } from 'react';
import { Activity, TrendingUp, TrendingDown, Minus, Rocket, Target, Zap, AlertTriangle } from 'lucide-react';
import type { State } from '@/types/robotaxi';
import { calculateVelocityMetrics } from '@/lib/utils';

interface RolloutVelocityProps {
  states: State[];
}

export function RolloutVelocity({ states }: RolloutVelocityProps) {
  const velocity = useMemo(() => calculateVelocityMetrics(states), [states]);

  const trendConfig = {
    accelerating: {
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10 border-green-500/30',
      label: 'Accelerating',
      trajectory: 'Current momentum suggests network effects could compound within quarters.',
      question: 'Can this acceleration be sustained through regulatory scaling?',
    },
    stable: {
      icon: <Minus className="w-5 h-5" />,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10 border-yellow-500/30',
      label: 'Stable',
      trajectory: 'Steady deployment—neither compounding nor stalling.',
      question: 'Is this consolidation before expansion, or a ceiling?',
    },
    slowing: {
      icon: <TrendingDown className="w-5 h-5" />,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10 border-red-500/30',
      label: 'Slowing',
      trajectory: 'If current velocity persists, nationwide saturation shifts from quarters to years.',
      question: 'Is this a temporary digestion phase or a structural slowdown?',
    },
  };

  const trend = trendConfig[velocity.overallTrend];

  // Institutional interpretations based on trend
  const institutionalReads = useMemo(() => {
    if (velocity.overallTrend === 'slowing') {
      return [
        'Deployment deceleration increases regulatory sensitivity window',
        'Slower rollout delays network effect compounding',
        'Acceleration inflection matters more than total cities deployed',
      ];
    } else if (velocity.overallTrend === 'accelerating') {
      return [
        'Momentum creates regulatory momentum—permits beget permits',
        'Network effects begin compounding above critical mass',
        'Institutional confidence increases with deployment velocity',
      ];
    }
    return [
      'Stable deployment preserves optionality',
      'Neither bullish nor bearish signal for near-term',
      'Watch for inflection in next 60 days',
    ];
  }, [velocity.overallTrend]);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <div>
              <h3 className="text-sm font-semibold text-neutral-200">Rollout Velocity</h3>
              <p className="text-[10px] text-neutral-500">Deployment acceleration signal</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border ${trend.bgColor}`}>
              <span className={trend.color}>{trend.icon}</span>
              <span className={`text-xs font-semibold ${trend.color}`}>{trend.label}</span>
            </div>
          </div>
        </div>
        {/* Trajectory Sentence */}
        <p className={`text-[10px] mt-2 ${trend.color} opacity-80 italic`}>
          {trend.trajectory}
        </p>
      </div>

      <div className="p-4">
        {/* Month-over-Month Comparison */}
        <div className="mb-4">
          <p className="text-[10px] text-neutral-500 uppercase mb-3">Month-over-Month Change</p>
          <div className="flex items-center justify-between bg-neutral-800/50 rounded-lg p-3">
            <div className="text-center">
              <p className="text-[9px] text-neutral-500 uppercase mb-1">Last Month</p>
              <p className="text-xl font-bold text-neutral-400">{velocity.newCitiesLastMonth}</p>
              <p className="text-[9px] text-neutral-600">milestones</p>
            </div>
            <div className="flex flex-col items-center px-4">
              <div className={`text-2xl ${trend.color}`}>
                {velocity.newCitiesThisMonth > velocity.newCitiesLastMonth ? '↑' :
                 velocity.newCitiesThisMonth < velocity.newCitiesLastMonth ? '↓' : '→'}
              </div>
              <p className={`text-[10px] font-medium ${trend.color}`}>
                {velocity.newCitiesThisMonth > velocity.newCitiesLastMonth
                  ? `+${velocity.newCitiesThisMonth - velocity.newCitiesLastMonth}`
                  : velocity.newCitiesThisMonth < velocity.newCitiesLastMonth
                    ? `${velocity.newCitiesThisMonth - velocity.newCitiesLastMonth}`
                    : 'No change'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[9px] text-neutral-500 uppercase mb-1">This Month</p>
              <p className={`text-xl font-bold ${trend.color}`}>{velocity.newCitiesThisMonth}</p>
              <p className="text-[9px] text-neutral-600">milestones</p>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* New Cities */}
          <div className="bg-neutral-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Rocket className="w-4 h-4 text-blue-400" />
              <span className="text-[10px] text-neutral-400 uppercase">New Activity</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-neutral-200">
                {velocity.newCitiesThisMonth + velocity.newCitiesLastMonth}
              </span>
              <span className="text-[10px] text-neutral-500">cities (60d)</span>
            </div>
            <div className="text-[10px] text-neutral-500 mt-1">
              {velocity.newCitiesThisMonth} this month, {velocity.newCitiesLastMonth} last month
            </div>
          </div>

          {/* Test Launches */}
          <div className="bg-neutral-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-purple-400" />
              <span className="text-[10px] text-neutral-400 uppercase">Test Launches</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-neutral-200">
                {velocity.testLaunchesThisQuarter}
              </span>
              <span className="text-[10px] text-neutral-500">this quarter</span>
            </div>
            <div className="text-[10px] text-neutral-500 mt-1">
              vs {velocity.testLaunchesLastQuarter} last quarter
            </div>
          </div>
        </div>

        {/* Driverless Events - Reframed with Stakes */}
        <div className="bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/20 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-green-400" />
              <span className="text-xs font-medium text-neutral-200">Confirmed Driverless Milestones</span>
            </div>
            <span className="text-lg font-bold text-green-400">
              {velocity.driverlessEventsThisYear}
            </span>
          </div>
          <p className="text-[9px] text-neutral-500">
            Threshold events (not demos) — these unlock regulatory and insurance confidence
          </p>
        </div>

        {/* Institutional Read */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-3 h-3 text-yellow-500" />
            <p className="text-[10px] text-yellow-500/80 uppercase font-medium">Institutional Read</p>
          </div>
          <ul className="space-y-1.5">
            {institutionalReads.map((read, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-neutral-600 text-[10px] mt-0.5">•</span>
                <span className="text-[10px] text-neutral-400 leading-relaxed">{read}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* The Open Question */}
        <div className="pt-3 border-t border-neutral-800">
          <p className="text-[10px] text-neutral-600 uppercase mb-1">The Open Question</p>
          <p className={`text-[11px] ${trend.color} leading-relaxed italic`}>
            {trend.question}
          </p>
        </div>
      </div>
    </div>
  );
}
