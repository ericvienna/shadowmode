'use client';

import { useEffect, useState } from 'react';
import type { AVDataResponse, AVService } from '@/app/api/av-data/route';

// Approximate SVG coordinates for US cities
// Mapped to a 1000x620 viewBox of continental US
const CITY_COORDS: Record<string, { x: number; y: number; label: string }> = {
  // California
  'San Francisco': { x: 82,  y: 290, label: 'SF' },
  'Bay Area':      { x: 82,  y: 290, label: 'Bay Area' },
  'Los Angeles':   { x: 110, y: 375, label: 'LA' },
  'San Jose':      { x: 85,  y: 305, label: 'SJ' },
  'San Ramon':     { x: 87,  y: 295, label: '' },
  'Walnut Creek':  { x: 88,  y: 292, label: '' },

  // Nevada
  'Las Vegas':     { x: 150, y: 348, label: 'LV' },

  // Arizona
  'Phoenix':       { x: 185, y: 395, label: 'Phoenix' },
  'Tempe':         { x: 188, y: 398, label: '' },
  'Chandler':      { x: 190, y: 400, label: '' },

  // Texas
  'Austin':        { x: 430, y: 438, label: 'Austin' },
  'Dallas':        { x: 458, y: 402, label: 'Dallas' },
  'Houston':       { x: 490, y: 460, label: 'Houston' },
  'San Antonio':   { x: 418, y: 465, label: 'SA' },

  // Colorado
  'Denver':        { x: 302, y: 268, label: 'Denver' },

  // Illinois
  'Chicago':       { x: 602, y: 230, label: 'Chicago' },

  // Florida
  'Miami':         { x: 760, y: 522, label: 'Miami' },
  'Tampa':         { x: 720, y: 490, label: 'Tampa' },
  'Orlando':       { x: 735, y: 470, label: '' },
  'Jacksonville':  { x: 748, y: 428, label: '' },
  'Lake Nona':     { x: 738, y: 472, label: '' },

  // Georgia
  'Atlanta':       { x: 673, y: 378, label: 'Atlanta' },
  'Peachtree Corners': { x: 676, y: 372, label: '' },

  // Virginia / DC area
  'Arlington, TX': { x: 460, y: 403, label: '' },

  // Michigan
  'Ann Arbor, MI': { x: 640, y: 210, label: '' },
  'Grand Rapids, MI': { x: 617, y: 197, label: '' },

  // Hawaii
  'Honolulu':      { x: 120, y: 540, label: 'HNL' },

  // Default fallback for unknown cities
};

const COMPANY_STYLE: Record<string, {
  fill: string; stroke: string; glow: string; label: string
}> = {
  Tesla:       { fill: '#ef4444', stroke: '#ef4444', glow: 'rgba(239,68,68,0.4)',   label: 'Tesla' },
  Waymo:       { fill: '#3b82f6', stroke: '#3b82f6', glow: 'rgba(59,130,246,0.4)',  label: 'Waymo' },
  Zoox:        { fill: '#14b8a6', stroke: '#14b8a6', glow: 'rgba(20,184,166,0.4)',  label: 'Zoox' },
  WeRide:      { fill: '#a855f7', stroke: '#a855f7', glow: 'rgba(168,85,247,0.4)',  label: 'WeRide' },
  'Apollo Go': { fill: '#f97316', stroke: '#f97316', glow: 'rgba(249,115,22,0.4)',  label: 'Apollo' },
  'May Mobility': { fill: '#22c55e', stroke: '#22c55e', glow: 'rgba(34,197,94,0.4)', label: 'May' },
  Avride:      { fill: '#eab308', stroke: '#eab308', glow: 'rgba(234,179,8,0.4)',   label: 'Avride' },
};
const DEFAULT_STYLE = { fill: '#737373', stroke: '#737373', glow: 'rgba(115,115,115,0.3)', label: '?' };

interface Dot {
  key: string;
  x: number;
  y: number;
  company: string;
  city: string;
  autonomous: boolean;
  label: string;
  style: typeof DEFAULT_STYLE;
  offset: number; // stagger offset for pulse animation
}

export function DeploymentPulseMap() {
  const [dots, setDots] = useState<Dot[]>([]);
  const [tooltip, setTooltip] = useState<{ dot: Dot; mx: number; my: number } | null>(null);
  const [lastFetched, setLastFetched] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/av-data');
        if (!res.ok) return;
        const data: AVDataResponse = await res.json();
        setLastFetched(data.lastFetched);

        // Group services by city — multiple companies per city
        const cityMap = new Map<string, AVService[]>();
        for (const svc of data.allServices) {
          const k = svc.city;
          if (!cityMap.has(k)) cityMap.set(k, []);
          cityMap.get(k)!.push(svc);
        }

        const newDots: Dot[] = [];
        let idx = 0;
        for (const [city, svcs] of cityMap) {
          const coords = CITY_COORDS[city];
          if (!coords) continue;

          // Spread multiple companies at the same city with small offsets
          const n = svcs.length;
          svcs.forEach((svc, i) => {
            const angle = n === 1 ? 0 : (i / n) * Math.PI * 2;
            const spread = n === 1 ? 0 : 8;
            newDots.push({
              key: `${svc.company}-${city}`,
              x: coords.x + Math.cos(angle) * spread,
              y: coords.y + Math.sin(angle) * spread,
              company: svc.company,
              city,
              autonomous: svc.supervision === 'Autonomous',
              label: coords.label,
              style: COMPANY_STYLE[svc.company] ?? DEFAULT_STYLE,
              offset: (idx++ * 0.4) % 3,
            });
          });
        }

        setDots(newDots);
      } catch (e) {
        console.error('[DeploymentPulseMap]', e);
      }
    }

    load();
  }, []);

  const companies = [...new Set(dots.map(d => d.company))].slice(0, 6);

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
            AV Deployment Map
          </span>
          <span className="text-[9px] text-neutral-700">US Only</span>
        </div>
        {lastFetched && (
          <span className="text-[8px] text-neutral-700">
            Updated {new Date(lastFetched).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3 flex-shrink-0">
        {companies.map(company => {
          const s = COMPANY_STYLE[company] ?? DEFAULT_STYLE;
          return (
            <div key={company} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.fill }} />
              <span className="text-[9px] text-neutral-500">{s.label}</span>
            </div>
          );
        })}
        <div className="flex items-center gap-1 ml-2">
          <span className="w-3 h-3 rounded-full border-2 border-white/30 flex-shrink-0" />
          <span className="text-[9px] text-neutral-600">pulse = autonomous</span>
        </div>
      </div>

      {/* SVG Map */}
      <div className="flex-1 relative min-h-0">
        <svg
          viewBox="0 0 1000 620"
          className="w-full h-full"
          style={{ filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.5))' }}
        >
          {/* Simple US state outlines — stylized block */}
          <rect x="0" y="0" width="1000" height="620" fill="transparent" />

          {/* Base US shape — rough silhouette using polygon */}
          <polygon
            points="70,120 85,80 180,60 320,55 500,48 680,52 820,60 920,90 970,140 980,200 960,260 900,300 850,340 800,380 780,430 760,500 730,550 700,580 650,600 580,610 500,615 400,610 300,600 220,580 180,560 140,540 120,510 90,460 70,400 60,330 55,260 60,190 70,120"
            fill="#111111"
            stroke="#222222"
            strokeWidth="1.5"
          />

          {/* Gulf of Mexico + Atlantic rough coastline additions */}
          <polygon
            points="700,580 730,570 760,530 780,500 800,480 800,450 810,440 780,430 760,500 730,550 700,580"
            fill="#0a0a0a"
            stroke="#1a1a1a"
            strokeWidth="1"
          />

          {/* Grid lines */}
          {[200, 400, 600, 800].map(x => (
            <line key={`vg-${x}`} x1={x} y1="50" x2={x} y2="590" stroke="#1a1a1a" strokeWidth="0.5" strokeDasharray="4,8" />
          ))}
          {[150, 300, 450].map(y => (
            <line key={`hg-${y}`} x1="60" y1={y} x2="970" y2={y} stroke="#1a1a1a" strokeWidth="0.5" strokeDasharray="4,8" />
          ))}

          {/* Dots */}
          {dots.map(dot => (
            <g
              key={dot.key}
              style={{ cursor: 'pointer' }}
              onMouseEnter={e => setTooltip({ dot, mx: e.clientX, my: e.clientY })}
              onMouseLeave={() => setTooltip(null)}
            >
              {/* Outer pulse ring — only for autonomous */}
              {dot.autonomous && (
                <circle
                  cx={dot.x}
                  cy={dot.y}
                  r="12"
                  fill="none"
                  stroke={dot.style.stroke}
                  strokeWidth="1"
                  strokeOpacity="0.5"
                  style={{
                    transformOrigin: `${dot.x}px ${dot.y}px`,
                    animation: `pulse-ring 2s ease-out ${dot.offset}s infinite`,
                  }}
                />
              )}
              {/* Glow */}
              <circle
                cx={dot.x}
                cy={dot.y}
                r="7"
                fill={dot.style.glow}
              />
              {/* Core dot */}
              <circle
                cx={dot.x}
                cy={dot.y}
                r="4"
                fill={dot.style.fill}
                style={dot.autonomous ? {
                  transformOrigin: `${dot.x}px ${dot.y}px`,
                  animation: `dot-breathe 2s ease-in-out ${dot.offset}s infinite`,
                } : undefined}
              />
              {/* City label */}
              {dot.label && (
                <text
                  x={dot.x + 7}
                  y={dot.y + 4}
                  fill="#737373"
                  fontSize="8"
                  fontFamily="monospace"
                >
                  {dot.label}
                </text>
              )}
            </g>
          ))}

          {/* Pulse ring animation defs */}
          <defs>
            <style>{`
              @keyframes pulse-ring {
                0%   { r: 6;  stroke-opacity: 0.6; }
                100% { r: 22; stroke-opacity: 0; }
              }
              @keyframes dot-breathe {
                0%, 100% { r: 4; }
                50%       { r: 5.5; }
              }
            `}</style>
          </defs>
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="pointer-events-none fixed z-50 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-[10px]"
            style={{ left: tooltip.mx + 12, top: tooltip.my - 40 }}
          >
            <div className="font-bold text-white">{tooltip.dot.company}</div>
            <div className="text-neutral-400">{tooltip.dot.city}</div>
            <div className={tooltip.dot.autonomous ? 'text-green-400' : 'text-yellow-400'}>
              {tooltip.dot.autonomous ? 'Autonomous' : 'Safety Driver'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
