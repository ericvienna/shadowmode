'use client';

import { useMemo } from 'react';
import type { State } from '@/types/robotaxi';
import { MILESTONE_DEFINITIONS } from '@/types/robotaxi';
import { getRecentActivity, formatDate } from '@/lib/utils';
import { Check, MapPin } from 'lucide-react';

interface TimelineViewProps {
  states: State[];
  onCityClick?: (cityId: string) => void;
}

interface TimelineEvent {
  id: string;
  date: string;
  cityName: string;
  stateAbbr: string;
  milestoneLabel: string;
  milestoneType: string;
  isDriverless: boolean;
}

export function TimelineView({ states, onCityClick }: TimelineViewProps) {
  const events = useMemo(() => {
    const activities = getRecentActivity(states, 365 * 3); // 3 years
    return activities.map(a => ({
      id: a.id,
      date: a.date,
      cityName: a.cityName,
      stateAbbr: a.stateAbbr,
      milestoneLabel: a.milestoneLabel,
      milestoneType: a.milestoneType,
      isDriverless: a.milestoneType === 'no_safety_monitor',
    }));
  }, [states]);

  // Group events by month
  const groupedEvents = useMemo(() => {
    const groups: Record<string, TimelineEvent[]> = {};
    events.forEach(event => {
      const monthKey = event.date.substring(0, 7); // YYYY-MM
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(event);
    });
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [events]);

  const formatMonthHeader = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-neutral-800">
        <h3 className="text-white text-xs font-semibold">Timeline View</h3>
        <p className="text-neutral-500 text-[10px]">Chronological milestone history</p>
      </div>

      <div className="max-h-[600px] overflow-y-auto">
        {groupedEvents.map(([monthKey, monthEvents]) => (
          <div key={monthKey}>
            {/* Month Header */}
            <div className="sticky top-0 px-4 py-2 bg-neutral-900 border-b border-neutral-800 z-10">
              <span className="text-neutral-400 text-[10px] uppercase font-medium">
                {formatMonthHeader(monthKey)}
              </span>
              <span className="text-neutral-600 text-[10px] ml-2">
                ({monthEvents.length} events)
              </span>
            </div>

            {/* Events */}
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-px bg-neutral-800" />

              {monthEvents.map((event, index) => (
                <div
                  key={event.id}
                  className={`relative pl-12 pr-4 py-3 hover:bg-neutral-900/50 transition-colors cursor-pointer ${
                    event.isDriverless ? 'bg-green-500/5' : ''
                  }`}
                  onClick={() => onCityClick?.(event.id.split('-').slice(0, -1).join('-'))}
                >
                  {/* Timeline dot */}
                  <div className={`absolute left-4 top-4 w-4 h-4 rounded-full flex items-center justify-center ${
                    event.isDriverless
                      ? 'bg-green-500 glow-driverless'
                      : 'bg-neutral-800 border border-neutral-700'
                  }`}>
                    <Check className={`w-2.5 h-2.5 ${event.isDriverless ? 'text-white' : 'text-green-400'}`} />
                  </div>

                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-white text-xs font-medium">{event.cityName}</span>
                        <span className="text-neutral-500 text-[10px]">{event.stateAbbr}</span>
                        {event.isDriverless && (
                          <span className="px-1.5 py-0.5 text-[8px] font-semibold bg-green-500/20 text-green-400 rounded">
                            DRIVERLESS
                          </span>
                        )}
                      </div>
                      <p className="text-neutral-400 text-[10px]">{event.milestoneLabel}</p>
                    </div>
                    <span className="text-neutral-500 text-[10px] flex-shrink-0">
                      {formatDate(event.date)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {groupedEvents.length === 0 && (
          <div className="px-4 py-8 text-center text-neutral-500 text-sm">
            No timeline events to display
          </div>
        )}
      </div>
    </div>
  );
}
