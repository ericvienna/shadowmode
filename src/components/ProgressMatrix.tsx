'use client';

import React, { useState, useMemo } from 'react';
import type { State } from '@/types/robotaxi';
import { MILESTONE_DEFINITIONS } from '@/types/robotaxi';
import { MilestoneCell } from './MilestoneCell';
import { getCityProgress, getCitySparklineData } from '@/lib/utils';
import { Sparkline } from './Sparkline';
import { ChevronDown, ChevronRight, MapPin } from 'lucide-react';

interface ProgressMatrixProps {
  states: State[];
}

// Calculate state activity score based on city progress
function getStateActivityScore(state: State): number {
  if (state.cities.length === 0) return 0;

  // Sum of all city progress percentages + bonus for driverless
  let score = 0;
  state.cities.forEach(city => {
    score += getCityProgress(city);
    // Big bonus for driverless cities
    if (city.milestones.no_safety_monitor.status === 'completed') {
      score += 500;
    }
    // Bonus for public program
    if (city.milestones.public_test_program_launched.status === 'completed') {
      score += 200;
    }
    // Bonus for app access
    if (city.milestones.robotaxi_app_access_opens.status === 'completed') {
      score += 100;
    }
  });

  return score;
}

export function ProgressMatrix({ states }: ProgressMatrixProps) {
  const [expandedStates, setExpandedStates] = useState<Set<string>>(
    new Set(states.map(s => s.id))
  );
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  // Sort states by activity score (most active first)
  const sortedStates = useMemo(() => {
    return [...states].sort((a, b) => getStateActivityScore(b) - getStateActivityScore(a));
  }, [states]);

  const toggleState = (stateId: string) => {
    setExpandedStates(prev => {
      const next = new Set(prev);
      if (next.has(stateId)) {
        next.delete(stateId);
      } else {
        next.add(stateId);
      }
      return next;
    });
  };

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-xl" style={{ overflow: 'visible' }}>
      <div className="overflow-x-auto" style={{ overflow: 'visible', overflowX: 'auto' }}>
        <table className="w-full border-collapse"  style={{ overflow: 'visible' }}>
          <thead className="bg-black sticky top-[52px] sm:top-[56px] z-30">
            <tr>
              <th className="px-2 sm:px-3 py-2 text-left text-[10px] font-medium text-neutral-400 uppercase border-b border-r border-neutral-800 w-[140px] sm:w-[180px] min-w-[140px] sm:min-w-[180px] max-w-[140px] sm:max-w-[180px] sticky left-0 bg-black z-40">
                Location
              </th>
              {MILESTONE_DEFINITIONS.map(def => (
                <th
                  key={def.type}
                  className="px-1.5 py-2 text-center text-[9px] font-medium text-neutral-400 uppercase border-b border-r border-neutral-800/50 min-w-[70px] bg-black"
                  title={def.description}
                >
                  {def.shortLabel}
                </th>
              ))}
              <th className="px-2 py-2 text-center text-[10px] font-medium text-neutral-400 uppercase border-b border-neutral-800 min-w-[60px] bg-black">
                Progress
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedStates.map((state, stateIndex) => (
              <React.Fragment key={state.id}>
                {/* State Header Row */}
                <tr
                  className="bg-neutral-900/50 hover:bg-neutral-900 cursor-pointer transition-colors"
                  onClick={() => toggleState(state.id)}
                  style={{ position: 'relative', zIndex: hoveredRow === state.id ? 100 : 1 }}
                  onMouseEnter={() => setHoveredRow(state.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td
                    className="px-2 sm:px-3 py-2 border-b border-r border-neutral-800 sticky left-0 bg-neutral-900/90 z-10 w-[140px] sm:w-[180px] min-w-[140px] sm:min-w-[180px] max-w-[140px] sm:max-w-[180px]"
                  >
                    <div className="flex items-center gap-1 sm:gap-2 overflow-hidden">
                      {expandedStates.has(state.id) ? (
                        <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-neutral-400 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-neutral-400 flex-shrink-0" />
                      )}
                      <span className="font-semibold text-white text-[10px] sm:text-xs truncate">
                        {state.name}
                      </span>
                      <span className="text-neutral-500 text-[9px] sm:text-[10px] hidden sm:inline">
                        ({state.abbreviation})
                      </span>
                      <span className="text-neutral-600 text-[9px] sm:text-[10px] hidden sm:inline">
                        {state.cities.length} {state.cities.length === 1 ? 'city' : 'cities'}
                      </span>
                    </div>
                    {state.notes && (
                      <div className="hidden sm:block ml-6 text-[9px] text-neutral-500 mt-0.5 max-w-[300px] truncate">
                        {state.notes}
                      </div>
                    )}
                  </td>
                  {MILESTONE_DEFINITIONS.map(def => (
                    <td
                      key={def.type}
                      className="border-b border-r border-neutral-800/50 bg-neutral-900/30"
                    />
                  ))}
                  <td className="border-b border-neutral-800 bg-neutral-900/30" />
                </tr>

                {/* City Rows */}
                {expandedStates.has(state.id) &&
                  state.cities.map(city => {
                    const progress = getCityProgress(city);
                    const hasDriverless = city.milestones.no_safety_monitor.status === 'completed';

                    return (
                      <tr
                        key={city.id}
                        className={`hover:bg-neutral-900/30 transition-colors ${
                          hasDriverless ? 'bg-green-500/5' : ''
                        }`}
                        style={{ position: 'relative', zIndex: hoveredRow === city.id ? 100 : 1 }}
                        onMouseEnter={() => setHoveredRow(city.id)}
                        onMouseLeave={() => setHoveredRow(null)}
                      >
                        <td className="px-2 sm:px-3 py-1.5 border-b border-r border-neutral-800/50 sticky left-0 bg-black/90 z-10 w-[140px] sm:w-[180px] min-w-[140px] sm:min-w-[180px] max-w-[140px] sm:max-w-[180px]">
                          <div className="flex items-center gap-1 sm:gap-2 pl-4 sm:pl-6 overflow-hidden">
                            <MapPin className="w-3 h-3 text-neutral-500 flex-shrink-0" />
                            <span className="text-neutral-200 text-[10px] sm:text-xs truncate">
                              {city.name}
                            </span>
                            {hasDriverless && (
                              <span className="hidden sm:inline px-1.5 py-0.5 text-[8px] font-semibold bg-green-500/20 text-green-400 rounded border border-green-500/30">
                                DRIVERLESS
                              </span>
                            )}
                          </div>
                        </td>
                        {MILESTONE_DEFINITIONS.map(def => (
                          <MilestoneCell
                            key={def.type}
                            milestone={city.milestones[def.type]}
                            definition={def}
                          />
                        ))}
                        <td className="px-2 py-1.5 border-b border-neutral-800/50 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Sparkline
                              data={getCitySparklineData(city)}
                              width={40}
                              height={16}
                              color={progress >= 75 ? '#22c55e' : progress >= 40 ? '#eab308' : '#6b7280'}
                            />
                            <div className="w-12 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full animate-progress ${
                                  progress >= 75
                                    ? 'bg-green-500'
                                    : progress >= 40
                                    ? 'bg-yellow-500'
                                    : 'bg-neutral-600'
                                }`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-neutral-400 w-8">
                              {progress}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
