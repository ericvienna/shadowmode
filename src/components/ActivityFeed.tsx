'use client';

import { useEffect, useState } from 'react';
import type { State } from '@/types/robotaxi';
import { getRecentActivity, formatDate, type ActivityItem } from '@/lib/utils';
import { Check, Clock, Zap, MapPin } from 'lucide-react';

interface ActivityFeedProps {
  states: State[];
}

export function ActivityFeed({ states }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    setActivities(getRecentActivity(states, 365)); // Get last year of activity
  }, [states]);

  const getActivityIcon = (milestoneType: string) => {
    if (milestoneType === 'no_safety_monitor') {
      return <Zap className="w-3 h-3 text-green-400" />;
    }
    return <Check className="w-3 h-3 text-green-400" />;
  };

  const getDaysAgoLabel = (daysAgo: number) => {
    if (daysAgo === 0) return 'Today';
    if (daysAgo === 1) return 'Yesterday';
    if (daysAgo < 7) return `${daysAgo}d ago`;
    if (daysAgo < 30) return `${Math.floor(daysAgo / 7)}w ago`;
    return `${Math.floor(daysAgo / 30)}mo ago`;
  };

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
        <h3 className="text-white text-xs font-semibold flex items-center gap-2">
          <Clock className="w-4 h-4 text-yellow-500" />
          Recent Activity
        </h3>
        <span className="text-[10px] text-neutral-500">{activities.length} events</span>
      </div>

      <div className="max-h-[500px] overflow-y-auto">
        {activities.slice(0, visibleCount).map((activity, index) => (
          <div
            key={activity.id}
            className={`px-4 py-3 border-b border-neutral-800/50 hover:bg-neutral-900/50 transition-colors animate-fade-in ${
              activity.daysAgo <= 7 ? 'bg-green-500/5' : ''
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 p-1.5 rounded-full ${
                activity.milestoneType === 'no_safety_monitor'
                  ? 'bg-green-500/20'
                  : 'bg-neutral-800'
              }`}>
                {getActivityIcon(activity.milestoneType)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white text-xs font-medium">
                    {activity.cityName}
                  </span>
                  <span className="text-neutral-500 text-[10px]">
                    {activity.stateAbbr}
                  </span>
                  {activity.daysAgo <= 7 && (
                    <span className="px-1.5 py-0.5 text-[8px] font-semibold bg-green-500/20 text-green-400 rounded">
                      NEW
                    </span>
                  )}
                </div>
                <p className="text-neutral-400 text-[10px] truncate">
                  {activity.milestoneLabel}
                </p>
              </div>
              <div className="text-right">
                <span className={`text-[10px] ${
                  activity.daysAgo <= 7 ? 'text-green-400' : 'text-neutral-500'
                }`}>
                  {getDaysAgoLabel(activity.daysAgo)}
                </span>
                <p className="text-neutral-600 text-[9px]">
                  {formatDate(activity.date)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {visibleCount < activities.length && (
        <button
          onClick={() => setVisibleCount(prev => prev + 10)}
          className="w-full px-4 py-2 text-[10px] text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
        >
          Show more ({activities.length - visibleCount} remaining)
        </button>
      )}
    </div>
  );
}
