'use client';

import { useEffect, useState, useRef } from 'react';

interface TickerItem {
  id: string;
  label: string;
  value: string;
  color: string;
  icon?: string;
}

export function HeroTicker() {
  const [items, setItems] = useState<TickerItem[]>([
    { id: 'tsla-loading', label: 'TSLA', value: '...', color: 'text-neutral-500', icon: '$' },
    { id: 'elon-loading', label: 'ELON', value: 'loading...', color: 'text-neutral-600' },
    { id: 'robotaxi-loading', label: '@ROBOTAXI', value: 'loading...', color: 'text-neutral-600' },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const [stockRes, tweetRes] = await Promise.allSettled([
        fetch('/api/stock'),
        fetch('/api/tweets'),
      ]);

      const newItems: TickerItem[] = [];

      if (stockRes.status === 'fulfilled' && stockRes.value.ok) {
        const d = await stockRes.value.json();
        const up = d.change >= 0;
        newItems.push({
          id: 'tsla',
          label: 'TSLA',
          value: `$${d.price.toFixed(2)} ${up ? '+' : ''}${d.changePercent.toFixed(2)}%`,
          color: up ? 'text-green-400' : 'text-red-400',
          icon: up ? '▲' : '▼',
        });
        if (d.isMarketOpen) {
          newItems.push({ id: 'market', label: 'MARKET', value: 'OPEN', color: 'text-green-500' });
        }
      }

      if (tweetRes.status === 'fulfilled' && tweetRes.value.ok) {
        const d = await tweetRes.value.json();
        if (d.robotaxi?.text) {
          newItems.push({
            id: 'robotaxi',
            label: '@ROBOTAXI',
            value: d.robotaxi.text.length > 80 ? d.robotaxi.text.slice(0, 80) + '…' : d.robotaxi.text,
            color: 'text-white',
          });
        }
        if (d.elon?.text) {
          newItems.push({
            id: 'elon',
            label: 'ELON',
            value: d.elon.text.length > 80 ? d.elon.text.slice(0, 80) + '…' : d.elon.text,
            color: 'text-neutral-300',
          });
        }
      }

      // Static signals
      newItems.push(
        { id: 'austin', label: 'AUSTIN TX', value: 'DRIVERLESS — Day 44+', color: 'text-red-400' },
        { id: 'waymo', label: 'WAYMO', value: '12 US CITIES AUTONOMOUS', color: 'text-blue-400' },
        { id: 'tsla-fleet', label: 'TESLA FLEET', value: '45 VEHICLES IN SERVICE', color: 'text-neutral-300' },
      );

      if (newItems.length > 0) setItems(newItems);
    }

    load();
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Duplicate items for seamless loop
  const doubled = [...items, ...items];

  return (
    <div className="w-full bg-neutral-950 border-b border-neutral-800 overflow-hidden h-8 flex items-center">
      <div className="flex-shrink-0 px-3 border-r border-neutral-800 h-full flex items-center">
        <span className="text-[9px] font-bold tracking-widest text-neutral-600 uppercase">LIVE</span>
        <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
      </div>
      <div className="flex-1 overflow-hidden relative">
        <div
          ref={scrollRef}
          className="flex items-center gap-0 animate-ticker whitespace-nowrap"
          style={{ animationDuration: `${items.length * 8}s` }}
        >
          {doubled.map((item, i) => (
            <div key={`${item.id}-${i}`} className="flex items-center gap-1.5 px-4 border-r border-neutral-900">
              <span className="text-[9px] font-bold tracking-widest text-neutral-600 uppercase flex-shrink-0">
                {item.label}
              </span>
              {item.icon && (
                <span className={`text-[9px] ${item.color}`}>{item.icon}</span>
              )}
              <span className={`text-[10px] ${item.color} flex-shrink-0`}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
