'use client';

import { AlertTriangle, Truck, Package, Gauge, Zap } from 'lucide-react';
import { semiPanelData, getSemiConversionStats } from '@/lib/semi-seed-data';
import { MetricCard } from '../MetricCard';
import { SemiContractLedger } from './SemiContractLedger';
import { SourceLink } from '../energy/SourceLink';

/** Thesis + conversion flags — rendered by the shell beside the hero video */
export function SemiIntro() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3">
        <p className="text-[11px] text-neutral-400 leading-relaxed normal-case">{semiPanelData.thesisLine}</p>
        <p className="mt-2 text-[9px] text-neutral-600">
          Compiled {semiPanelData.lastCompiled} · {semiPanelData.compiledBy} · power-is-the-bottleneck thesis
        </p>
      </div>

      {/* Conversion story + HVIP lead */}
      <div className="space-y-2">
        {semiPanelData.conversionFlags.map((flag) => (
          <div
            key={flag.id}
            className={`flex gap-3 rounded-lg border px-3 py-2.5 normal-case ${
              flag.severity === 'hot'
                ? 'border-cyan-500/30 bg-cyan-500/5'
                : flag.severity === 'warning'
                  ? 'border-red-500/20 bg-red-500/5'
                  : 'border-neutral-700 bg-neutral-900/50'
            }`}
          >
            {flag.severity === 'hot' ? (
              <Zap className="w-4 h-4 shrink-0 mt-0.5 text-cyan-400" />
            ) : (
              <AlertTriangle
                className={`w-4 h-4 shrink-0 mt-0.5 ${
                  flag.severity === 'warning' ? 'text-red-400' : 'text-neutral-500'
                }`}
              />
            )}
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

export function SemiPanel() {
  const conversion = getSemiConversionStats();
  const hvip = semiPanelData.scoreboard[0];

  return (
    <div className="space-y-6">
      {/* HVIP hero — least-spinnable demand signal */}
      <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 px-4 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[9px] text-cyan-400 uppercase tracking-wider font-semibold">
              Govt demand signal (HVIP)
            </div>
            <div className="text-3xl font-bold text-white tabular-nums mt-1">{hvip.value}</div>
            <div className="text-[10px] text-neutral-400 mt-1 normal-case">{hvip.subtitle}</div>
          </div>
          <SourceLink url={hvip.sourceUrl} />
        </div>
      </div>

      {/* Conversion buckets — reservation ≠ delivery; order ≠ on-road */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="On the road (est.)"
          value={conversion.operatingUnits > 0 ? `~${conversion.operatingUnits}` : '—'}
          subtitle={`${conversion.operatingCustomers} customers · pilot + delivered only`}
          icon={<Truck className="w-5 h-5 text-cyan-400" />}
          valueClassName="text-cyan-400"
        />
        <MetricCard
          label="On firm order"
          value={conversion.onOrderUnits > 0 ? `~${conversion.onOrderUnits}` : '—'}
          subtitle={`${conversion.onOrderCustomers} customer · deposit/order, not delivered`}
          icon={<Package className="w-5 h-5 text-orange-400" />}
          valueClassName="text-orange-400"
        />
        <MetricCard
          label="Active reserved"
          value={conversion.activeReservedUnits > 0 ? `~${conversion.activeReservedUnits}` : '—'}
          subtitle={`${conversion.activeReservedCustomers} customers · book only until delivered`}
          icon={<Gauge className="w-5 h-5 text-yellow-400" />}
          valueClassName="text-yellow-400"
        />
        <MetricCard
          label="Stale reservations"
          value={conversion.staleReservedUnits > 0 ? `~${conversion.staleReservedUnits}` : '—'}
          subtitle={`${conversion.staleCustomers} customers · no 2024+ update`}
          icon={<AlertTriangle className="w-5 h-5 text-red-400" />}
          valueClassName="text-red-400"
          highlight
        />
      </div>

      <div className="space-y-2">
        {semiPanelData.disclaimers.map((note) => (
          <div
            key={note}
            className="flex gap-3 rounded-lg border border-neutral-700 bg-neutral-900/50 px-3 py-2.5 normal-case"
          >
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-neutral-500" />
            <div className="text-[10px] text-neutral-400">{note}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {semiPanelData.scoreboard.slice(1).map((metric) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            subtitle={metric.subtitle}
            icon={<Truck className="w-5 h-5 text-purple-400" />}
            trailing={<SourceLink url={metric.sourceUrl} />}
          />
        ))}
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-800">
          <h3 className="text-xs font-bold text-white tracking-wider">Production & Charging Infra</h3>
        </div>
        <div className="divide-y divide-neutral-800">
          {semiPanelData.infraMilestones.map((m) => (
            <div key={m.label} className="px-4 py-3 flex items-center justify-between gap-4">
              <div>
                <div className="text-[10px] text-white font-medium">{m.label}</div>
                {m.note && <div className="text-[9px] text-neutral-500 mt-0.5">{m.note}</div>}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-white tabular-nums">{m.value}</span>
                <SourceLink url={m.sourceUrl} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <SemiContractLedger />
    </div>
  );
}