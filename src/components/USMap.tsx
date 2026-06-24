'use client';

import { useState } from 'react';
import type { State, City } from '@/types/robotaxi';
import { getCityProgress } from '@/lib/utils';
import { USMapBase } from '@/components/USMapBase';
import { markerColor as sharedMarkerColor } from '@/lib/us-map-layout';
import { MAP_VIEWBOX, projectCity } from '@/lib/us-map-projection';

interface USMapProps {
  states: State[];
  onCityClick?: (city: City, state: State) => void;
}

export function USMap({ states, onCityClick }: USMapProps) {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);

  const allCities: Array<{ city: City; state: State }> = [];
  states.forEach((state) => {
    state.cities.forEach((city) => {
      if (projectCity(city.id)) allCities.push({ city, state });
    });
  });

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 overflow-hidden">
      <h3 className="text-white text-xs font-semibold mb-4">Deployment Map</h3>

      <div className="relative w-full aspect-[1.6/1] rounded-lg overflow-hidden bg-[#0b0f13]">
        <USMapBase
          overlay={
            <>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-neutral-950 via-transparent to-neutral-950 opacity-50" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-neutral-950 via-transparent to-neutral-950 opacity-50" />
              <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />
            </>
          }
        >
          {allCities.map(({ city, state }) => {
            const projected = projectCity(city.id);
            if (!projected) return null;
            const progress = getCityProgress(city);
            const hasDriverless = city.milestones.no_safety_monitor.status === 'completed';
            const testing = city.milestones.no_safety_monitor.status === 'in_progress';
            const color = sharedMarkerColor(progress, hasDriverless, testing);
            const size = hasDriverless ? 14 : 10;

            return (
              <g
                key={city.id}
                transform={`translate(${projected.x}, ${projected.y})`}
                onMouseEnter={() => setHoveredCity(city.id)}
                onMouseLeave={() => setHoveredCity(null)}
                onClick={() => onCityClick?.(city, state)}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  r={(size + 16) / 2}
                  fill={color}
                  opacity={hasDriverless ? 0.35 : 0.2}
                  className={hasDriverless ? 'animate-pulse' : undefined}
                />
                <circle
                  r={size / 2}
                  fill={color}
                  stroke="rgba(0,0,0,0.5)"
                  strokeWidth={1}
                  style={{ filter: `drop-shadow(0 0 8px ${color})` }}
                />
                <circle r={size / 6} cx={size / 5} cy={-size / 5} fill="rgba(255,255,255,0.35)" />
              </g>
            );
          })}
        </USMapBase>

        {allCities.map(({ city, state }) => {
          if (hoveredCity !== city.id) return null;
          const projected = projectCity(city.id);
          if (!projected) return null;
          const progress = getCityProgress(city);
          const hasDriverless = city.milestones.no_safety_monitor.status === 'completed';
          const left = (projected.x / MAP_VIEWBOX.width) * 100;
          const top = (projected.y / MAP_VIEWBOX.height) * 100;

          return (
            <div
              key={`tooltip-${city.id}`}
              className="absolute z-50 px-2 py-1.5 bg-black/95 border border-neutral-700 rounded text-[10px] whitespace-nowrap pointer-events-none shadow-xl"
              style={{ left: `${left}%`, top: `${top}%`, transform: 'translate(-50%, calc(-100% - 12px))' }}
            >
              <div className="text-white font-medium">{city.name}, {state.abbreviation}</div>
              <div className="text-neutral-400">{progress}% complete</div>
              {hasDriverless && <div className="text-green-400 font-semibold">DRIVERLESS</div>}
              <div className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-neutral-700" />
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-4 mt-3 text-[9px]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
          <span className="text-neutral-400">Driverless</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <span className="text-neutral-400">50%+</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          <span className="text-neutral-400">25%+</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-neutral-500" />
          <span className="text-neutral-400">Early</span>
        </div>
      </div>
    </div>
  );
}