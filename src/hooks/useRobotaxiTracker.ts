'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { RxtArea, RxtPayload } from '@/types/robotaxi-tracker';

const DEFAULT_AREAS: RxtArea[] = ['austin'];

export function useRobotaxiTracker(areas: RxtArea[] = DEFAULT_AREAS) {
  const areasKey = areas.join(',');
  const [data, setData] = useState<RxtPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasData = useRef(false);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent && !hasData.current) setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/rxt?areas=${areasKey}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as RxtPayload;
      setData(json);
      hasData.current = true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [areasKey]);

  useEffect(() => {
    hasData.current = false;
    setData(null);
    fetchData(false);
    const timer = setInterval(() => fetchData(true), 15 * 60 * 1000);
    return () => clearInterval(timer);
  }, [fetchData]);

  return { data, loading, error, refresh: () => fetchData(false) };
}