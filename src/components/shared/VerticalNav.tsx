'use client';

import Link from 'next/link';
import { Battery, Car, Truck } from 'lucide-react';

export type VerticalId = 'robotaxi' | 'energy' | 'semi';

interface VerticalNavProps {
  active: VerticalId;
  compact?: boolean;
}

const VERTICALS: { id: VerticalId; href: string; label: string; icon: typeof Car }[] = [
  { id: 'robotaxi', href: '/', label: 'Robotaxi', icon: Car },
  { id: 'energy', href: '/energy', label: 'Energy', icon: Battery },
  { id: 'semi', href: '/semi', label: 'Semi', icon: Truck },
];

export function VerticalNav({ active, compact }: VerticalNavProps) {
  return (
    <nav className={`flex items-center gap-1.5 ${compact ? 'text-[8px]' : 'text-[9px]'}`}>
      {VERTICALS.map((v) => {
        const Icon = v.icon;
        const isActive = v.id === active;
        return (
          <Link
            key={v.id}
            href={v.href}
            className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
              isActive
                ? v.id === 'energy'
                  ? 'text-green-400 border border-green-500/30 bg-green-500/10'
                  : v.id === 'semi'
                    ? 'text-purple-400 border border-purple-500/30 bg-purple-500/10'
                    : 'text-white border border-neutral-600 bg-neutral-800'
                : 'text-neutral-500 hover:text-white'
            }`}
          >
            <Icon className="w-3 h-3" />
            {v.label}
          </Link>
        );
      })}
    </nav>
  );
}