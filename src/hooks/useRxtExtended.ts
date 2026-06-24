'use client';

import { useEffect, useState } from 'react';
import type { RxtExtendedPayload } from '@/types/rxt-extended';

export function useRxtExtended() {
  const [data, setData] = useState<RxtExtendedPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/rxt/extended');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as RxtExtendedPayload;
        if (!cancelled) {
          setData(json);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'fetch failed');
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}