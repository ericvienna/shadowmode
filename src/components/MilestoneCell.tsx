'use client';

import { useState } from 'react';
import type { Milestone, MilestoneDefinition } from '@/types/robotaxi';
import { getStatusColor, formatShortDate, isRecentMilestone } from '@/lib/utils';
import { Check, Clock, HelpCircle, Minus, Circle } from 'lucide-react';

interface MilestoneCellProps {
  milestone: Milestone;
  definition: MilestoneDefinition;
}

export function MilestoneCell({ milestone, definition }: MilestoneCellProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const getIcon = () => {
    switch (milestone.status) {
      case 'completed':
        return <Check className="w-3.5 h-3.5 text-green-400" />;
      case 'in_progress':
        return <Clock className="w-3.5 h-3.5 text-yellow-400" />;
      case 'unknown':
        return <HelpCircle className="w-3.5 h-3.5 text-neutral-500" />;
      case 'n/a':
        return <Minus className="w-3.5 h-3.5 text-neutral-600" />;
      case 'not_started':
      default:
        return <Circle className="w-2.5 h-2.5 text-neutral-700" />;
    }
  };

  // For in_progress with a value (like "2" for pending jobs), show the number
  const getDisplayContent = () => {
    if (milestone.status === 'in_progress' && milestone.value) {
      return (
        <span className="text-yellow-400 text-[10px] font-medium ml-0.5">
          {milestone.value}
        </span>
      );
    }
    return null;
  };

  return (
    <td
      className="relative px-1.5 py-1.5 text-center border-r border-neutral-800/50"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className={`inline-flex items-center justify-center gap-0.5 cursor-default rounded-full p-1 ${
        isRecentMilestone(milestone, 30) ? 'pulse-recent-green' :
        milestone.status === 'in_progress' && milestone.value ? 'pulse-recent-yellow' : ''
      }`}>
        {getIcon()}
        {getDisplayContent()}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute z-[200] bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl min-w-[200px] text-left pointer-events-none">
          <div className="text-white font-medium text-xs mb-1">
            {definition.label}
          </div>
          <div className="text-neutral-400 text-[10px] mb-2">
            {definition.description}
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <span
              className={`px-1.5 py-0.5 rounded capitalize border ${getStatusColor(
                milestone.status
              )}`}
            >
              {milestone.status.replace('_', ' ')}
            </span>
            {milestone.date && (
              <span className="text-neutral-300">{formatShortDate(milestone.date)}</span>
            )}
            {milestone.value && (
              <span className="text-neutral-300">{milestone.value}</span>
            )}
          </div>
          {milestone.notes && (
            <div className="mt-2 text-[10px] text-neutral-500">
              {milestone.notes}
            </div>
          )}
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-neutral-700" />
        </div>
      )}
    </td>
  );
}
