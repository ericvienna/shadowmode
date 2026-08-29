'use client';

import { useMemo, useState } from 'react';
import {
  SERVICE_AREA_VIEWBOX,
  SERVICE_AREA_SOURCE,
  getContestedCities,
  projectCity,
  type Provider,
} from '@/lib/service-area-projection';

/**
 * Robotaxi service-area comparison.
 *
 * Renders every operator present in a city through ONE shared projection, so the shapes
 * are comparable by area rather than each filling its own frame. See projectTogether().
 *
 * TONE: neutral by construction. Operators are drawn from the same palette logic and
 * labelled by name only. No ranking language, no scoreboard, no editorial. The reader
 * draws the conclusion — which is also the only defensible posture for a public page.
 */

const PROVIDER_STYLE: Record<Provider, { stroke: string; fill: string; label: string }> = {
  tesla: { stroke: '#e11d48', fill: 'rgba(225,29,72,0.16)', label: 'Tesla' },
  waymo: { stroke: '#3b82f6', fill: 'rgba(59,130,246,0.14)', label: 'Waymo' },
  zoox:  { stroke: '#a855f7', fill: 'rgba(168,85,247,0.14)', label: 'Zoox' },
};

export function ServiceAreaMap({ initialCity }: { initialCity?: string }) {
  const cities = useMemo(() => getContestedCities(), []);
  const [city, setCity] = useState(initialCity ?? cities[0]?.city ?? '');

  const { paths } = useMemo(() => projectCity(city), [city]);
  const active = cities.find((c) => c.city === city);

  const asOf = useMemo(() => {
    const d = new Date(SERVICE_AREA_SOURCE.generatedAt);
    return isNaN(d.getTime()) ? 'date unknown' : d.toISOString().slice(0, 10);
  }, []);

  return (
    <section className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-neutral-100">Service areas</h3>
          <p className="text-[11px] text-neutral-500">
            Operators active in the same metro, drawn to the same scale
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          {cities.map((c) => (
            <button
              key={c.city}
              onClick={() => setCity(c.city)}
              className={`rounded px-2 py-1 text-[11px] transition ${
                c.city === city
                  ? 'bg-neutral-100 text-neutral-900'
                  : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${SERVICE_AREA_VIEWBOX.width} ${SERVICE_AREA_VIEWBOX.height}`}
        className="w-full"
        role="img"
        aria-label={`Robotaxi service areas in ${active?.name ?? city}, drawn to a common scale`}
      >
        {paths.map((p) => {
          const s = PROVIDER_STYLE[p.provider];
          return (
            <path
              key={`${p.provider}-${p.slug}`}
              d={p.d}
              fill={s.fill}
              stroke={s.stroke}
              strokeWidth={1.5}
              strokeLinejoin="round"
            />
          );
        })}
      </svg>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {paths.map((p) => (
          <span key={`k-${p.provider}`} className="flex items-center gap-1.5 text-[11px] text-neutral-300">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ background: PROVIDER_STYLE[p.provider].fill, border: `1px solid ${PROVIDER_STYLE[p.provider].stroke}` }}
            />
            {PROVIDER_STYLE[p.provider].label}
          </span>
        ))}
      </div>

      {/* 🔴 REQUIRED, NOT DECORATIVE. These are community traces of boundaries Tesla has
          never published, and this page is linked publicly. The source and the as-of ship
          on the surface the reader sees, and the date is DERIVED from the bundle so it
          cannot drift out of sync with the data. */}
      <p className="mt-3 border-t border-neutral-900 pt-2 text-[10px] leading-relaxed text-neutral-500">
        Boundaries are community-maintained approximations, not operator-published data.
        Source:{' '}
        <a href={SERVICE_AREA_SOURCE.repo} className="underline hover:text-neutral-300" rel="noopener noreferrer" target="_blank">
          Robotaxi-Tracker/robotaxi-service-areas
        </a>{' '}
        ({SERVICE_AREA_SOURCE.license}) · data as of {asOf}
      </p>
    </section>
  );
}
