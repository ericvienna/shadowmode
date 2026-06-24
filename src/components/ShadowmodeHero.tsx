'use client';

import { differenceInDays, parseISO } from 'date-fns';
import type { State } from '@/types/robotaxi';
import type { XIntelPayload } from '@/types/x-intel';
import { HeroTicker, type TickerItem } from './HeroTicker';
import { HeroOpsPanel } from './HeroOpsPanel';
import { DeploymentPulseMap } from './DeploymentPulseMap';
import { TeslaVideoFeed } from './TeslaVideoFeed';
import { calculateStats } from '@/lib/utils';

interface ShadowmodeHeroProps {
  states: State[];
  intel?: XIntelPayload | null;
}

// Build the ticker's data-derived signals from the live milestone data, so the
// "LIVE" ticker never shows frozen numbers. Austin's driverless line honors the
// actual milestone status (a real day-count only when it's actually completed).
function buildTickerSignals(states: State[]): TickerItem[] {
  const stats = calculateStats(states);
  const signals: TickerItem[] = [];

  const austin = states.flatMap((s) => s.cities).find((c) => c.name.toLowerCase() === 'austin');
  const dl = austin?.milestones?.no_safety_monitor;
  if (dl?.status === 'in_progress') {
    const days =
      dl.date && !/^\d{4}$/.test(dl.date)
        ? differenceInDays(new Date(), parseISO(dl.date))
        : null;
    signals.push({
      id: 'austin',
      label: 'AUSTIN TX',
      value: days !== null ? `INTERNAL TESTING — Day ${days}` : 'INTERNAL DRIVERLESS TESTING',
      color: 'text-yellow-400',
    });
  } else if (dl?.status === 'completed' && dl.date && !/^\d{4}$/.test(dl.date)) {
    const days = differenceInDays(new Date(), parseISO(dl.date));
    if (days >= 0) {
      signals.push({ id: 'austin', label: 'AUSTIN TX', value: `PUBLIC DRIVERLESS — Day ${days}`, color: 'text-green-400' });
    }
  }

  if (stats.citiesWithDriverless > 0) {
    signals.push({
      id: 'dl-cities',
      label: 'DRIVERLESS',
      value: `${stats.citiesWithDriverless} ${stats.citiesWithDriverless === 1 ? 'CITY' : 'CITIES'} LIVE`,
      color: 'text-red-400',
    });
  }

  if (stats.totalVehicles > 0) {
    signals.push({ id: 'tsla-fleet', label: 'TESLA FLEET', value: `${stats.totalVehicles}+ VEHICLES TRACKED`, color: 'text-neutral-300' });
  }

  return signals;
}

function buildXTickerSignals(intel: XIntelPayload): TickerItem[] {
  const items: TickerItem[] = [];
  const hl = intel.narrativeHalfLife;
  items.push({
    id: 'x-halflife',
    label: 'X HALF-LIFE',
    value: `${hl.label.toUpperCase()} · ${hl.daysSinceLastSignal}D`,
    color: hl.label === 'fresh' ? 'text-green-400' : hl.label === 'stale' ? 'text-red-400' : 'text-yellow-400',
  });
  if (intel.channelDivergence.gapDays >= 0) {
    items.push({
      id: 'x-divergence',
      label: 'CHANNELS',
      value: intel.channelDivergence.label.toUpperCase(),
      color: intel.channelDivergence.label === 'aligned' ? 'text-green-400' : 'text-orange-400',
    });
  }
  const topSignal = intel.shadowSignals[0];
  if (topSignal) {
    items.push({
      id: 'x-signal',
      label: 'SHADOW',
      value: topSignal.text.length > 60 ? topSignal.text.slice(0, 60) + '…' : topSignal.text,
      color: 'text-cyan-400',
    });
  }
  return items;
}

export function ShadowmodeHero({ states, intel }: ShadowmodeHeroProps) {
  const signals = [
    ...buildTickerSignals(states),
    ...(intel ? buildXTickerSignals(intel) : []),
  ];
  return (
    <section className="mb-8">
      {/* Signal Ticker — full width */}
      <HeroTicker signals={signals} />

      {/* Hero: wider left column + 16:9 video above map on the right */}
      <div className="mt-6 grid grid-cols-1 items-start gap-4 lg:mt-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <HeroOpsPanel states={states} intel={intel} />
        </div>

        <div className="flex flex-col gap-3 lg:col-span-5">
          <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl border border-neutral-800 bg-black">
            <TeslaVideoFeed />
          </div>
          <div className="min-h-[340px]">
            <DeploymentPulseMap states={states} />
          </div>
        </div>
      </div>
    </section>
  );
}
