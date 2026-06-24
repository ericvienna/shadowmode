'use client';

import type { CityBuzz } from '@/types/x-intel';
import { USMapBase } from '@/components/USMapBase';
import { projectCity } from '@/lib/us-map-projection';

function buzzColor(level: CityBuzz['buzzLevel']) {
  switch (level) {
    case 'hot': return '#ef4444';
    case 'warm': return '#f97316';
    case 'cool': return '#eab308';
    default: return '#6b7280';
  }
}

function buzzSize(count: number) {
  return Math.min(16, Math.max(6, 6 + count * 0.5));
}

function buzzLabel(level: CityBuzz['buzzLevel']) {
  switch (level) {
    case 'hot': return 'text-red-400';
    case 'warm': return 'text-orange-400';
    case 'cool': return 'text-yellow-400';
    default: return 'text-neutral-500';
  }
}

export function CityBuzzMap({ cityBuzz }: { cityBuzz: CityBuzz[] }) {
  const sorted = [...cityBuzz].sort((a, b) => b.engagementScore - a.engagementScore);

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white text-xs font-semibold">City Buzz Heatmap</h3>
        <div className="flex gap-2 text-[8px] text-neutral-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> HOT</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" /> WARM</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" /> COOL</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <div className="relative w-full h-[200px] rounded-lg overflow-hidden shrink-0 bg-[#0b0f13]">
          <USMapBase stateFill="#151b24" stateStroke="#243041">
            {sorted.map((city) => {
              const projected = projectCity(city.cityId);
              if (!projected) return null;
              const size = buzzSize(city.mentionCount);
              const color = buzzColor(city.buzzLevel);
              return (
                <g key={city.cityId} transform={`translate(${projected.x}, ${projected.y})`}>
                  <circle r={size / 2 + 4} fill={color} opacity={0.25} />
                  <circle
                    r={size / 2}
                    fill={color}
                    style={{ filter: `drop-shadow(0 0 ${size}px ${color}88)` }}
                  />
                </g>
              );
            })}
          </USMapBase>
        </div>

        <div className="space-y-1.5 normal-case min-w-0">
          {sorted.slice(0, 8).map((city) => (
            <div key={city.cityId} className="flex items-center gap-2 p-2 rounded-lg bg-neutral-900/50 border border-neutral-800/60">
              <span className={`w-2 h-2 rounded-full shrink-0 ${city.buzzLevel === 'hot' ? 'bg-red-500' : city.buzzLevel === 'warm' ? 'bg-orange-500' : city.buzzLevel === 'cool' ? 'bg-yellow-500' : 'bg-neutral-600'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2">
                  <span className="text-[10px] text-white truncate">{city.cityName}, {city.stateAbbr}</span>
                  <span className={`text-[9px] font-bold shrink-0 ${buzzLabel(city.buzzLevel)}`}>{city.mentionCount}</span>
                </div>
                {city.topSignal && (
                  <p className="text-[9px] text-neutral-500 truncate">{city.topSignal}</p>
                )}
              </div>
            </div>
          ))}
          {sorted.length > 8 && (
            <p className="text-[8px] text-neutral-600 text-center pt-1">+{sorted.length - 8} more cities tracked</p>
          )}
        </div>
      </div>
    </div>
  );
}