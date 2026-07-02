'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Battery } from 'lucide-react';
import { EnergyPanel } from './EnergyPanel';
import { VerticalNav } from '../shared/VerticalNav';
import { TeslaVideoFeed } from '../TeslaVideoFeed';
import { ENERGY_HERO_CLIPS } from '@/lib/tesla-hero-videos';

export function EnergyPageShell() {
  return (
    <div className="min-h-screen bg-black">
      <header className="bg-black/80 backdrop-blur border-b border-neutral-800 sticky top-0 z-50">
        <div className="w-full px-3 sm:px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="p-1.5 hover:bg-neutral-900 rounded-lg transition-colors" title="Robotaxi">
                <ArrowLeft className="w-4 h-4 text-neutral-400" />
              </Link>
              <Image
                src="/shadowmode-logo.svg"
                alt="SHADOWMODE"
                width={160}
                height={28}
                className="h-7 w-auto object-contain"
              />
              <div className="hidden sm:flex items-center gap-2">
                <Battery className="w-3.5 h-3.5 text-green-400" />
                <span className="text-[10px] text-neutral-400 uppercase tracking-wide">Tesla Energy</span>
                <span className="px-1.5 py-0.5 text-[8px] font-semibold bg-green-500/20 text-green-400 rounded border border-green-500/30">
                  LIVE
                </span>
              </div>
            </div>
            <VerticalNav active="energy" />
          </div>
        </div>
      </header>

      <main className="w-full px-3 sm:px-4 lg:px-6 py-6">
        <div className="relative mb-6 h-52 w-full overflow-hidden rounded-xl border border-neutral-800 bg-black md:h-64 lg:h-80">
          <TeslaVideoFeed clips={ENERGY_HERO_CLIPS} />
        </div>
        <EnergyPanel />
      </main>
    </div>
  );
}