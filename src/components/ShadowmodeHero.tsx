'use client';

import type { State } from '@/types/robotaxi';
import { HeroTicker } from './HeroTicker';
import { MissionClock } from './MissionClock';
import { DeploymentPulseMap } from './DeploymentPulseMap';

interface ShadowmodeHeroProps {
  states: State[];
}

export function ShadowmodeHero({ states }: ShadowmodeHeroProps) {
  return (
    <section className="mb-6">
      {/* Signal Ticker — full width */}
      <HeroTicker />

      {/* 2-col hero panel */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 mt-3" style={{ minHeight: '420px' }}>
        {/* Mission Clock — 2/5 */}
        <div className="lg:col-span-2">
          <MissionClock states={states} />
        </div>

        {/* Pulse Map — 3/5 */}
        <div className="lg:col-span-3">
          <DeploymentPulseMap states={states} />
        </div>
      </div>
    </section>
  );
}
