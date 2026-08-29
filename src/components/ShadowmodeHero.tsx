'use client';

import { differenceInDays, parseISO } from 'date-fns';
import type { State } from '@/types/robotaxi';
import type { XIntelPayload } from '@/types/x-intel';
import { HeroTicker, type TickerItem } from './HeroTicker';
import { HeroOpsPanel } from './HeroOpsPanel';
import { DeploymentPulseMap } from './DeploymentPulseMap';
import { TeslaVideoFeed } from './TeslaVideoFeed';
import { calculateStats, formatShortDate } from '@/lib/utils';

interface ShadowmodeHeroProps {
  states: State[];
  intel?: XIntelPayload | null;
}

// How long a fresh market launch owns the hero before the banner retires itself.
const LAUNCH_BANNER_WINDOW_DAYS = 30;

interface NewestLaunch {
  cityName: string;
  stateAbbr: string;
  date: string;
  days: number;
  unsupervisedDayOne: boolean;
}

// Newest public launch, derived from the live milestone data — never hardcode a
// city here. The banner and ticker item retire on their own as the launch ages.
function findNewestLaunch(states: State[]): NewestLaunch | null {
  let newest: NewestLaunch | null = null;
  for (const state of states) {
    for (const city of state.cities) {
      const launch = city.milestones.public_test_program_launched;
      if (launch?.status !== 'completed' || !launch.date || /^\d{4}$/.test(launch.date)) continue;
      if (newest && launch.date <= newest.date) continue;
      const dl = city.milestones.no_safety_monitor;
      newest = {
        cityName: city.name,
        stateAbbr: state.abbreviation,
        date: launch.date,
        days: differenceInDays(new Date(), parseISO(launch.date)),
        unsupervisedDayOne: dl?.status === 'completed' && dl.date === launch.date,
      };
    }
  }
  return newest;
}

// Build the ticker's data-derived signals from the live milestone data, so the
// "LIVE" ticker never shows frozen numbers. Austin's driverless line honors the
// actual milestone status (a real day-count only when it's actually completed).
function buildTickerSignals(states: State[]): TickerItem[] {
  const stats = calculateStats(states);
  const signals: TickerItem[] = [];

  const launch = findNewestLaunch(states);
  if (launch && launch.days >= 0 && launch.days <= LAUNCH_BANNER_WINDOW_DAYS) {
    signals.push({
      id: 'new-market',
      label: `${launch.cityName.toUpperCase()} ${launch.stateAbbr}`,
      value: `LIVE — DAY ${launch.days}${launch.unsupervisedDayOne ? ' · UNSUPERVISED DAY ONE' : ''}`,
      color: 'text-green-400',
    });
  }

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

function LaunchBanner({ launch }: { launch: NewestLaunch }) {
  return (
    <div className="mt-4 flex items-center gap-3 overflow-hidden rounded-xl border border-green-500/30 bg-green-500/5 px-4 py-3 font-mono uppercase tracking-wide">
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
      </span>
      <div className="min-w-0">
        <div className="text-[9px] font-semibold tracking-widest text-green-500">New market live</div>
        <div className="truncate text-sm font-bold text-white sm:text-base">
          {launch.cityName}, {launch.stateAbbr}
          <span className="ml-2 font-normal text-neutral-400">
            public rides since {formatShortDate(launch.date)}
            {launch.unsupervisedDayOne ? ' · unsupervised day one' : ''}
          </span>
        </div>
      </div>
      <div className="ml-auto shrink-0 text-right">
        <div className="text-lg font-bold leading-none text-green-400 sm:text-xl">Day {launch.days}</div>
        <div className="text-[8px] tracking-widest text-neutral-600">In service</div>
      </div>
    </div>
  );
}

export function ShadowmodeHero({ states, intel }: ShadowmodeHeroProps) {
  const signals = [
    ...buildTickerSignals(states),
    ...(intel ? buildXTickerSignals(intel) : []),
  ];
  const launch = findNewestLaunch(states);
  const showLaunchBanner = launch !== null && launch.days >= 0 && launch.days <= LAUNCH_BANNER_WINDOW_DAYS;
  return (
    <section className="mb-8">
      {/* Signal Ticker — full width */}
      <HeroTicker signals={signals} />

      {/* Newest-market launch banner — data-derived, self-retiring */}
      {showLaunchBanner && launch && <LaunchBanner launch={launch} />}

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
