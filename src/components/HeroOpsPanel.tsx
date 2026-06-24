'use client';

import { useMemo } from 'react';
import { differenceInDays, parseISO } from 'date-fns';
import { Activity, Building2, Car, MapPin, Shield, Users } from 'lucide-react';
import type { State } from '@/types/robotaxi';
import type { XIntelPayload } from '@/types/x-intel';
import type { RxtArea } from '@/types/robotaxi-tracker';
import { MetricCard } from '@/components/MetricCard';
import { RobotaxiTrackerStrip } from '@/components/RobotaxiTrackerStrip';
import { HeroEcosystemOverview } from '@/components/HeroEcosystemOverview';
import { CommunityOpsPanel } from '@/components/rxt/CommunityOpsPanel';
import { UnsupervisedMonitorPanel } from '@/components/rxt/UnsupervisedMonitorPanel';
import { RegulatoryCrosscheckPanel } from '@/components/rxt/RegulatoryCrosscheckPanel';
import { useRobotaxiTracker } from '@/hooks/useRobotaxiTracker';
import { useRxtExtended } from '@/hooks/useRxtExtended';
import { getRxtAreaStats } from '@/lib/robotaxi-tracker';
import {
  calculateStats,
  getMilestoneCount,
  formatShortDate,
} from '@/lib/utils';

const HERO_RXT_AREAS: RxtArea[] = ['austin'];

interface HeroOpsPanelProps {
  states: State[];
  intel?: XIntelPayload | null;
}

function getLeadTestingCity(states: State[]) {
  for (const state of states) {
    for (const city of state.cities) {
      const ms = city.milestones.no_safety_monitor;
      if (ms.status === 'in_progress' || ms.status === 'completed') {
        return { city, state, milestone: ms };
      }
    }
  }
  return null;
}

export function HeroOpsPanel({ states }: HeroOpsPanelProps) {
  const { data: rxtData, loading: rxtLoading, error: rxtError } = useRobotaxiTracker(HERO_RXT_AREAS);
  const { data: rxtExtended, loading: rxtExtLoading } = useRxtExtended();
  const austinRxt = getRxtAreaStats(rxtData, 'austin');
  const communityFleetTotal = rxtData?.areas.reduce((sum, a) => sum + a.riderVehicles, 0);

  const stats = useMemo(() => calculateStats(states), [states]);
  const permits = useMemo(() => getMilestoneCount(states, 'permit_received'), [states]);
  const leadMarket = useMemo(() => getLeadTestingCity(states), [states]);

  const testingCount = useMemo(() => {
    let count = 0;
    states.forEach((s) =>
      s.cities.forEach((c) => {
        if (c.milestones.no_safety_monitor.status === 'in_progress') count++;
      })
    );
    return count;
  }, [states]);

  const leadDays =
    leadMarket?.milestone.date && !/^\d{4}$/.test(leadMarket.milestone.date)
      ? differenceInDays(new Date(), parseISO(leadMarket.milestone.date))
      : null;

  const isInternalOnly = leadMarket?.milestone.status === 'in_progress';
  const isPublicDriverless = leadMarket?.milestone.status === 'completed';

  const leadSubtitle =
    leadDays !== null && isInternalOnly
      ? `${leadDays}d internal tests${leadMarket?.milestone.date ? ` · ${formatShortDate(leadMarket.milestone.date)}` : ''}`
      : isPublicDriverless
        ? 'Public driverless operation'
        : 'Tracking deployment status';

  return (
    <div className="flex flex-col rounded-xl border border-neutral-800 bg-neutral-950">
      <div className="flex shrink-0 items-center gap-2 border-b border-neutral-800 px-4 py-2.5">
        <div className="h-4 w-1 rounded-full bg-gradient-to-b from-green-500 via-cyan-500 to-purple-500" />
        <span className="text-xs font-semibold text-white">Digital Energy Terminal</span>
        <span className="ml-auto text-[9px] uppercase tracking-widest text-neutral-600">Tesla ecosystem</span>
      </div>

      {/* Ecosystem overview — fuller picture above video */}
      <HeroEcosystemOverview states={states} />

      {/* Robotaxi ops — pushed below ecosystem */}
      <div id="deployment-pulse" className="px-3 py-2.5 pb-3 font-mono uppercase tracking-wide">
        <div className="mb-2 flex items-center gap-2">
          <div className="h-3 w-0.5 rounded-full bg-cyan-500" />
          <span className="text-[10px] font-semibold text-neutral-400">DEPLOYMENT PULSE</span>
          <span className="text-[8px] text-neutral-600">ROBOTAXI OPS</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <MetricCard
            label="Cities"
            value={stats.totalCities}
            subtitle="Being tracked"
            icon={<MapPin className="h-4 w-4 text-neutral-400" />}
          />
          <MetricCard
            label="States"
            value={stats.statesCount}
            subtitle="With robotaxi activity"
            icon={<Building2 className="h-4 w-4 text-neutral-400" />}
          />
          <MetricCard
            label="Fleet"
            value={stats.totalVehicles > 0 ? `${stats.totalVehicles}+` : '—'}
            subtitle="Vehicles deployed"
            icon={<Car className="h-4 w-4 text-green-400" />}
          />
          <MetricCard
            label="Permits"
            value={`${permits.completed}/${permits.total}`}
            subtitle="Received across markets"
            icon={<Activity className="h-4 w-4 text-purple-400" />}
          />
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <MetricCard
            label="Public programs"
            value={stats.citiesWithPublicProgram}
            subtitle="Test programs launched"
            icon={<Users className="h-4 w-4 text-blue-400" />}
          />
          <MetricCard
            label="Testing"
            value={testingCount}
            subtitle="Driverless in progress"
            icon={<Shield className="h-4 w-4 text-yellow-400" />}
            valueClassName={testingCount > 0 ? 'text-yellow-400' : 'text-white'}
            highlight={testingCount > 0}
          />
        </div>

        {leadMarket && (
          <div className="mt-2">
            <MetricCard
              highlight={isInternalOnly}
              label="Lead market"
              value={leadDays ?? '—'}
              subtitle={`${leadMarket.city.name}, ${leadMarket.state.abbreviation} · ${leadSubtitle}`}
              icon={<Shield className={`h-4 w-4 ${isPublicDriverless ? 'text-green-400' : 'text-yellow-400'}`} />}
              valueClassName={isPublicDriverless ? 'text-green-400' : 'text-yellow-400'}
              trailing={
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[7px] font-bold uppercase ${
                    isPublicDriverless ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
                  }`}
                >
                  {isPublicDriverless ? 'Driverless' : 'Testing'}
                </span>
              }
            />
          </div>
        )}

        <div className="mt-2 space-y-2 pb-2">
          <RobotaxiTrackerStrip stats={austinRxt} loading={rxtLoading} error={rxtError} compact />
          <CommunityOpsPanel data={rxtExtended?.communityOps ?? null} loading={rxtExtLoading} />
          <UnsupervisedMonitorPanel data={rxtExtended} loading={rxtExtLoading} />
          <RegulatoryCrosscheckPanel
            data={rxtExtended?.regulatory ?? null}
            communityFleetTotal={communityFleetTotal}
            loading={rxtExtLoading}
          />
        </div>
      </div>
    </div>
  );
}