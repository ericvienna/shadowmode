'use client';

import { useCallback, useEffect, useState } from 'react';
import type { XIntelPayload } from '@/types/x-intel';

export function useXIntel(refreshMs = 15 * 60 * 1000) {
  const [intel, setIntel] = useState<XIntelPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/x-intel');
      if (!res.ok) throw new Error('X intel unavailable');
      setIntel(await res.json());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load X intel');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, refreshMs);
    return () => clearInterval(interval);
  }, [refresh, refreshMs]);

  return { intel, loading, error, refresh };
}