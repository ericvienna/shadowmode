'use client';

import {
  Radio, MessageCircle, ScrollText, TrendingUp, Heart, GitBranch,
  AlertTriangle, Swords, RefreshCw, MapPin, Camera, Clock, Split,
} from 'lucide-react';
import type { XIntelPayload } from '@/types/x-intel';
import { CityBuzzMap } from './CityBuzzMap';

const PANEL_ITEMS = 5;

function PanelShell({
  title, subtitle, icon, children, badge, dense,
}: {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  badge?: string;
  dense?: boolean;
}) {
  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden flex flex-col">
      <div className="px-4 py-2.5 border-b border-neutral-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {icon}
          <div className="min-w-0">
            <h3 className="text-white text-xs font-semibold truncate">{title}</h3>
            {subtitle && <p className="text-[10px] text-neutral-500 normal-case truncate">{subtitle}</p>}
          </div>
        </div>
        {badge && (
          <span className="text-[9px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 shrink-0 ml-2">{badge}</span>
        )}
      </div>
      <div className={`px-4 py-3 flex flex-col gap-2 ${dense ? '' : 'min-h-0'}`}>{children}</div>
    </div>
  );
}

function FillerLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[8px] text-neutral-600 uppercase tracking-wider pt-2 border-t border-neutral-800/80 mt-1">
      {children}
    </p>
  );
}

function statusColor(status: string) {
  if (status === 'kept' || status === 'high' || status === 'strong' || status === 'aligned' || status === 'fresh') return 'text-green-400';
  if (status === 'missed' || status === 'critical' || status === 'divergent' || status === 'stale') return 'text-red-400';
  if (status === 'in_progress' || status === 'medium' || status === 'drifting' || status === 'active' || status === 'fading') return 'text-yellow-400';
  return 'text-neutral-400';
}

function StatChip({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-neutral-900/80 rounded-lg px-2.5 py-2 text-center">
      <p className={`text-sm font-bold leading-none ${color ?? 'text-white'}`}>{value}</p>
      <p className="text-[8px] text-neutral-600 mt-1">{label}</p>
    </div>
  );
}

export function ShadowSignalPanel({ data }: { data: XIntelPayload }) {
  const signals = data.shadowSignals.slice(0, PANEL_ITEMS);
  return (
    <PanelShell title="Shadow Signal Feed" subtitle="Community leading indicators before news" icon={<Radio className="w-4 h-4 text-green-400" />} badge={`${data.shadowSignals.length} signals`} dense>
      {signals.map((s) => (
        <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="block p-2 rounded-lg bg-neutral-900/50 border border-neutral-800 hover:border-green-500/30 transition-colors normal-case">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] text-green-400">@{s.handle}</span>
            {s.cityName && <span className="text-[9px] text-neutral-500">{s.cityName}</span>}
            {s.hasVideo && <Camera className="w-3 h-3 text-blue-400" />}
            <span className="text-[8px] text-neutral-600 ml-auto">{s.hoursBeforeNews}h early</span>
          </div>
          <p className="text-[10px] text-neutral-300 leading-snug line-clamp-2">{s.text}</p>
          <div className="flex gap-2 mt-0.5 text-[8px] text-neutral-600">
            <span>Cred {s.credibilityScore}</span>
            <span className={s.sentiment === 'positive' ? 'text-green-500' : s.sentiment === 'negative' ? 'text-red-500' : ''}>{s.sentiment}</span>
          </div>
        </a>
      ))}
      {data.shadowSignals.length > PANEL_ITEMS && (
        <p className="text-[8px] text-neutral-600 text-center normal-case">+{data.shadowSignals.length - PANEL_ITEMS} more in sidebar X tab</p>
      )}
      <div className="grid grid-cols-3 gap-2 pt-1">
        <StatChip label="INGESTED" value={String(data.rawTweetCount)} color="text-cyan-400" />
        <StatChip label="BUZZ HOT" value={String(data.cityBuzz.filter((c) => c.buzzLevel === 'hot').length)} color="text-red-400" />
        <StatChip label="SOURCE" value={data.source.slice(0, 4).toUpperCase()} />
      </div>
    </PanelShell>
  );
}

export function ReplyConfirmationPanel({ data }: { data: XIntelPayload }) {
  const confirmations = data.replyConfirmations.slice(0, PANEL_ITEMS);
  const cascadeFillers = data.informationCascades.flatMap((c) =>
    c.steps.filter((s) => s.source === 'elon' || s.source === 'community').map((s) => ({
      id: `${c.id}-${s.source}`,
      label: s.label,
      source: s.source,
      lag: s.lagHoursFromStart,
    }))
  ).slice(0, Math.max(0, PANEL_ITEMS - confirmations.length));

  return (
    <PanelShell title="Reply Confirmation Index" subtitle="Elon reply chains as soft milestones" icon={<MessageCircle className="w-4 h-4 text-cyan-400" />} badge={`${data.replyConfirmations.length} confirmations`} dense>
      {confirmations.map((r) => (
        <div key={r.id} className="p-2 rounded-lg bg-neutral-900/50 border border-neutral-800 normal-case">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-neutral-400">@{r.communityTweet.handle} → Elon</span>
            <span className={`text-[9px] font-bold ${statusColor(r.confidence)}`}>{r.confidence.toUpperCase()}</span>
          </div>
          <p className="text-[9px] text-neutral-500 line-clamp-1 mb-0.5">{r.communityTweet.text}</p>
          <p className="text-[10px] text-white line-clamp-2">&quot;{r.elonReply.text}&quot;</p>
          <div className="flex gap-2 mt-0.5 text-[8px]">
            {r.milestoneHint && <span className="text-cyan-400">→ {r.milestoneHint}</span>}
            {r.cityName && <span className="text-neutral-600">{r.cityName}</span>}
          </div>
        </div>
      ))}
      {cascadeFillers.length > 0 && (
        <>
          <FillerLabel>Signal chain</FillerLabel>
          {cascadeFillers.map((f) => (
            <div key={f.id} className="p-2 rounded bg-neutral-900/30 border border-neutral-800/50 normal-case">
              <div className="flex justify-between text-[8px] text-neutral-600 mb-0.5">
                <span className="uppercase">{f.source}</span>
                {f.lag !== undefined && f.lag > 0 && <span>+{f.lag}h</span>}
              </div>
              <p className="text-[10px] text-neutral-400 line-clamp-2">{f.label}</p>
            </div>
          ))}
        </>
      )}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <StatChip label="HALF-LIFE" value={data.narrativeHalfLife.label.toUpperCase()} color={statusColor(data.narrativeHalfLife.label)} />
        <StatChip label="CHANNELS" value={data.channelDivergence.label.toUpperCase()} color={statusColor(data.channelDivergence.label)} />
      </div>
    </PanelShell>
  );
}

export function PromiseLedgerPanel({ data }: { data: XIntelPayload }) {
  const promises = data.promiseLedger.slice(0, 4);
  return (
    <PanelShell title="Elon Promise Ledger" subtitle="Commitments vs delivery" icon={<ScrollText className="w-4 h-4 text-orange-400" />} dense>
      <div className="grid grid-cols-3 gap-2">
        <StatChip label="KEPT" value={String(data.narrativeDrift.promisesKept)} color="text-green-400" />
        <StatChip label="MISSED" value={String(data.narrativeDrift.promisesMissed)} color="text-red-400" />
        <StatChip label="PENDING" value={String(data.narrativeDrift.promisesPending)} color="text-yellow-400" />
      </div>
      <div className="h-1.5 bg-gradient-to-r from-red-500/30 via-yellow-500/30 to-green-500/30 rounded-full relative">
        <div className="absolute top-0 w-2 h-1.5 bg-white rounded-full" style={{ left: `calc(${data.narrativeDrift.position}% - 4px)` }} />
      </div>
      <p className="text-[9px] text-center text-neutral-400">{data.narrativeDrift.label.replace('-', ' ')}</p>
      {promises.map((p) => (
        <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer" className="block p-2 rounded bg-neutral-900/30 hover:bg-neutral-900/60 normal-case">
          <div className="flex justify-between items-start gap-2">
            <p className="text-[10px] text-neutral-300 flex-1 line-clamp-1">{p.text}</p>
            <span className={`text-[9px] font-bold shrink-0 ${statusColor(p.status)}`}>{p.status}</span>
          </div>
        </a>
      ))}
      {data.promiseLedger.length > 4 && (
        <p className="text-[8px] text-neutral-600 text-center normal-case">+{data.promiseLedger.length - 4} more in full ledger</p>
      )}
    </PanelShell>
  );
}

export function TweetCorrelationPanel({ data }: { data: XIntelPayload }) {
  const items = data.tweetCorrelations.slice(0, PANEL_ITEMS);
  return (
    <PanelShell title="Tweet → TSLA Correlation" subtitle="Price reaction to X catalysts" icon={<TrendingUp className="w-4 h-4 text-green-400" />} dense>
      {items.map((c) => (
        <a key={c.id} href={c.tweetUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 rounded-lg bg-neutral-900/50 border border-neutral-800 hover:border-green-500/20 normal-case">
          <div className="flex-1 min-w-0 mr-2">
            <p className="text-[10px] text-white line-clamp-1">{c.eventLabel}</p>
            <p className="text-[8px] text-neutral-500">@{c.tweetHandle}</p>
          </div>
          <span className={`text-sm font-bold shrink-0 ${c.tslaNextSessionPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {c.tslaNextSessionPct >= 0 ? '+' : ''}{c.tslaNextSessionPct.toFixed(1)}%
          </span>
        </a>
      ))}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <StatChip label="TRUST" value={String(data.trustPulse.score)} color={statusColor(data.trustPulse.status)} />
        <StatChip label="ENG VEL" value={data.trustPulse.engagementVelocity.toFixed(1)} color="text-blue-400" />
      </div>
    </PanelShell>
  );
}

export function TrustPulsePanel({ data }: { data: XIntelPayload }) {
  const t = data.trustPulse;
  return (
    <PanelShell title="X Trust Pulse" subtitle="Live sentiment from robotaxi discourse" icon={<Heart className="w-4 h-4 text-pink-400" />} badge={t.status} dense>
      <div className="flex items-center gap-4">
        <p className={`text-3xl font-bold ${statusColor(t.status)}`}>{t.score}</p>
        <div className="flex-1 grid grid-cols-2 gap-2">
          <StatChip label="POSITIVE" value={`${(t.positiveRatio * 100).toFixed(0)}%`} color="text-green-400" />
          <StatChip label="NEGATIVE" value={`${(t.negativeRatio * 100).toFixed(0)}%`} color="text-red-400" />
        </div>
      </div>
      {t.influencerStance.map((inf) => (
        <div key={inf.handle} className="flex justify-between text-[10px] normal-case py-1 border-b border-neutral-800/40 last:border-0">
          <span className="text-neutral-400">@{inf.handle}</span>
          <span className={inf.stance === 'positive' ? 'text-green-400' : inf.stance === 'negative' ? 'text-red-400' : 'text-neutral-500'}>{inf.stance}</span>
        </div>
      ))}
      {t.incidentSpike && <p className="text-[9px] text-red-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Incident spike</p>}
    </PanelShell>
  );
}

export function CascadePanel({ data }: { data: XIntelPayload }) {
  return (
    <PanelShell title="Who Said It First" subtitle="Information arbitrage timeline" icon={<GitBranch className="w-4 h-4 text-purple-400" />} dense>
      {data.informationCascades.slice(0, 2).map((c) => (
        <div key={c.id} className="p-2 rounded-lg bg-neutral-900/40 border border-neutral-800/60 normal-case">
          <p className="text-[10px] text-white font-semibold mb-1.5 line-clamp-1">{c.eventTitle}{c.cityName ? ` · ${c.cityName}` : ''}</p>
          <div className="space-y-1 pl-2 border-l border-neutral-700">
            {c.steps.map((step, i) => (
              <div key={i}>
                <span className="text-[8px] text-neutral-500 uppercase">{step.source}</span>
                {step.lagHoursFromStart !== undefined && step.lagHoursFromStart > 0 && (
                  <span className="text-[8px] text-neutral-600 ml-1">+{step.lagHoursFromStart}h</span>
                )}
                <p className="text-[10px] text-neutral-400 line-clamp-1">{step.label}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="grid grid-cols-2 gap-2">
        <StatChip label="TOTAL LAG" value={`${data.informationCascades[0]?.totalLagHours ?? 0}h`} />
        <StatChip label="CASCADES" value={String(data.informationCascades.length)} color="text-purple-400" />
      </div>
    </PanelShell>
  );
}

export function IncidentPanel({ data }: { data: XIntelPayload }) {
  const incidents = data.incidentFlashes.slice(0, PANEL_ITEMS);
  return (
    <PanelShell title="Incident Flash Detection" subtitle="X-first safety alerts" icon={<AlertTriangle className="w-4 h-4 text-red-400" />} badge={incidents.length > 0 ? 'ACTIVE' : 'CLEAR'} dense>
      {incidents.length === 0 ? (
        <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20 text-center normal-case">
          <p className="text-[10px] text-green-400">No active incident spikes</p>
          <p className="text-[9px] text-neutral-600 mt-1">Monitoring X for crash / NHTSA keywords</p>
        </div>
      ) : (
        incidents.map((inc) => (
          <a key={inc.id} href={inc.url} target="_blank" rel="noopener noreferrer" className={`block p-2 rounded-lg border normal-case ${inc.severity === 'high' ? 'border-red-500/30 bg-red-500/5' : 'border-neutral-800 bg-neutral-900/50'}`}>
            <div className="flex justify-between mb-0.5">
              <span className={`text-[9px] font-bold ${inc.severity === 'high' ? 'text-red-400' : 'text-yellow-400'}`}>{inc.severity}</span>
              {inc.xFirst && <span className="text-[8px] text-cyan-400">{inc.newsLagHours}h early</span>}
            </div>
            <p className="text-[10px] text-neutral-300 line-clamp-2">{inc.headline}</p>
          </a>
        ))
      )}
      <StatChip label="VELOCITY" value={String(incidents[0]?.mentionVelocity ?? 0)} color="text-orange-400" />
    </PanelShell>
  );
}

export function CompetitivePanel({ data }: { data: XIntelPayload }) {
  return (
    <PanelShell title="Competitive X Radar" subtitle="AV narrative share on X" icon={<Swords className="w-4 h-4 text-blue-400" />} dense>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {data.competitiveRadar.map((c) => (
          <div key={c.handle} className="p-2.5 rounded-lg bg-neutral-900/50 border border-neutral-800">
            <div className="flex justify-between mb-1">
              <span className="text-[10px] text-white">{c.company}</span>
              <span className="text-[10px] text-blue-400 font-bold">{c.narrativeSharePct}%</span>
            </div>
            <div className="h-1 bg-neutral-800 rounded-full overflow-hidden mb-1">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.max(c.narrativeSharePct, 4)}%` }} />
            </div>
            {c.latestTweet && <p className="text-[8px] text-neutral-600 line-clamp-2 normal-case">{c.latestTweet}</p>}
          </div>
        ))}
      </div>
    </PanelShell>
  );
}

export function StokesSyncPanel({ data }: { data: XIntelPayload }) {
  const syncs = data.stokesSync.slice(0, 3);
  const buzzFillers = data.cityBuzz.slice(0, Math.max(2, PANEL_ITEMS - syncs.length));
  const geoFillers = data.geofenceWhispers.slice(0, Math.max(0, PANEL_ITEMS - syncs.length - buzzFillers.length));

  return (
    <PanelShell title="@JonathanWStokes Sync" subtitle="Tracker diff vs matrix" icon={<RefreshCw className="w-4 h-4 text-yellow-400" />} dense>
      {syncs.map((d, i) => (
        <a key={i} href={d.stokesUrl} target="_blank" rel="noopener noreferrer" className="block p-2 rounded-lg bg-neutral-900/50 border border-neutral-800 normal-case">
          <div className="flex justify-between mb-0.5">
            <span className="text-[10px] text-white">{d.cityName} · {d.field.replace(/_/g, ' ')}</span>
            <span className={`text-[8px] ${d.severity === 'warning' ? 'text-yellow-400' : 'text-neutral-500'}`}>{d.severity}</span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[9px]">
            <div><span className="text-neutral-600">Matrix </span><span className="text-neutral-300">{d.currentValue}</span></div>
            <div><span className="text-neutral-600">Stokes </span><span className="text-green-400">{d.stokesValue}</span></div>
          </div>
        </a>
      ))}
      {buzzFillers.length > 0 && (
        <>
          <FillerLabel>City buzz</FillerLabel>
          {buzzFillers.map((b) => (
            <div key={b.cityId} className="flex justify-between items-center p-2 rounded bg-neutral-900/30 text-[10px] normal-case">
              <span className="text-neutral-300">{b.cityName}, {b.stateAbbr}</span>
              <span className={b.buzzLevel === 'hot' ? 'text-red-400' : 'text-yellow-400'}>{b.mentionCount} mentions</span>
            </div>
          ))}
        </>
      )}
      {geoFillers.map((g) => (
        <a key={g.id} href={g.url} target="_blank" rel="noopener noreferrer" className="block p-2 rounded bg-neutral-900/30 normal-case">
          <p className="text-[10px] text-emerald-400/90">{g.location}</p>
          <p className="text-[9px] text-neutral-500 line-clamp-1">{g.latestTweet}</p>
        </a>
      ))}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <StatChip label="FLEET VIS" value={String(data.fleetCounter.reduce((s, f) => s + f.visualSightings, 0))} color="text-violet-400" />
        <StatChip label="GEOFENCE" value={String(data.geofenceWhispers.length)} color="text-emerald-400" />
      </div>
    </PanelShell>
  );
}

export function GeofencePanel({ data }: { data: XIntelPayload }) {
  const items = data.geofenceWhispers.slice(0, PANEL_ITEMS);
  return (
    <PanelShell title="Geofence Whispers" subtitle="Community cartography" icon={<MapPin className="w-4 h-4 text-emerald-400" />} dense>
      {items.map((g) => (
        <a key={g.id} href={g.url} target="_blank" rel="noopener noreferrer" className="block p-2 rounded bg-neutral-900/50 border border-neutral-800 normal-case">
          <p className="text-[10px] text-white">{g.location}</p>
          <p className="text-[9px] text-neutral-500 line-clamp-1">{g.mentionCount} mentions · {g.latestTweet}</p>
        </a>
      ))}
      {data.fleetCounter.slice(0, 2).map((f, i) => (
        <div key={i} className="flex justify-between p-2 rounded bg-neutral-900/30 text-[10px]">
          <span className="text-neutral-400">{f.cityName} sightings</span>
          <span className="text-white font-bold">{f.visualSightings}</span>
        </div>
      ))}
    </PanelShell>
  );
}

export function FleetCounterPanel({ data }: { data: XIntelPayload }) {
  const total = data.fleetCounter.reduce((s, f) => s + f.visualSightings, 0);
  return (
    <PanelShell title="Cybercab Fleet Counter" subtitle="Visual sightings per week" icon={<Camera className="w-4 h-4 text-violet-400" />} badge={data.fleetCounter[0]?.weekLabel} dense>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {data.fleetCounter.map((f, i) => (
          <div key={i} className="p-2.5 rounded-lg bg-neutral-900/50 border border-neutral-800 text-center">
            <p className="text-[10px] text-neutral-400 mb-1">{f.cityName}</p>
            <p className="text-xl font-bold text-white">{f.visualSightings}</p>
            <p className={`text-[9px] mt-0.5 ${f.trend === 'up' ? 'text-green-400' : 'text-neutral-500'}`}>{f.trend === 'up' ? '↑ trending' : 'flat'}</p>
          </div>
        ))}
        <div className="p-2.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-center">
          <p className="text-[10px] text-violet-400 mb-1">TOTAL</p>
          <p className="text-xl font-bold text-violet-300">{total}</p>
          <p className="text-[9px] text-neutral-600 mt-0.5">visual posts</p>
        </div>
      </div>
    </PanelShell>
  );
}

export function MetaPanels({ data }: { data: XIntelPayload }) {
  const hl = data.narrativeHalfLife;
  const div = data.channelDivergence;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <PanelShell title="Narrative Half-Life (X)" subtitle="Days since last high-signal post" icon={<Clock className="w-4 h-4 text-cyan-400" />} badge={hl.label} dense>
        <div className="flex items-start gap-4">
          <p className={`text-3xl font-bold leading-none ${statusColor(hl.label)}`}>{hl.daysSinceLastSignal}d</p>
          <div className="flex-1 min-w-0 normal-case">
            <p className="text-[10px] text-neutral-400">{hl.lastSignalSource}</p>
            <p className="text-[10px] text-neutral-500 line-clamp-2">{hl.lastSignalText}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <StatChip label="TRUST" value={String(data.trustPulse.score)} color={statusColor(data.trustPulse.status)} />
          <StatChip label="TWEETS" value={String(data.rawTweetCount)} color="text-cyan-400" />
          <StatChip label="SIGNALS" value={String(data.shadowSignals.length)} color="text-green-400" />
        </div>
        {data.cityBuzz[0] && (
          <div className="p-2 rounded bg-neutral-900/50 border border-neutral-800 normal-case">
            <p className="text-[9px] text-neutral-600">Hottest market</p>
            <p className="text-[10px] text-white">{data.cityBuzz[0].cityName} — {data.cityBuzz[0].mentionCount} mentions</p>
          </div>
        )}
      </PanelShell>
      <PanelShell title="Elon ↔ @robotaxi Divergence" subtitle="Channel alignment monitor" icon={<Split className="w-4 h-4 text-orange-400" />} badge={div.label} dense>
        <div className="flex items-center gap-4">
          <p className={`text-3xl font-bold leading-none ${statusColor(div.label)}`}>{div.gapDays}d</p>
          <p className="text-[10px] text-neutral-400 normal-case flex-1 line-clamp-3">{div.summary}</p>
        </div>
        <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
          <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${Math.min(100, div.score)}%` }} />
        </div>
        <div className="grid grid-cols-2 gap-2 normal-case">
          <div className="p-2 rounded bg-neutral-900/50 text-[9px]">
            <span className="text-neutral-600">Elon last </span>
            <span className="text-neutral-300">{div.elonLastAt ? new Date(div.elonLastAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</span>
          </div>
          <div className="p-2 rounded bg-neutral-900/50 text-[9px]">
            <span className="text-neutral-600">@robotaxi last </span>
            <span className="text-neutral-300">{div.robotaxiLastAt ? new Date(div.robotaxiLastAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <StatChip label="KEPT" value={String(data.narrativeDrift.promisesKept)} color="text-green-400" />
          <StatChip label="MISSED" value={String(data.narrativeDrift.promisesMissed)} color="text-red-400" />
          <StatChip label="DRIFT" value={data.narrativeDrift.label.split('-')[0].toUpperCase()} color="text-yellow-400" />
        </div>
      </PanelShell>
    </div>
  );
}

export function CityBuzzSection({ data }: { data: XIntelPayload }) {
  return <CityBuzzMap cityBuzz={data.cityBuzz} />;
}