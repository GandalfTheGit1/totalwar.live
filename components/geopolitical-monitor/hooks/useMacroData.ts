import { useState, useCallback, useRef, useEffect } from 'react';
import { CountryMacroData } from '../types';
import { geoCache, geoCacheKeys, GEO_CACHE_TTLS } from '@/lib/cache/geo-indexeddb-cache';

export function useMacroData() {
  const [macroCache, setMacroCache] = useState<Record<string, CountryMacroData>>({});
  const [macroLoadingISO, setMacroLoadingISO] = useState<string | null>(null);
  const [macroError, setMacroError] = useState<string | null>(null);

  const macroCacheRef = useRef<Record<string, CountryMacroData>>({});
  const inFlightRequestsRef = useRef<Map<string, Promise<CountryMacroData | null>>>(new Map());

  // Preload IndexedDB cache into L1 memory on initial mount
  useEffect(() => {
    let isMounted = true;
    geoCache.preload().catch((err) => {
      if (isMounted) {
        console.warn('[useMacroData] Failed to preload geoCache:', err);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const fetchMacroForCountry = useCallback(async (iso: string, forceRefresh = false) => {
    if (!iso || iso === '-99' || iso === 'N/A') return;

    const cacheKey = geoCacheKeys.macro(iso);

    if (!forceRefresh) {
      // 1. Fast path: In-memory ref hit (0ms)
      if (macroCacheRef.current[iso]) {
        return;
      }

      // 2. Fast path: Sync L1 cache hit from geoCache (0ms)
      const syncCached = geoCache.getSync<CountryMacroData>(cacheKey);
      if (syncCached) {
        console.log(`[GeopoliticalMonitor] ⚡ Macro cache HIT (L1 Memory) for ${iso}`);
        macroCacheRef.current = { ...macroCacheRef.current, [iso]: syncCached };
        setMacroCache((prev) => ({ ...prev, [iso]: syncCached }));
        return;
      }

      // 3. Async path: Check IndexedDB (L2) before network request
      const idbCached = await geoCache.get<CountryMacroData>(cacheKey);
      if (idbCached) {
        console.log(`[GeopoliticalMonitor] ⚡ Macro cache HIT (IndexedDB L2) for ${iso}`);
        macroCacheRef.current = { ...macroCacheRef.current, [iso]: idbCached };
        setMacroCache((prev) => ({ ...prev, [iso]: idbCached }));
        return;
      }
    }

    // Coalesce concurrent requests for the same country to prevent duplicate network calls
    if (inFlightRequestsRef.current.has(iso)) {
      console.log(`[GeopoliticalMonitor] ⏳ Macro fetch already in-flight for ${iso}; coalescing.`);
      await inFlightRequestsRef.current.get(iso);
      return;
    }

    // 4. Network fetch on cache miss
    console.log(`[GeopoliticalMonitor] 🌐 Fetching macro data from API for ${iso}...`);
    setMacroLoadingISO(iso);
    setMacroError(null);

    const fetchPromise = (async (): Promise<CountryMacroData | null> => {
      try {
        const res = await fetch(`/api/macro/${iso}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: CountryMacroData = await res.json();
        console.log(`[GeopoliticalMonitor] ✅ Macro data received for ${iso} (confidence: ${data.dataConfidence})`);
        const entry = { ...data, fetchedAt: new Date().toISOString() };

        // Update in-memory state
        macroCacheRef.current = { ...macroCacheRef.current, [iso]: entry };
        setMacroCache((prev) => ({ ...prev, [iso]: entry }));

        // Persist into IndexedDB / L1 cache with 24h TTL
        await geoCache.set(cacheKey, entry, GEO_CACHE_TTLS.MACRO_DATA);
        return entry;
      } catch (err: any) {
        console.error(`[GeopoliticalMonitor] ❌ Macro fetch failed for ${iso}:`, err.message);
        setMacroError(`Error cargando indicadores macroeconómicos para ${iso}.`);
        return null;
      } finally {
        inFlightRequestsRef.current.delete(iso);
        setMacroLoadingISO(null);
      }
    })();

    inFlightRequestsRef.current.set(iso, fetchPromise);
    await fetchPromise;
  }, []);

  return { macroCache, macroLoadingISO, macroError, fetchMacroForCountry };
}