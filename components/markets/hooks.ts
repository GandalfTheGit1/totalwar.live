'use client';

import { useCallback, useEffect, useState } from 'react';
import type { AccountSummary, PmEvent } from '@/lib/services/prediction-markets/types';

export function useMarkets(tag: string, query: string) {
  const [events, setEvents] = useState<PmEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    else if (tag) params.set('tag', tag);

    setLoading(true);
    setError(null);
    // Debounce typing: search is only sent after a short pause.
    const timer = setTimeout(
      () => {
        fetch(`/api/markets?${params}`, { signal: controller.signal })
          .then(async (res) => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? 'No se pudieron cargar los mercados.');
            setEvents(data.events as PmEvent[]);
          })
          .catch((err) => {
            if (err.name !== 'AbortError') setError(err.message);
          })
          .finally(() => {
            if (!controller.signal.aborted) setLoading(false);
          });
      },
      query ? 350 : 0
    );

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [tag, query]);

  return { events, loading, error };
}

export function usePaperAccount() {
  const [account, setAccount] = useState<AccountSummary | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(async (url: string, init?: RequestInit) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(url, init);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Error del simulador.');
      setAccount(data as AccountSummary);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void request('/api/paper/account');
    // Refresh marks and settlements periodically.
    const timer = setInterval(() => void request('/api/paper/account'), 60_000);
    return () => clearInterval(timer);
  }, [request]);

  const post = (url: string, body: object) =>
    request(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

  return {
    account,
    busy,
    error,
    clearError: () => setError(null),
    placeBet: (input: { marketId: string; outcomeIndex: 0 | 1; stake: number; eventSlug: string; eventTitle: string }) =>
      post('/api/paper/bets', input),
    closePosition: (positionId: string) => post('/api/paper/close', { positionId }),
    reset: () => request('/api/paper/account', { method: 'DELETE' }),
  };
}
