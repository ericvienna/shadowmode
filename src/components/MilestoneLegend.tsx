'use client';

import { getStatusColor } from '@/lib/utils';
import { Check, Clock, HelpCircle, Minus, Circle } from 'lucide-react';
import { EpistemicStamp } from './EpistemicStamp';

export function MilestoneLegend() {
  const statuses = [
    { status: 'completed' as const, label: 'Completed', icon: <Check className="w-3 h-3" /> },
    { status: 'in_progress' as const, label: 'In Progress', icon: <Clock className="w-3 h-3" /> },
    { status: 'not_started' as const, label: 'Not Started', icon: <Circle className="w-3 h-3" /> },
    { status: 'unknown' as const, label: 'Unknown', icon: <HelpCircle className="w-3 h-3" /> },
    { status: 'n/a' as const, label: 'N/A', icon: <Minus className="w-3 h-3" /> },
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 p-3 bg-neutral-950 border border-neutral-800 rounded-lg">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[10px] text-neutral-500 uppercase font-medium">Legend:</span>
        {statuses.map(({ status, label, icon }) => (
          <div
            key={status}
            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-medium border ${getStatusColor(
              status
            )}`}
          >
            {icon}
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2 border-l border-neutral-800 pl-4">
        <span className="text-[10px] text-neutral-500 uppercase font-medium">Every number wears one:</span>
        <EpistemicStamp tier="sourced" />
        <span className="text-[9px] text-neutral-600">primary source</span>
        <EpistemicStamp tier="modeled" />
        <span className="text-[9px] text-neutral-600">our estimate</span>
        <EpistemicStamp tier="claimed" />
        <span className="text-[9px] text-neutral-600">said, not verified</span>
      </div>
    </div>
  );
}
