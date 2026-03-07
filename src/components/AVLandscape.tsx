'use client';

import { useEffect, useState } from 'react';
import type { AVDataResponse, CompanyStats, AVService } from '@/app/api/av-data/route';

// ── helpers ─────────────────────────────────────────────────────────────────

const COMPANY_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  Tesla:      { bg: 'bg-red-500/10',     border: 'border-red-500/30',     text: 'text-red-400',     dot: 'bg-red-500' },
  Waymo:      { bg: 'bg-blue-500/10',    border: 'border-blue-500/30',    text: 'text-blue-400',    dot: 'bg-blue-500' },
  Zoox:       { bg: 'bg-teal-500/10',    border: 'border-teal-500/30',    text: 'text-teal-400',    dot: 'bg-teal-500' },
  WeRide:     { bg: 'bg-purple-500/10',  border: 'border-purple-500/30',  text: 'text-purple-400',  dot: 'bg-purple-500' },
  'Apollo Go':{ bg: 'bg-orange-500/10',  border: 'border-orange-500/30',  text: 'text-orange-400',  dot: 'bg-orange-500' },
  'May Mobility': { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400',  dot: 'bg-green-500' },
  Avride:     { bg: 'bg-yellow-500/10',  border: 'border-yellow-500/30',  text: 'text-yellow-400',  dot: 'bg-yellow-400' },
};
const DEFAULT_COLOR = { bg: 'bg-neutral-800/40', border: 'border-neutral-700', text: 'text-neutral-400', dot: 'bg-neutral-500' };
const color = (name: string) => COMPANY_COLORS[name] ?? DEFAULT_COLOR;

const SUPERVISION_COLOR: Record<string, string> = {
  Autonomous:       'text-green-400 bg-green-500/10 border-green-500/30',
  'Safety Driver':  'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  'Safety Attendant':'text-orange-400 bg-orange-500/10 border-orange-500/30',
};
const supColor = (s: string) => SUPERVISION_COLOR[s] ?? 'text-neutral-400 bg-neutral-800 border-neutral-700';

const ACCESS_COLOR: Record<string, string> = {
  Public:   'text-green-300',
  Waitlist: 'text-yellow-400',
  Testing:  'text-neutral-400',
};
const accColor = (a: string) => ACCESS_COLOR[a] ?? 'text-neutral-500';

// ── Tesla vs Waymo head-to-head ──────────────────────────────────────────────

function HeadToHead({ tesla, waymo }: { tesla: CompanyStats | undefined; waymo: CompanyStats | undefined }) {
  const rows = [
    { label: 'US cities',        t: tesla?.usOnlyCities ?? 0,    w: waymo?.usOnlyCities ?? 0,   fmt: (v: number) => `${v}` },
    { label: 'Fully driverless', t: tesla?.services.filter(s => s.supervision === 'Autonomous').length ?? 0,
                                  w: waymo?.services.filter(s => s.supervision === 'Autonomous').length ?? 0, fmt: (v: number) => `${v}` },
    { label: 'Public access',    t: tesla?.services.filter(s => s.access === 'Public').length ?? 0,
                                  w: waymo?.services.filter(s => s.access === 'Public').length ?? 0, fmt: (v: number) => `${v} cities` },
  ];

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-3 border-b border-neutral-800">
        <div className="p-3 text-[10px] text-neutral-500 uppercase tracking-wide" />
        <div className={`p-3 text-center border-x border-neutral-800 ${color('Tesla').bg}`}>
          <div className={`text-xs font-bold ${color('Tesla').text}`}>Tesla</div>
          <div className="text-[9px] text-neutral-500 mt-0.5">Cybercab + Model Y</div>
        </div>
        <div className={`p-3 text-center ${color('Waymo').bg}`}>
          <div className={`text-xs font-bold ${color('Waymo').text}`}>Waymo</div>
          <div className="text-[9px] text-neutral-500 mt-0.5">Jaguar I-Pace</div>
        </div>
      </div>
      {rows.map((row) => {
        const tWins = row.t > row.w;
        const wWins = row.w > row.t;
        return (
          <div key={row.label} className="grid grid-cols-3 border-b border-neutral-800/50 last:border-0">
            <div className="p-3 text-[10px] text-neutral-500">{row.label}</div>
            <div className={`p-3 text-center border-x border-neutral-800/50 ${tWins ? color('Tesla').bg : ''}`}>
              <span className={`text-sm font-bold ${tWins ? color('Tesla').text : 'text-neutral-400'}`}>
                {row.fmt(row.t)}
              </span>
            </div>
            <div className={`p-3 text-center ${wWins ? color('Waymo').bg : ''}`}>
              <span className={`text-sm font-bold ${wWins ? color('Waymo').text : 'text-neutral-400'}`}>
                {row.fmt(row.w)}
              </span>
            </div>
          </div>
        );
      })}
      {/* Tesla city detail */}
      <div className="grid grid-cols-3 border-t border-neutral-800/50">
        <div className="p-3 text-[10px] text-neutral-500">Cities</div>
        <div className="p-3 border-x border-neutral-800/50">
          {tesla?.services.map(s => (
            <div key={s.city} className="flex items-center gap-1.5 mb-1 last:mb-0">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.supervision === 'Autonomous' ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span className="text-[10px] text-neutral-300">{s.city}</span>
              <span className={`text-[9px] ml-auto ${s.supervision === 'Autonomous' ? 'text-green-400' : 'text-yellow-400'}`}>
                {s.supervision === 'Autonomous' ? 'Auto' : 'Supervised'}
              </span>
            </div>
          )) ?? <span className="text-neutral-600 text-[10px]">—</span>}
        </div>
        <div className="p-3">
          {waymo?.services.slice(0, 6).map(s => (
            <div key={s.city} className="flex items-center gap-1.5 mb-1 last:mb-0">
              <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-green-500" />
              <span className="text-[10px] text-neutral-300">{s.city}</span>
            </div>
          ))}
          {(waymo?.services.length ?? 0) > 6 && (
            <div className="text-[9px] text-neutral-500 mt-1">+{(waymo?.services.length ?? 0) - 6} more</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Race bar ─────────────────────────────────────────────────────────────────

function RaceBar({ companies }: { companies: CompanyStats[] }) {
  // Focus on companies with at least 1 autonomous city
  const relevant = companies.filter(c => c.autonomousCities > 0).slice(0, 8);
  const maxAuto = Math.max(...relevant.map(c => c.autonomousCities), 1);

  return (
    <div className="space-y-2">
      {relevant.map((c) => {
        const pct = Math.round((c.autonomousCities / maxAuto) * 100);
        const col = color(c.name);
        return (
          <div key={c.name} className="flex items-center gap-3">
            <div className="w-20 shrink-0 text-right">
              <span className={`text-[11px] font-medium ${col.text}`}>{c.name}</span>
            </div>
            <div className="flex-1 h-5 bg-neutral-800/60 rounded overflow-hidden">
              <div
                className={`h-full ${col.dot} opacity-80 rounded transition-all duration-700`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="w-16 shrink-0 text-left">
              <span className="text-[10px] text-white font-semibold">{c.autonomousCities}</span>
              <span className="text-[9px] text-neutral-500"> / {c.totalCities} cities</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Company card ──────────────────────────────────────────────────────────────

function CompanyCard({ company }: { company: CompanyStats }) {
  const [expanded, setExpanded] = useState(false);
  const col = color(company.name);
  const autoRatio = company.totalCities > 0
    ? Math.round((company.autonomousCities / company.totalCities) * 100) : 0;

  return (
    <div className={`border rounded-xl overflow-hidden ${col.border} ${col.bg}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${col.dot}`} />
            <span className={`text-sm font-bold ${col.text}`}>{company.name}</span>
          </div>
          <span className="text-[9px] text-neutral-500">{expanded ? '▲' : '▼'}</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-lg font-bold text-white">{company.totalCities}</div>
            <div className="text-[9px] text-neutral-500 uppercase">Cities</div>
          </div>
          <div>
            <div className={`text-lg font-bold ${company.autonomousCities === company.totalCities ? 'text-green-400' : col.text}`}>
              {company.autonomousCities}
            </div>
            <div className="text-[9px] text-neutral-500 uppercase">Driverless</div>
          </div>
          <div>
            <div className={`text-lg font-bold ${autoRatio === 100 ? 'text-green-400' : 'text-neutral-300'}`}>{autoRatio}%</div>
            <div className="text-[9px] text-neutral-500 uppercase">Auto Rate</div>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-neutral-800/50 divide-y divide-neutral-800/30">
          {company.services.map(s => (
            <div key={`${s.company}-${s.city}`} className="px-4 py-2 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-[11px] text-white font-medium">{s.city}</div>
                {s.vehicles && (
                  <div className="text-[9px] text-neutral-500 truncate">{s.vehicles.replace(/;/g, ', ')}</div>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`text-[9px] px-1.5 py-0.5 rounded border ${supColor(s.supervision)}`}>
                  {s.supervision === 'Autonomous' ? 'Auto' : s.supervision === 'Safety Driver' ? 'SD' : 'SA'}
                </span>
                <span className={`text-[9px] ${accColor(s.access)}`}>{s.access}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Waymo cities detail ──────────────────────────────────────────────────────

function WaymoCities({ services }: { services: AVService[] }) {
  const usCities = services.filter(s =>
    !['Beijing','Wuhan','Guangzhou','Shanghai','Shenzhen','Abu Dhabi','Singapore',
      'Riyadh','Zurich','Leuven, Belgium','Valence, Drôme, France'].includes(s.city)
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {usCities.map(s => (
        <div key={s.city} className={`border rounded-lg p-3 ${color('Waymo').bg} ${color('Waymo').border}`}>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
            <span className="text-[11px] font-semibold text-white">{s.city}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`text-[9px] px-1.5 py-0.5 rounded border ${supColor(s.supervision)}`}>Driverless</span>
            <span className={`text-[9px] ${accColor(s.access)}`}>{s.access}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function AVLandscape() {
  const [data, setData] = useState<AVDataResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/av-data')
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-6 bg-neutral-800 rounded w-48" />
        <div className="h-32 bg-neutral-900 rounded-xl" />
      </div>
    );
  }
  if (!data) return null;

  const tesla = data.companies.find(c => c.name === 'Tesla');
  const waymo = data.companies.find(c => c.name === 'Waymo');
  const others = data.companies.filter(c => c.name !== 'Tesla' && c.name !== 'Waymo' && c.totalCities >= 2);

  const totalAuto = data.allServices.filter(s => s.supervision === 'Autonomous').length;
  const totalSvcs = data.allServices.length;

  return (
    <section className="mt-8">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-5 bg-gradient-to-b from-blue-400 to-teal-400 rounded-full" />
        <h2 className="text-white text-sm font-semibold">Competitive Landscape</h2>
        <span className="text-[10px] text-neutral-500 px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded">
          Global AV Race
        </span>
        <span className="ml-auto text-[9px] text-neutral-600">
          Source:{' '}
          <a
            href="https://github.com/EthanMcKanna/av-map-data"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-500 hover:text-white transition-colors"
          >
            av-map-data
          </a>
          {' '}by Ethan McKanna
        </span>
      </div>

      {/* Headline stats */}
      <div className="grid grid-cols-3 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{data.companies.length}</div>
          <div className="text-[10px] text-neutral-500 uppercase mt-1">Companies operating</div>
        </div>
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{totalAuto}</div>
          <div className="text-[10px] text-neutral-500 uppercase mt-1">Driverless deployments</div>
        </div>
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{totalSvcs}</div>
          <div className="text-[10px] text-neutral-500 uppercase mt-1">Active services globally</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Race bar */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5">
          <div className="text-[10px] text-neutral-500 uppercase mb-4 tracking-wide">
            Race to Autonomous — cities with driverless service
          </div>
          <RaceBar companies={data.companies} />
        </div>

        {/* Tesla vs Waymo */}
        <div>
          <div className="text-[10px] text-neutral-500 uppercase mb-3 tracking-wide">Tesla vs Waymo</div>
          <HeadToHead tesla={tesla} waymo={waymo} />
        </div>
      </div>

      {/* Waymo US cities */}
      {waymo && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-[10px] text-neutral-400 uppercase tracking-wide">
              Waymo US deployments — {waymo.services.filter(s => !['Beijing','Guangzhou'].includes(s.city)).length} cities, all driverless
            </span>
          </div>
          <WaymoCities services={waymo.services} />
        </div>
      )}

      {/* Other companies */}
      <div>
        <div className="text-[10px] text-neutral-500 uppercase mb-3 tracking-wide">Other operators</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {others.map(c => <CompanyCard key={c.name} company={c} />)}
        </div>
      </div>
    </section>
  );
}
