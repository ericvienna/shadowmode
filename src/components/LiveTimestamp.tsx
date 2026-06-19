'use client';

import { useEffect, useState, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface LiveTimestampProps {
  lastUpdated: string;
}

export function LiveTimestamp({ lastUpdated }: LiveTimestampProps) {
  const [pageLoadTime] = useState(() => new Date());
  const [timeAgo, setTimeAgo] = useState(() =>
    formatDistanceToNow(pageLoadTime, { addSuffix: true })
  );
  const [isLive] = useState(true);

  const updateTime = useCallback(() => {
    setTimeAgo(formatDistanceToNow(pageLoadTime, { addSuffix: true }));
  }, [pageLoadTime]);

  useEffect(() => {
    const interval = setInterval(updateTime, 60000); // Update display every minute

    // Auto-refresh page every 10 minutes to get fresh data
    const refreshInterval = setInterval(() => {
      window.location.reload();
    }, 10 * 60 * 1000);

    return () => {
      clearInterval(interval);
      clearInterval(refreshInterval);
    };
  }, [updateTime]);

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-1">
        <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-neutral-500'}`} />
        <span className="text-[9px] text-neutral-400 uppercase">
          {isLive ? 'Live' : 'Offline'}
        </span>
      </div>
      <span className="text-neutral-600 text-[9px]">•</span>
      <span className="text-neutral-400 text-[9px]">
        {timeAgo}
      </span>
      <span className="text-neutral-600 text-[9px] hidden sm:inline">•</span>
      <span className="text-neutral-500 text-[8px] hidden sm:inline">
        ↻10m
      </span>
    </div>
  );
}
