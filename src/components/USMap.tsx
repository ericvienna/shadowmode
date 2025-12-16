'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { State, City } from '@/types/robotaxi';
import { getCityProgress } from '@/lib/utils';

interface USMapProps {
  states: State[];
  onCityClick?: (city: City, state: State) => void;
}

// City coordinates as percentages of the map image
// Shifted right ~5% to align with actual city locations
const CITY_COORDINATES: Record<string, { x: number; y: number }> = {
  // California - on the coast
  'ca-sf': { x: 8, y: 38 },
  'ca-oak': { x: 9, y: 40 },
  'ca-sj': { x: 9, y: 44 },
  'ca-la': { x: 12, y: 56 },
  'ca-sd': { x: 14, y: 62 },
  // Nevada
  'nv-vegas': { x: 18, y: 50 },
  // Arizona
  'az-phoenix': { x: 24, y: 58 },
  'az-mesa-tempe': { x: 25, y: 60 },
  // Texas
  'tx-austin': { x: 50, y: 68 },
  'tx-dallas': { x: 53, y: 60 },
  'tx-houston': { x: 57, y: 70 },
  'tx-san-antonio': { x: 48, y: 72 },
  // Colorado
  'co-denver': { x: 36, y: 36 },
  // Illinois
  'il-chicago': { x: 68, y: 30 },
  // Florida
  'fl-miami': { x: 87, y: 84 },
  'fl-tampa': { x: 84, y: 76 },
  'fl-orlando': { x: 85, y: 72 },
  'fl-jacksonville': { x: 83, y: 64 },
  // Other cities - shifted down from Canada
  'ma-boston': { x: 94, y: 28 },
  'ny-brooklyn': { x: 92, y: 34 },
  'ny-queens': { x: 92, y: 32 },
};

export function USMap({ states, onCityClick }: USMapProps) {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);

  const getProgressColor = (progress: number, hasDriverless: boolean) => {
    if (hasDriverless) return '#22c55e';
    if (progress >= 75) return '#22c55e';
    if (progress >= 50) return '#eab308';
    if (progress >= 25) return '#f97316';
    return '#6b7280';
  };

  const allCities: Array<{ city: City; state: State; coords: { x: number; y: number } }> = [];

  states.forEach(state => {
    state.cities.forEach(city => {
      const coords = CITY_COORDINATES[city.id];
      if (coords) {
        allCities.push({ city, state, coords });
      }
    });
  });

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 overflow-hidden">
      <h3 className="text-white text-xs font-semibold mb-4">Deployment Map</h3>

      <div className="relative w-full aspect-[1.8/1] rounded-lg overflow-hidden">
        {/* Map background image */}
        <div className="absolute inset-0 scale-100 origin-center">
          <Image
            src="/map.webp"
            alt="US Map"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Gradient overlays for edge expansion effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-transparent to-neutral-950 opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-transparent to-neutral-950 opacity-60" />

        {/* Vignette effect */}
        <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />

        {/* City markers */}
        {allCities.map(({ city, state, coords }) => {
          const progress = getCityProgress(city);
          const hasDriverless = city.milestones.no_safety_monitor.status === 'completed';
          const color = getProgressColor(progress, hasDriverless);
          const isHovered = hoveredCity === city.id;
          const size = hasDriverless ? 14 : 10;

          return (
            <div
              key={city.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{
                left: `${coords.x}%`,
                top: `${coords.y}%`,
              }}
              onMouseEnter={() => setHoveredCity(city.id)}
              onMouseLeave={() => setHoveredCity(null)}
              onClick={() => onCityClick?.(city, state)}
            >
              {/* Glow effect */}
              <div
                className={`absolute rounded-full ${hasDriverless ? 'animate-pulse' : ''}`}
                style={{
                  width: size + 16,
                  height: size + 16,
                  left: -(size + 16) / 2 + size / 2,
                  top: -(size + 16) / 2 + size / 2,
                  backgroundColor: color,
                  opacity: hasDriverless ? 0.4 : 0.2,
                  filter: 'blur(6px)',
                }}
              />
              {/* Main dot */}
              <div
                className="rounded-full border border-black/50 shadow-lg"
                style={{
                  width: size,
                  height: size,
                  backgroundColor: color,
                  boxShadow: `0 0 10px ${color}`,
                }}
              />
              {/* Inner highlight */}
              <div
                className="absolute rounded-full bg-white/30"
                style={{
                  width: size / 3,
                  height: size / 3,
                  left: size / 5,
                  top: size / 5,
                }}
              />
            </div>
          );
        })}

        {/* Hover tooltips */}
        {allCities.map(({ city, state, coords }) => {
          const progress = getCityProgress(city);
          const hasDriverless = city.milestones.no_safety_monitor.status === 'completed';
          const isHovered = hoveredCity === city.id;

          if (!isHovered) return null;

          return (
            <div
              key={`tooltip-${city.id}`}
              className="absolute px-2 py-1.5 bg-black/95 border border-neutral-700 rounded text-[10px] whitespace-nowrap z-50 pointer-events-none shadow-xl"
              style={{
                left: `${coords.x}%`,
                top: `${coords.y}%`,
                transform: 'translate(-50%, -140%)',
              }}
            >
              <div className="text-white font-medium">{city.name}, {state.abbreviation}</div>
              <div className="text-neutral-400">{progress}% complete</div>
              {hasDriverless && (
                <div className="text-green-400 font-semibold">DRIVERLESS</div>
              )}
              {/* Tooltip arrow */}
              <div className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-neutral-700" />
            </div>
          );
        })}
      </div>

      {/* Legend */}
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
