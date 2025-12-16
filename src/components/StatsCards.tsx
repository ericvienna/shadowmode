'use client';

import type { State } from '@/types/robotaxi';
import { calculateStats } from '@/lib/utils';
import {
  MapPin,
  Car,
  CheckCircle2,
  Users,
  Building2,
  Zap,
} from 'lucide-react';

interface StatsCardsProps {
  states: State[];
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  highlight?: boolean;
}

function StatCard({ title, value, subtitle, icon, highlight }: StatCardProps) {
  return (
    <div
      className={`bg-neutral-950 border rounded-xl p-4 ${
        highlight
          ? 'border-green-500/30 bg-green-500/5'
          : 'border-neutral-800'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={`p-2 rounded-lg ${
            highlight
              ? 'bg-green-500/10 text-green-400'
              : 'bg-neutral-800 text-neutral-400'
          }`}
        >
          {icon}
        </div>
      </div>
      <div
        className={`text-2xl font-bold mb-1 ${
          highlight ? 'text-green-400' : 'text-white'
        }`}
      >
        {value}
      </div>
      <div className="text-xs text-neutral-400 uppercase">{title}</div>
      <div className="text-[10px] text-neutral-600 mt-1">{subtitle}</div>
    </div>
  );
}

export function StatsCards({ states }: StatsCardsProps) {
  const stats = calculateStats(states);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <StatCard
        title="States"
        value={stats.statesCount}
        subtitle="With Robotaxi activity"
        icon={<Building2 className="w-5 h-5" />}
      />
      <StatCard
        title="Cities"
        value={stats.totalCities}
        subtitle="Being tracked"
        icon={<MapPin className="w-5 h-5" />}
      />
      <StatCard
        title="Active Cities"
        value={stats.citiesWithActivity}
        subtitle="With any progress"
        icon={<Zap className="w-5 h-5" />}
      />
      <StatCard
        title="Public Programs"
        value={stats.citiesWithPublicProgram}
        subtitle="Test programs launched"
        icon={<Users className="w-5 h-5" />}
      />
      <StatCard
        title="Est. Vehicles"
        value={`${stats.totalVehicles}+`}
        subtitle="Deployed total"
        icon={<Car className="w-5 h-5" />}
      />
      <StatCard
        title="Driverless"
        value={stats.citiesWithDriverless}
        subtitle="No safety monitor"
        icon={<CheckCircle2 className="w-5 h-5" />}
        highlight={stats.citiesWithDriverless > 0}
      />
    </div>
  );
}
