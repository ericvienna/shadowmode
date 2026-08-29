'use client';

import { useMemo, useState } from 'react';
import type { State } from '@/types/robotaxi';
import { USMapBase } from '@/components/USMapBase';
import { buildMapCityPoints, markerColor, markerSize } from '@/lib/us-map-layout';
import { MAP_VIEWBOX, projectCity } from '@/lib/us-map-projection';

import { hasServiceAreaData } from '@/lib/service-area-projection';

interface DeploymentPulseMapProps {
  /** Fires only for cities we hold boundaries for. Optional — the map works without it. */
  onCityClick?: (cityName: string) => void;
  states: State[];
}

export function DeploymentPulseMap({ states, onCityClick }: DeploymentPulseMapProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const cities = useMemo(() => buildMapCityPoints(states), [states]);

  const activeCount = cities.filter((c) => c.progress > 0).length;
  const driverlessCount = cities.filter((c) => c.driverless || c.testing).length;

  return (
    <div className="flex h-full min-h-[360px] flex-col overflow-hidden rounded-xl border border-neutral-800 bg-[#0b0f13]">
      <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-3 shrink-0">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.32em] text-neutral-500">
            US Robotaxi Map
          </div>
          <div className="mt-1 text-[11px] text-neutral-600 normal-case">
            Shadowmode deployment pulse · self-hosted SVG
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.28em] text-neutral-700">Shadowmode</div>
          <div className="mt-1 text-[11px] text-neutral-500">
            {cities.length} cities · {driverlessCount} driverless/testing
          </div>
        </div>
      </div>

      <div className="relative flex-1 min-h-[280px]">
        <USMapBase showGrid overlay={
          <>
            <div className="pointer-events-none absolute inset-0 bg-[#0b0f13]/25" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0b0f13] via-transparent to-[#0b0f13] opacity-60" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0b0f13]/70 via-transparent to-[#0b0f13]" />
            <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.85)]" />
            <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-25">
              <div
                className="absolute left-1/2 top-1/2 h-[140%] w-[140%] -translate-x-1/2 -translate-y-1/2 animate-radar-sweep"
                style={{
                  background: 'conic-gradient(from 0deg, transparent 0deg, rgba(34,211,238,0.18) 28deg, transparent 56deg)',
                }}
              />
            </div>
          </>
        }>
          {cities.map(({ city, state, progress, driverless, testing }) => {
            const projected = projectCity(city.id);
            if (!projected) return null;
            // Gate the affordance on real data: a dot that looks clickable and opens
            // an empty panel is worse than one that does nothing.
            const hasAreas = hasServiceAreaData(city.name);
            const color = markerColor(progress, driverless, testing);
            const size = markerSize(progress, driverless, testing);
            const pulse = driverless || testing || progress >= 50;

            return (
              <g
                key={city.id}
                transform={`translate(${projected.x}, ${projected.y})`}
                onMouseEnter={() => setHoveredId(city.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={hasAreas ? () => onCityClick?.(city.name) : undefined}
                role={hasAreas ? 'button' : undefined}
                aria-label={hasAreas ? `Show ${city.name} service areas` : undefined}
                style={{ cursor: hasAreas ? 'pointer' : 'default' }}
              >
                {pulse && (
                  <circle r={(size + 18) / 2} fill={color} opacity={0.25}>
                    <animate attributeName="r" values={`${size / 2};${(size + 18) / 2};${size / 2}`} dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.35;0;0.35" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle r={(size + 10) / 2} fill={color} opacity={0.4} />
                <circle
                  r={size / 2}
                  fill={color}
                  stroke="rgba(255,255,255,0.45)"
                  strokeWidth={1}
                  style={{ filter: `drop-shadow(0 0 6px ${color})` }}
                />
                {(driverless || testing) && (
                  <text
                    y={-size}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.9)"
                    fontSize={7}
                    fontWeight={700}
                    letterSpacing="0.08em"
                  >
                    {driverless ? 'DL' : 'TEST'}
                  </text>
                )}
              </g>
            );
          })}
        </USMapBase>

        {cities.map(({ city, state, progress, driverless, testing }) => {
          if (hoveredId !== city.id) return null;
          const projected = projectCity(city.id);
          if (!projected) return null;
          const left = (projected.x / MAP_VIEWBOX.width) * 100;
          const top = (projected.y / MAP_VIEWBOX.height) * 100;

          return (
            <div
              key={`tip-${city.id}`}
              className="pointer-events-none absolute z-20 -translate-x-1/2 whitespace-nowrap rounded border border-neutral-700 bg-black/95 px-2.5 py-1.5 text-[10px] shadow-xl normal-case"
              style={{ left: `${left}%`, top: `${top}%`, transform: 'translate(-50%, calc(-100% - 10px))' }}
            >
              <div className="font-medium text-white">{city.name}, {state.abbreviation}</div>
              <div className="text-neutral-400">{progress}% · {driverless ? 'driverless' : testing ? 'testing' : 'tracking'}</div>
            </div>
          );
        })}

        <div className="absolute bottom-3 left-3 rounded-lg border border-neutral-800/80 bg-black/60 px-3 py-2 backdrop-blur-sm">
          <p className="text-[8px] uppercase tracking-widest text-neutral-600">Active markets</p>
          <p className="text-sm font-bold text-white">{activeCount}<span className="text-neutral-600 text-[10px]">/{cities.length}</span></p>
        </div>
        <div className="absolute bottom-3 right-3 rounded-lg border border-neutral-800/80 bg-black/60 px-3 py-2 backdrop-blur-sm text-right">
          <p className="text-[8px] uppercase tracking-widest text-neutral-600">Pulse status</p>
          <p className="text-sm font-bold text-cyan-400">LIVE</p>
        </div>
      </div>

      <div className="shrink-0 border-t border-neutral-800 bg-[#080a0d] px-3 py-2">
        <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-thin">
          {cities.slice(0, 10).map(({ city, state, progress, driverless, testing }) => (
            <div
              key={`strip-${city.id}`}
              className="flex shrink-0 items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/60 px-2.5 py-1.5"
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: markerColor(progress, driverless, testing) }}
              />
              <span className="text-[9px] text-neutral-300 whitespace-nowrap">{city.name}</span>
              <span className="text-[9px] font-bold text-neutral-500">{progress}%</span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-[8px] text-neutral-600">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" /> Driverless</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-yellow-400" /> Testing</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-400" /> Tracking</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-orange-500" /> 25%+</span>
        </div>
      </div>
    </div>
  );
}