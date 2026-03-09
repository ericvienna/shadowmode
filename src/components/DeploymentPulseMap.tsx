'use client';

import { useEffect, useState, memo, useCallback } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from 'react-simple-maps';
import type { AVDataResponse, AVService } from '@/app/api/av-data/route';

// ── Real lat/lng coordinates for AV deployment cities ────────────────────────
const CITY_COORDS: Record<string, { lat: number; lng: number; label: string }> = {
  // California
  'San Francisco':   { lat: 37.7749,  lng: -122.4194, label: 'SF Area' },
  'Bay Area':        { lat: 37.7749,  lng: -122.4194, label: 'SF Area' },
  'Silicon Valley':  { lat: 37.3861,  lng: -122.0839, label: '' },
  'Stanford':        { lat: 37.4275,  lng: -122.1697, label: '' },
  'Los Angeles':     { lat: 34.0522,  lng: -118.2437, label: 'LA' },
  'San Jose':        { lat: 37.3382,  lng: -121.8863, label: '' },
  'San Ramon':       { lat: 37.7799,  lng: -121.9780, label: '' },
  'San Ramon, CA':   { lat: 37.7799,  lng: -121.9780, label: '' },
  'Walnut Creek':    { lat: 37.9101,  lng: -122.0652, label: '' },
  'Walnut Creek, CA':{ lat: 37.9101,  lng: -122.0652, label: '' },
  'San Diego':       { lat: 32.7157,  lng: -117.1611, label: 'SD' },
  'Oakland':         { lat: 37.8044,  lng: -122.2712, label: '' },
  // Nevada
  'Las Vegas':       { lat: 36.1699,  lng: -115.1398, label: 'LV' },
  // Arizona
  'Phoenix':         { lat: 33.4484,  lng: -112.0740, label: 'Phoenix' },
  'Tempe':           { lat: 33.4255,  lng: -111.9400, label: '' },
  'Chandler':        { lat: 33.3062,  lng: -111.8413, label: '' },
  'Mesa':            { lat: 33.4152,  lng: -111.8315, label: '' },
  'Scottsdale':      { lat: 33.4942,  lng: -111.9261, label: '' },
  // Texas
  'Austin':          { lat: 30.2672,  lng: -97.7431,  label: 'Austin' },
  'Dallas':          { lat: 32.7767,  lng: -96.7970,  label: 'Dallas' },
  'Houston':         { lat: 29.7604,  lng: -95.3698,  label: 'Houston' },
  'San Antonio':     { lat: 29.4241,  lng: -98.4936,  label: 'SA' },
  'Arlington, TX':   { lat: 32.7357,  lng: -97.1081,  label: '' },
  // Colorado
  'Denver':          { lat: 39.7392,  lng: -104.9903, label: 'Denver' },
  // Illinois
  'Chicago':         { lat: 41.8781,  lng: -87.6298,  label: 'Chicago' },
  // Florida
  'Miami':           { lat: 25.7617,  lng: -80.1918,  label: 'Miami' },
  'Tampa':           { lat: 27.9506,  lng: -82.4572,  label: 'Tampa' },
  'Orlando':         { lat: 28.5383,  lng: -81.3792,  label: '' },
  'Jacksonville':    { lat: 30.3322,  lng: -81.6557,  label: '' },
  'Jacksonville, FL':{ lat: 30.3322,  lng: -81.6557,  label: '' },
  'Lake Nona':       { lat: 28.3729,  lng: -81.2426,  label: '' },
  'Lake Nona, FL':   { lat: 28.3729,  lng: -81.2426,  label: '' },
  // Georgia
  'Atlanta':         { lat: 33.7490,  lng: -84.3880,  label: 'Atlanta' },
  'Peachtree Corners':      { lat: 33.9701, lng: -84.2215, label: '' },
  'Peachtree Corners, GA':  { lat: 33.9701, lng: -84.2215, label: '' },
  // Michigan
  'Ann Arbor, MI':   { lat: 42.2808,  lng: -83.7430,  label: '' },
  'Grand Rapids, MI':{ lat: 42.9634,  lng: -85.6681,  label: '' },
  'Grand Rapids, MN':{ lat: 47.2372,  lng: -93.5302,  label: '' },
  'Detroit':         { lat: 42.3314,  lng: -83.0458,  label: '' },
  // Washington
  'Seattle':         { lat: 47.6062,  lng: -122.3321, label: 'Seattle' },
  // Massachusetts
  'Boston':          { lat: 42.3601,  lng: -71.0589,  label: 'Boston' },
  // New York
  'Brooklyn':        { lat: 40.6782,  lng: -73.9442,  label: '' },
  'Queens':          { lat: 40.7282,  lng: -73.7949,  label: '' },
  'New York':        { lat: 40.7128,  lng: -74.0060,  label: 'NYC' },
  // Hawaii
  'Honolulu':        { lat: 21.3069,  lng: -157.8583, label: 'HNL' },
  // DC
  'Washington':      { lat: 38.9072,  lng: -77.0369,  label: 'DC' },
  'Washington, DC':  { lat: 38.9072,  lng: -77.0369,  label: 'DC' },
  // Minnesota
  'Minneapolis':     { lat: 44.9778,  lng: -93.2650,  label: '' },
};

const COMPANY_STYLE: Record<string, {
  fill: string; stroke: string; glow: string; label: string
}> = {
  Tesla:          { fill: '#ef4444', stroke: '#ef4444', glow: 'rgba(239,68,68,0.4)',   label: 'Tesla' },
  Waymo:          { fill: '#3b82f6', stroke: '#3b82f6', glow: 'rgba(59,130,246,0.4)',  label: 'Waymo' },
  Zoox:           { fill: '#14b8a6', stroke: '#14b8a6', glow: 'rgba(20,184,166,0.4)',  label: 'Zoox' },
  WeRide:         { fill: '#a855f7', stroke: '#a855f7', glow: 'rgba(168,85,247,0.4)',  label: 'WeRide' },
  'Apollo Go':    { fill: '#f97316', stroke: '#f97316', glow: 'rgba(249,115,22,0.4)',  label: 'Apollo' },
  'May Mobility': { fill: '#22c55e', stroke: '#22c55e', glow: 'rgba(34,197,94,0.4)',   label: 'May' },
  Avride:         { fill: '#eab308', stroke: '#eab308', glow: 'rgba(234,179,8,0.4)',   label: 'Avride' },
};
const DEFAULT_STYLE = { fill: '#737373', stroke: '#737373', glow: 'rgba(115,115,115,0.3)', label: '?' };

// TopoJSON US atlas — hosted by react-simple-maps
const GEO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

interface Dot {
  key: string;
  coordinates: [number, number]; // [lng, lat]
  company: string;
  city: string;
  autonomous: boolean;
  label: string;
  style: typeof DEFAULT_STYLE;
  offset: number;
}

// Memoized geography layer to prevent re-renders
const MapGeographies = memo(function MapGeographies() {
  return (
    <Geographies geography={GEO_URL}>
      {({ geographies }) =>
        geographies.map((geo) => (
          <Geography
            key={geo.rpiId ?? geo.id ?? geo.properties?.name}
            geography={geo}
            fill="#151515"
            stroke="#2a2a2a"
            strokeWidth={0.5}
            style={{
              default: { outline: 'none' },
              hover: { outline: 'none', fill: '#1c1c1c' },
              pressed: { outline: 'none' },
            }}
          />
        ))
      }
    </Geographies>
  );
});

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

        // Group services by city
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

          const n = svcs.length;
          svcs.forEach((svc, i) => {
            // Spread multiple companies at the same city
            const angle = n === 1 ? 0 : (i / n) * Math.PI * 2;
            const spread = n === 1 ? 0 : 1.2; // degrees offset
            newDots.push({
              key: `${svc.company}-${city}`,
              coordinates: [
                coords.lng + Math.cos(angle) * spread,
                coords.lat + Math.sin(angle) * spread,
              ],
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

  const handleMouseEnter = useCallback((dot: Dot, e: React.MouseEvent) => {
    setTooltip({ dot, mx: e.clientX, my: e.clientY });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  const companies = [...new Set(dots.map(d => d.company))].slice(0, 7);

  // Track which labels have been rendered to avoid duplicates
  const renderedLabels = new Set<string>();

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

      {/* Map */}
      <div className="flex-1 relative min-h-0">
        <ComposableMap
          projection="geoAlbersUsa"
          projectionConfig={{
            scale: 1000,
          }}
          className="w-full h-full"
          style={{ width: '100%', height: '100%' }}
        >
          <MapGeographies />

          {/* City markers */}
          {dots.map(dot => {
            const showLabel = dot.label && !renderedLabels.has(dot.label);
            if (showLabel) renderedLabels.add(dot.label);

            return (
              <Marker
                key={dot.key}
                coordinates={dot.coordinates}
                onMouseEnter={(e) => handleMouseEnter(dot, e as unknown as React.MouseEvent)}
                onMouseLeave={handleMouseLeave}
                className="cursor-pointer"
              >
                {/* Outer pulse ring — autonomous only */}
                {dot.autonomous && (
                  <circle
                    r={10}
                    fill="none"
                    stroke={dot.style.stroke}
                    strokeWidth={1}
                    strokeOpacity={0.5}
                    style={{
                      animation: `pulse-ring 2s ease-out ${dot.offset}s infinite`,
                    }}
                  />
                )}
                {/* Glow */}
                <circle r={6} fill={dot.style.glow} />
                {/* Core dot */}
                <circle
                  r={3.5}
                  fill={dot.style.fill}
                  style={dot.autonomous ? {
                    animation: `dot-breathe 2s ease-in-out ${dot.offset}s infinite`,
                  } : undefined}
                />
                {/* City label */}
                {showLabel && (
                  <text
                    x={8}
                    y={4}
                    fill="#525252"
                    fontSize={9}
                    fontFamily="monospace"
                    fontWeight={500}
                  >
                    {dot.label}
                  </text>
                )}
              </Marker>
            );
          })}
        </ComposableMap>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="pointer-events-none fixed z-50 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-[10px] shadow-xl"
            style={{ left: tooltip.mx + 12, top: tooltip.my - 40 }}
          >
            <div className="font-bold text-white">{tooltip.dot.company}</div>
            <div className="text-neutral-400">{tooltip.dot.city}</div>
            <div className={tooltip.dot.autonomous ? 'text-green-400' : 'text-yellow-400'}>
              {tooltip.dot.autonomous ? 'Autonomous' : 'Safety Driver'}
            </div>
          </div>
        )}

        {/* Animations */}
        <style>{`
          @keyframes pulse-ring {
            0%   { r: 5;  stroke-opacity: 0.6; }
            100% { r: 18; stroke-opacity: 0; }
          }
          @keyframes dot-breathe {
            0%, 100% { r: 3.5; }
            50%       { r: 5; }
          }
        `}</style>
      </div>
    </div>
  );
}
