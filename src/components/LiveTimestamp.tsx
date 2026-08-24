'use client';

import { useEffect, useState, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface LiveTimestampProps {
  lastUpdated: string;
}

/* FIXED 2026-08-24: this component took `lastUpdated` and NEVER USED IT.
   It measured formatDistanceToNow(pageLoadTime) — page load to now — which is
   always ~0, so it rendered "less than a minute ago" on data of any age. And
   `isLive` was hardcoded true, so the pulsing green LIVE dot could never turn
   off. Together they asserted, on every render, that whatever was on screen was
   current — while the dashboard was serving July figures. The correct value was
   already being passed in and thrown away.
   Now the age is measured from lastUpdated, and "Live" means recent (<24h)
   rather than meaning nothing. A dashboard may show old data; it may not claim
   the data is new. */
export function LiveTimestamp({ lastUpdated }: LiveTimestampProps) {
  const updatedAt = (() => {
    const d = new Date(lastUpdated);
    return isNaN(d.getTime()) ? null : d;
  })();
  const [timeAgo, setTimeAgo] = useState(() =>
    updatedAt ? formatDistanceToNow(updatedAt, { addSuffix: true }) : 'date unknown'
  );
  // Fail closed: an unparseable or missing date is NOT live.
  const isLive =
    updatedAt !== null && Date.now() - updatedAt.getTime() < 24 * 60 * 60 * 1000;

  const updateTime = useCallback(() => {
    setTimeAgo(
      updatedAt ? formatDistanceToNow(updatedAt, { addSuffix: true }) : 'date unknown'
    );
  }, [updatedAt]);

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
          {isLive ? 'Live' : 'Static'}
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
