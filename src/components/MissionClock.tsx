'use client';

import { useEffect, useState } from 'react';
import type { State } from '@/types/robotaxi';

interface MissionClockProps {
  states: State[];
}

// Austin TX went fully driverless on Jan 22, 2026
const AUSTIN_DRIVERLESS_DATE = new Date('2026-01-22T00:00:00Z');

function getDaysSince(date: Date): number {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

interface CityStatus {
  name: string;
  state: string;
  driverless: boolean;
  date?: string;
  vehicles?: string;
}

export function MissionClock({ states }: MissionClockProps) {
  const [days, setDays] = useState(getDaysSince(AUSTIN_DRIVERLESS_DATE));
  const [tick, setTick] = useState(false);

  // Tick every minute to keep count fresh
  useEffect(() => {
    const interval = setInterval(() => {
      setDays(getDaysSince(AUSTIN_DRIVERLESS_DATE));
      setTick(t => !t);
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Extract city statuses from Supabase data
  const cityStatuses: CityStatus[] = [];
  for (const state of states) {
    for (const city of state.cities) {
      const ms = city.milestones;
      const driverless = ms.no_safety_monitor?.status === 'completed';
      cityStatuses.push({
        name: city.name,
        state: state.abbreviation,
        driverless,
        date: ms.no_safety_monitor?.date ?? undefined,
        vehicles: ms.vehicles_deployed_20_plus?.value ?? undefined,
      });
    }
  }

  const driverlessCities = cityStatuses.filter(c => c.driverless);
  const inProgressCities = cityStatuses.filter(c => !c.driverless && c.vehicles);

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 flex flex-col h-full">
      {/* Label */}
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
          Days Driverless
        </span>
      </div>

      {/* Big number */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="tabular-nums font-black text-white leading-none" style={{ fontSize: 'clamp(72px, 12vw, 120px)' }}>
          {days}
        </div>
        <div className="text-neutral-500 text-xs mt-2 leading-relaxed">
          Since Austin, TX went fully driverless
          <br />
          <span className="text-neutral-600">Jan 22, 2026</span>
        </div>
      </div>

      {/* City pills */}
      <div className="mt-4 pt-4 border-t border-neutral-900">
        <div className="text-[9px] font-bold tracking-widest text-neutral-600 uppercase mb-2">
          Tesla Deployments
        </div>
        <div className="flex flex-wrap gap-1.5">
          {driverlessCities.map(city => (
            <div
              key={city.name}
              className="flex items-center gap-1 px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded-full"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span className="text-[9px] text-red-300 font-medium">{city.name}</span>
              {city.vehicles && (
                <span className="text-[9px] text-red-500/70">{city.vehicles}</span>
              )}
            </div>
          ))}
          {inProgressCities.map(city => (
            <div
              key={city.name}
              className="flex items-center gap-1 px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded-full"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" />
              <span className="text-[9px] text-neutral-400">{city.name}</span>
              {city.vehicles && (
                <span className="text-[9px] text-neutral-600">{city.vehicles}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
