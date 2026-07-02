'use client';

import { Battery, Factory, AlertTriangle, TrendingDown, Zap } from 'lucide-react';
import { energyPanelData } from '@/lib/energy-seed-data';
import { MetricCard } from '../MetricCard';
import { MegapackDealLedger } from './MegapackDealLedger';
import { SourceLink } from './SourceLink';

/** Thesis + flags — rendered by the shell beside the hero video */
export function EnergyIntro() {
  return (
    <div className="space-y-4">
      {/* Thesis */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3">
        <p className="text-[11px] text-neutral-400 leading-relaxed normal-case">{energyPanelData.thesisLine}</p>
        <p className="mt-2 text-[9px] text-neutral-600">
          Compiled {energyPanelData.lastCompiled} · {energyPanelData.compiledBy} · power-is-the-bottleneck thesis
        </p>
      </div>

      {/* Anti-Belfort flags — show, don't hide */}
      <div className="space-y-2">
        {energyPanelData.flags.map((flag) => (
          <div
            key={flag.id}
            className={`flex gap-3 rounded-lg border px-3 py-2.5 normal-case ${
              flag.severity === 'warning'
                ? 'border-yellow-500/30 bg-yellow-500/5'
                : 'border-neutral-700 bg-neutral-900/50'
            }`}
          >
            <AlertTriangle
              className={`w-4 h-4 shrink-0 mt-0.5 ${
                flag.severity === 'warning' ? 'text-yellow-500' : 'text-neutral-500'
              }`}
            />
            <div>
              <div className="text-[10px] font-bold text-white uppercase tracking-wide">{flag.headline}</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">{flag.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EnergyPanel() {
  const latest = energyPanelData.deployments[energyPanelData.deployments.length - 1];
  const fy2025 = energyPanelData.deployments.find((d) => d.quarter === 'FY2025');
  const ttm = fy2025?.gwh ?? 0;

  return (
    <div className="space-y-6">
      {/* Scoreboard metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="Latest Qtr Deployed"
          value={`${latest.gwh} GWh`}
          subtitle={latest.flagNote ?? latest.quarter}
          icon={<Battery className="w-4 h-4" />}
          iconClassName={latest.flag === 'miss' ? 'text-yellow-500' : 'text-green-400'}
          valueClassName={latest.flag === 'miss' ? 'text-yellow-400' : 'text-white'}
          highlight={latest.flag === 'miss'}
          trailing={<SourceLink url={latest.sourceUrl} />}
        />
        <MetricCard
          label="FY2025 TTM"
          value={`${ttm} GWh`}
          subtitle={fy2025?.yoyNote}
          icon={<Zap className="w-4 h-4" />}
          trailing={fy2025 ? <SourceLink url={fy2025.sourceUrl} /> : undefined}
        />
        <MetricCard
          label="Energy Gross Margin"
          value={energyPanelData.grossMargin.value}
          subtitle={energyPanelData.grossMargin.note}
          icon={<TrendingDown className="w-4 h-4" />}
          iconClassName="text-yellow-500"
          valueClassName="text-yellow-400"
          highlight
          trailing={<SourceLink url={energyPanelData.grossMargin.sourceUrl} />}
        />
        <MetricCard
          label="Normalized Margin (est.)"
          value={energyPanelData.grossMarginNormalized?.value ?? '—'}
          subtitle={energyPanelData.grossMarginNormalized?.note}
          icon={<TrendingDown className="w-4 h-4" />}
          trailing={
            energyPanelData.grossMarginNormalized ? (
              <SourceLink url={energyPanelData.grossMarginNormalized.sourceUrl} />
            ) : undefined
          }
        />
      </div>

      {/* Quarterly deployment table */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-800">
          <h3 className="text-xs font-bold text-white tracking-wider">Storage Deployed (GWh)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[10px] normal-case">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-500">
                <th className="px-4 py-2">Quarter</th>
                <th className="px-4 py-2">GWh</th>
                <th className="px-4 py-2">Note</th>
                <th className="px-4 py-2">Source</th>
              </tr>
            </thead>
            <tbody>
              {energyPanelData.deployments.map((row) => (
                <tr
                  key={row.quarter}
                  className={`border-b border-neutral-800/50 ${
                    row.flag === 'miss' ? 'bg-yellow-500/5' : row.flag === 'record' ? 'bg-green-500/5' : ''
                  }`}
                >
                  <td className="px-4 py-2 text-white font-medium">{row.quarter}</td>
                  <td className="px-4 py-2 text-neutral-200 tabular-nums">{row.gwh}</td>
                  <td className="px-4 py-2 text-neutral-500">
                    {[row.yoyNote, row.flagNote].filter(Boolean).join(' · ') || '—'}
                  </td>
                  <td className="px-4 py-2">
                    <SourceLink url={row.sourceUrl} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Megafactory capacity */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-800 flex items-center gap-2">
          <Factory className="w-3.5 h-3.5 text-neutral-500" />
          <h3 className="text-xs font-bold text-white tracking-wider">Megafactory Capacity</h3>
        </div>
        <div className="divide-y divide-neutral-800">
          {energyPanelData.megafactories.map((mf) => (
            <div key={mf.site} className="px-4 py-3 flex items-center justify-between gap-4">
              <div>
                <div className="text-[10px] text-white font-medium">{mf.site}</div>
                <div className="text-[9px] text-neutral-500 mt-0.5">{mf.note ?? mf.status}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-white tabular-nums">{mf.capacityGwhPerYear} GWh/yr</span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded border uppercase ${
                    mf.status === 'operational'
                      ? 'border-green-500/30 text-green-400 bg-green-500/10'
                      : mf.status === 'ramping'
                        ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10'
                        : 'border-neutral-600 text-neutral-500 bg-neutral-800/50'
                  }`}
                >
                  {mf.status}
                </span>
                <SourceLink url={mf.sourceUrl} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <MegapackDealLedger deals={energyPanelData.megapackDeals} />
    </div>
  );
}