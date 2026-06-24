'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { DashboardData } from '@/types/robotaxi';
import type { XIntelPayload } from '@/types/x-intel';
import {
  ShadowSignalPanel,
  ReplyConfirmationPanel,
  PromiseLedgerPanel,
  TweetCorrelationPanel,
  TrustPulsePanel,
  CascadePanel,
  IncidentPanel,
  CompetitivePanel,
  StokesSyncPanel,
  GeofencePanel,
  FleetCounterPanel,
  MetaPanels,
  CityBuzzSection,
} from './panels';
import { Zap, RefreshCw, ArrowLeft, Database } from 'lucide-react';

interface Props {
  dashboard: DashboardData;
}

export function XIntelDashboard({ dashboard }: Props) {
  const [intel, setIntel] = useState<XIntelPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const loadIntel = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/x-intel');
      if (!res.ok) throw new Error('Failed to load X intelligence');
      const data: XIntelPayload = await res.json();
      setIntel(data);
      setLastFetch(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIntel();
    const interval = setInterval(loadIntel, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadIntel]);

  const sourceBadge = intel?.source === 'live'
    ? 'bg-green-500/20 text-green-400'
    : intel?.source === 'hybrid'
      ? 'bg-yellow-500/20 text-yellow-400'
      : 'bg-neutral-800 text-neutral-400';

  return (
    <div className="min-h-screen bg-black text-neutral-200">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-950 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-neutral-500 hover:text-white transition-colors text-[10px]">
              <ArrowLeft className="w-3 h-3" />
              V1
            </Link>
            <Image src="/shadowmode-logo.svg" alt="SHADOWMODE" width={140} height={28} className="opacity-90" />
            <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded border border-cyan-500/30 bg-cyan-500/5">
              <Zap className="w-3 h-3 text-cyan-400" />
              <span className="text-[10px] text-cyan-400 font-bold tracking-widest">X INTEL V2</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {intel && (
              <>
                <span className={`text-[9px] px-2 py-0.5 rounded ${sourceBadge}`}>
                  {intel.source.toUpperCase()} · {intel.rawTweetCount} tweets
                </span>
                <span className="text-[9px] text-neutral-600 hidden md:inline">
                  {dashboard.states.reduce((s, st) => s + st.cities.length, 0)} cities synced
                </span>
              </>
            )}
            <button
              onClick={loadIntel}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-700 hover:border-neutral-500 text-[10px] text-neutral-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              REFRESH
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 p-3 rounded-lg border border-red-500/30 bg-red-500/5 text-red-400 text-[11px] normal-case">
            {error} — showing cached/seed data when available.
          </div>
        )}

        {loading && !intel ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Database className="w-8 h-8 text-neutral-600 animate-pulse" />
            <p className="text-[11px] text-neutral-500">Ingesting X signals…</p>
          </div>
        ) : intel ? (
          <div className="space-y-6">
            {/* Row 1: Meta + City Buzz */}
            <MetaPanels data={intel} />
            <CityBuzzSection data={intel} />

            {/* Row 2: Core signals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              <ShadowSignalPanel data={intel} />
              <ReplyConfirmationPanel data={intel} />
              <PromiseLedgerPanel data={intel} />
            </div>

            {/* Row 3: Market intel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              <TweetCorrelationPanel data={intel} />
              <TrustPulsePanel data={intel} />
              <CascadePanel data={intel} />
            </div>

            {/* Row 4: Risk + competitive */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
              <IncidentPanel data={intel} />
              <CompetitivePanel data={intel} />
              <StokesSyncPanel data={intel} />
              <FleetCounterPanel data={intel} />
            </div>

            {/* Row 5: Geofence */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <GeofencePanel data={intel} />
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4">
                <h3 className="text-white text-xs font-semibold mb-3">V2 Module Index</h3>
                <div className="grid grid-cols-2 gap-2 text-[9px] text-neutral-500 normal-case">
                  {[
                    'Shadow Signal Feed', 'Reply Confirmation Index', 'Elon Promise Ledger',
                    'Tweet → TSLA Correlation', 'X Trust Pulse', 'Who Said It First',
                    'City Buzz Heatmap', 'Incident Flash Detection', 'Competitive X Radar',
                    '@JonathanWStokes Sync', 'Geofence Whispers', 'Cybercab Fleet Counter',
                    'Narrative Half-Life (X)', 'Elon ↔ @robotaxi Divergence',
                  ].map((m) => (
                    <div key={m} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      {m}
                    </div>
                  ))}
                </div>
                {lastFetch && (
                  <p className="text-[8px] text-neutral-600 mt-4">
                    Last refresh: {lastFetch.toLocaleTimeString()} · Auto-refresh every 15 min
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </main>

      <footer className="border-t border-neutral-800 py-4 text-center text-[9px] text-neutral-600">
        SHADOWMODE X INTEL V2 — STAGED LOCAL BUILD · NOT INVESTMENT ADVICE
      </footer>
    </div>
  );
}