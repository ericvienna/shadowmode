'use client';

import { useMemo } from 'react';
import { Clock, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import type { State, ProjectionRange, ConfidenceLevel } from '@/types/robotaxi';
import { calculateAllProjections } from '@/lib/utils';

interface TimeToDriverlessProps {
  states: State[];
}

export function TimeToDriverless({ states }: TimeToDriverlessProps) {
  const projections = useMemo(() => calculateAllProjections(states), [states]);

  const groupedByRange = useMemo(() => {
    const groups: Record<ProjectionRange, typeof projections> = {
      'achieved': [],
      '3-5 months': [],
      '6-9 months': [],
      '9-12 months': [],
      '>12 months': [],
    };
    projections.forEach(p => {
      groups[p.estimatedRange].push(p);
    });
    return groups;
  }, [projections]);

  const rangeConfig: Record<ProjectionRange, { color: string; bgColor: string; icon: React.ReactNode }> = {
    'achieved': {
      color: 'text-green-400',
      bgColor: 'bg-green-500/10 border-green-500/30',
      icon: <CheckCircle2 className="w-4 h-4 text-green-400" />,
    },
    '3-5 months': {
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10 border-blue-500/30',
      icon: <Clock className="w-4 h-4 text-blue-400" />,
    },
    '6-9 months': {
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10 border-yellow-500/30',
      icon: <Clock className="w-4 h-4 text-yellow-400" />,
    },
    '9-12 months': {
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10 border-orange-500/30',
      icon: <AlertCircle className="w-4 h-4 text-orange-400" />,
    },
    '>12 months': {
      color: 'text-neutral-500',
      bgColor: 'bg-neutral-800/50 border-neutral-700',
      icon: <HelpCircle className="w-4 h-4 text-neutral-500" />,
    },
  };

  const confidenceColors: Record<ConfidenceLevel, string> = {
    high: 'text-green-400',
    medium: 'text-yellow-400',
    low: 'text-neutral-500',
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-400" />
          <div>
            <h3 className="text-sm font-semibold text-neutral-200">Time-to-Driverless Projection</h3>
            <p className="text-[10px] text-neutral-500">Estimated timeline based on Austin baseline</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Summary Buckets */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          {(Object.keys(groupedByRange) as ProjectionRange[]).map(range => {
            const config = rangeConfig[range];
            const count = groupedByRange[range].length;
            return (
              <div
                key={range}
                className={`rounded-lg border p-2 text-center ${config.bgColor}`}
              >
                <p className={`text-lg font-bold ${config.color}`}>{count}</p>
                <p className="text-[8px] text-neutral-400 leading-tight">
                  {range === 'achieved' ? 'Live' : range}
                </p>
              </div>
            );
          })}
        </div>

        {/* Near-term Projections Detail */}
        <div className="space-y-3">
          {/* Achieved */}
          {groupedByRange['achieved'].length > 0 && (
            <div>
              <p className="text-[10px] text-green-400 uppercase mb-2 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Driverless Active
              </p>
              <div className="space-y-1">
                {groupedByRange['achieved'].map(p => (
                  <div key={p.cityId} className="flex items-center justify-between text-xs bg-green-500/5 rounded px-2 py-1.5">
                    <span className="text-green-300 font-medium">{p.cityName}</span>
                    <span className="text-green-400 text-[10px]">LIVE</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3-5 months */}
          {groupedByRange['3-5 months'].length > 0 && (
            <div>
              <p className="text-[10px] text-blue-400 uppercase mb-2 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                3-5 Months
              </p>
              <div className="space-y-1">
                {groupedByRange['3-5 months'].map(p => (
                  <div key={p.cityId} className="bg-neutral-800/50 rounded px-2 py-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-200">{p.cityName}</span>
                      <span className={`text-[10px] text-right leading-tight ${confidenceColors[p.confidenceLevel]}`}>
                        <span className="block uppercase">{p.confidenceLevel}</span>
                        <span className="block uppercase">Confidence</span>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {p.factors.slice(0, 2).map((factor, idx) => (
                        <span key={idx} className="text-[9px] text-neutral-500">
                          {factor}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6-9 months */}
          {groupedByRange['6-9 months'].length > 0 && (
            <div>
              <p className="text-[10px] text-yellow-400 uppercase mb-2 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                6-9 Months
              </p>
              <div className="space-y-1">
                {groupedByRange['6-9 months'].slice(0, 5).map(p => (
                  <div key={p.cityId} className="flex items-center justify-between text-xs bg-neutral-800/30 rounded px-2 py-1.5">
                    <span className="text-neutral-300">{p.cityName}</span>
                    <span className={`text-[10px] text-right leading-tight ${confidenceColors[p.confidenceLevel]}`}>
                      <span className="block uppercase">{p.confidenceLevel}</span>
                      <span className="block uppercase">Confidence</span>
                    </span>
                  </div>
                ))}
                {groupedByRange['6-9 months'].length > 5 && (
                  <p className="text-[10px] text-neutral-600 text-center">
                    +{groupedByRange['6-9 months'].length - 5} more
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Methodology Note */}
        <div className="mt-4 pt-3 border-t border-neutral-800">
          <p className="text-[9px] text-neutral-600 leading-relaxed">
            Projections based on Austin timeline (~6 months to driverless), adjusted for regulatory environment,
            current progress, and milestone completion. Low confidence = early stage or restrictive regulation.
          </p>
        </div>
      </div>
    </div>
  );
}
