'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface LiveTimestampProps {
  lastUpdated: string;
}

export function LiveTimestamp({ lastUpdated }: LiveTimestampProps) {
  const [timeAgo, setTimeAgo] = useState('');
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    const updateTime = () => {
      setTimeAgo(formatDistanceToNow(new Date(lastUpdated), { addSuffix: true }));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [lastUpdated]);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5">
        <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-neutral-500'}`} />
        <span className="text-[10px] text-neutral-400 uppercase">
          {isLive ? 'Live' : 'Offline'}
        </span>
      </div>
      <span className="text-neutral-600 text-[10px]">•</span>
      <span className="text-neutral-400 text-[10px]">
        Updated {timeAgo}
      </span>
    </div>
  );
}
