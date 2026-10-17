import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import {
  GeoIndexedDbCache,
  geoCache,
  geoCacheKeys,
  GEO_CACHE_TTLS,
} from '@/lib/cache/geo-indexeddb-cache';
import { useMacroData } from '@/components/dev/geopolitical-monitor/hooks/useMacroData';
import { useLlmCausalAnalysis } from '@/components/dev/geopolitical-monitor/hooks/useLlmCausalAnalysis';
import { useCountryVideos } from '@/components/dev/geopolitical-monitor/hooks/useCountryVideos';
import { GET as geoMacroGet, POST as geoMacroPost } from '@/app/api/dev/geo-macro-analysis/route';
import { NextRequest } from 'next/server';

vi.mock('@/app/dev/news-analyzer/actions', () => ({
  fetchCountryEconomyVideosAction: vi.fn(),
}));

import { fetchCountryEconomyVideosAction } from '@/app/dev/news-analyzer/actions';

describe('GeoIndexedDbCache - Unit and Integration Tests (T03.7)', () => {
  let cache: GeoIndexedDbCache;

  beforeEach(() => {
    cache = new GeoIndexedDbCache({
      dbName: 'test_geo_macro_db',
      storeName: 'test_store',
      defaultTtlMs: 1000,
    });
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await cache.clear();
    await geoCache.clear();
  });

  describe('1. Core In-Memory Fallback Operations', () => {
    it('should set and get values with synchronous 0ms L1 access', async () => {
      const sampleData = { country: 'United States', gdp: 2.5, debtToGdp: 120 };
      const key = geoCacheKeys.macro('USA');

      await cache.set(key, sampleData, 5000);

      // Instant synchronous L1 hit
      expect(cache.hasSync(key)).toBe(true);
      expect(cache.getSync(key)).toEqual(sampleData);

      // Async get
      const retrieved = await cache.get(key);
      expect(retrieved).toEqual(sampleData);
    });

    it('should return null for non-existent keys', async () => {
      const nonExistentKey = 'geo:macro:NON_EXISTENT';
      expect(cache.getSync(nonExistentKey)).toBeNull();
      expect(cache.hasSync(nonExistentKey)).toBe(false);

      const retrieved = await cache.get(nonExistentKey);
      expect(retrieved).toBeNull();
    });

    it('should delete keys from cache correctly', async () => {
      const key = geoCacheKeys.macro('DEU');
      await cache.set(key, { name: 'Germany' });
      expect(cache.hasSync(key)).toBe(true);

      await cache.delete(key);
      expect(cache.hasSync(key)).toBe(false);
      expect(cache.getSync(key)).toBeNull();
      expect(await cache.get(key)).toBeNull();
    });

    it('should clear all entries', async () => {
      await cache.set(geoCacheKeys.macro('FRA'), { name: 'France' });
      await cache.set(geoCacheKeys.macro('ITA'), { name: 'Italy' });
      await cache.set(geoCacheKeys.analysis('FRA'), 'Analysis France');

      let keys = await cache.keys();
      expect(keys.length).toBe(3);

      await cache.clear();

      keys = await cache.keys();
      expect(keys.length).toBe(0);
      expect(cache.getSync(geoCacheKeys.macro('FRA'))).toBeNull();
    });

    it('should generate canonical cache keys properly', () => {
      expect(geoCacheKeys.macro('  usa  ')).toBe('geo:macro:USA');
      expect(geoCacheKeys.analysis('chn')).toBe('geo:analysis:CHN');
      expect(geoCacheKeys.mechanics()).toBe('geo:country-mechanics');
      expect(geoCacheKeys.lpi()).toBe('geo:world-bank-lpi');
      expect(geoCacheKeys.tension()).toBe('geo:world-tension');
      expect(geoCacheKeys.videos(' United States ')).toBe('geo:videos:united states');
      expect(geoCacheKeys.thematic('energy')).toBe('geo:thematic:energy');
    });
  });

  describe('2. TTL Expiration & Pruning', () => {
    it('should expire entries after ttlMs has elapsed', async () => {
      const key = geoCacheKeys.analysis('JPN');
      const shortTtl = 50; // 50ms

      await cache.set(key, 'Japan Debt Cycle Analysis', shortTtl);

      // Immediately present
      expect(cache.getSync(key)).toBe('Japan Debt Cycle Analysis');
      expect(await cache.get(key)).toBe('Japan Debt Cycle Analysis');

      // Wait for TTL expiration
      await new Promise((r) => setTimeout(r, 70));

      // Synchronous and asynchronous gets should return null
      expect(cache.getSync(key)).toBeNull();
      expect(await cache.get(key)).toBeNull();
    });

    it('should prune expired entries via pruneExpired() without double counting', async () => {
      const keyExpired1 = 'geo:test:exp1';
      const keyExpired2 = 'geo:test:exp2';
      const keyActive = 'geo:test:active';

      await cache.set(keyExpired1, 'val1', 30);
      await cache.set(keyExpired2, 'val2', 30);
      await cache.set(keyActive, 'valActive', 60000);

      await new Promise((r) => setTimeout(r, 50));

      const pruned = await cache.pruneExpired();
      expect(pruned).toBe(2);

      const remainingKeys = await cache.keys();
      expect(remainingKeys).toContain(keyActive);
      expect(remainingKeys).not.toContain(keyExpired1);
      expect(remainingKeys).not.toContain(keyExpired2);
    });
  });

  describe('3. IndexedDB Simulation & Tiered Promotion', () => {
    let mockStorage: Map<string, any>;
    let mockIdbFactory: any;

    beforeEach(() => {
      mockStorage = new Map();

      mockIdbFactory = {
        open: vi.fn().mockImplementation((_name: string, _version: number) => {
          const req: any = {
            result: {
              objectStoreNames: {
                contains: vi.fn().mockReturnValue(true),
              },
              transaction: vi.fn().mockImplementation((_storeName: string, _mode: string) => {
                return {
                  objectStore: vi.fn().mockReturnValue({
                    get: vi.fn().mockImplementation((key: string) => {
                      const getReq: any = { result: mockStorage.get(key) };
                      setTimeout(() => {
                        if (getReq.onsuccess) getReq.onsuccess();
                      }, 0);
                      return getReq;
                    }),
                    put: vi.fn().mockImplementation((record: any) => {
                      mockStorage.set(record.key, record);
                      const putReq: any = {};
                      setTimeout(() => {
                        if (putReq.onsuccess) putReq.onsuccess();
                      }, 0);
                      return putReq;
                    }),
                    delete: vi.fn().mockImplementation((key: string) => {
                      mockStorage.delete(key);
                      const delReq: any = {};
                      setTimeout(() => {
                        if (delReq.onsuccess) delReq.onsuccess();
                      }, 0);
                      return delReq;
                    }),
                    clear: vi.fn().mockImplementation(() => {
                      mockStorage.clear();
                      const clrReq: any = {};
                      setTimeout(() => {
                        if (clrReq.onsuccess) clrReq.onsuccess();
                      }, 0);
                      return clrReq;
                    }),
                    getAllKeys: vi.fn().mockImplementation(() => {
                      const keysReq: any = { result: Array.from(mockStorage.keys()) };
                      setTimeout(() => {
                        if (keysReq.onsuccess) keysReq.onsuccess();
                      }, 0);
                      return keysReq;
                    }),
                    getAll: vi.fn().mockImplementation(() => {
                      const allReq: any = { result: Array.from(mockStorage.values()) };
                      setTimeout(() => {
                        if (allReq.onsuccess) allReq.onsuccess();
                      }, 0);
                      return allReq;
                    }),
                  }),
                };
              }),
            },
          };
          setTimeout(() => {
            if (req.onsuccess) req.onsuccess();
          }, 0);
          return req;
        }),
      };

      vi.stubGlobal('indexedDB', mockIdbFactory);
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('should persist into IndexedDB and promote to L1 on subsequent get', async () => {
      const idbCache = new GeoIndexedDbCache({
        dbName: 'mock_idb_db',
        storeName: 'mock_store',
        defaultTtlMs: 10000,
      });

      const key = geoCacheKeys.macro('KOR');
      const data = { country: 'South Korea', compositePmi: 52.4 };

      await idbCache.set(key, data);
      expect(mockStorage.has(key)).toBe(true);

      // Create a second cache instance simulating a fresh tab/page reload
      const newTabCache = new GeoIndexedDbCache({
        dbName: 'mock_idb_db',
        storeName: 'mock_store',
        defaultTtlMs: 10000,
      });

      // Synchronous L1 is initially empty in the new tab
      expect(newTabCache.getSync(key)).toBeNull();

      // Async get fetches from IndexedDB and promotes to L1
      const fetched = await newTabCache.get(key);
      expect(fetched).toEqual(data);

      // Now synchronous L1 access is instant (60fps)
      expect(newTabCache.getSync(key)).toEqual(data);
    });

    it('should preload items from IndexedDB into L1 memory', async () => {
      const key1 = geoCacheKeys.macro('CAN');
      const key2 = geoCacheKeys.macro('AUS');

      mockStorage.set(key1, {
        key: key1,
        data: { country: 'Canada' },
        timestamp: Date.now(),
        ttlMs: 50000,
        expiresAt: Date.now() + 50000,
        version: 1,
      });
      mockStorage.set(key2, {
        key: key2,
        data: { country: 'Australia' },
        timestamp: Date.now(),
        ttlMs: 50000,
        expiresAt: Date.now() + 50000,
        version: 1,
      });

      const preloadingCache = new GeoIndexedDbCache({
        dbName: 'mock_idb_db',
        storeName: 'mock_store',
      });

      expect(preloadingCache.getSync(key1)).toBeNull();

      const preloadedCount = await preloadingCache.preload();
      expect(preloadedCount).toBe(2);

      // Both keys are now instantly accessible in L1
      expect(preloadingCache.getSync(key1)).toEqual({ country: 'Canada' });
      expect(preloadingCache.getSync(key2)).toEqual({ country: 'Australia' });
    });

    it('should handle IndexedDB opening errors gracefully by falling back to memory', async () => {
      const brokenIdbFactory = {
        open: vi.fn().mockImplementation(() => {
          const req: any = { error: new Error('QuotaExceededError') };
          setTimeout(() => {
            if (req.onerror) req.onerror();
          }, 0);
          return req;
        }),
      };
      vi.stubGlobal('indexedDB', brokenIdbFactory);

      const resilientCache = new GeoIndexedDbCache({
        dbName: 'error_db',
        storeName: 'error_store',
      });

      const key = geoCacheKeys.macro('ESP');
      await resilientCache.set(key, { country: 'Spain' });

      // In-memory fallback still functions without throwing
      expect(resilientCache.getSync(key)).toEqual({ country: 'Spain' });
      expect(await resilientCache.get(key)).toEqual({ country: 'Spain' });
      expect(resilientCache.getTelemetry().isFallbackMode).toBe(true);
    });

    it('should filter out expired keys in keys()', async () => {
      const activeKey = 'geo:active';
      const expiredKey = 'geo:expired';

      mockStorage.set(activeKey, {
        key: activeKey,
        data: 'active',
        timestamp: Date.now(),
        ttlMs: 50000,
        expiresAt: Date.now() + 50000,
        version: 1,
      });

      mockStorage.set(expiredKey, {
        key: expiredKey,
        data: 'expired',
        timestamp: Date.now() - 5000,
        ttlMs: 1000,
        expiresAt: Date.now() - 4000,
        version: 1,
      });

      const testCache = new GeoIndexedDbCache({
        dbName: 'mock_idb_db',
        storeName: 'mock_store',
      });

      const keys = await testCache.keys();
      expect(keys).toContain(activeKey);
      expect(keys).not.toContain(expiredKey);
    });
  });

  describe('4. Store Versioning & Migration Isolation', () => {
    let mockStorage: Map<string, any>;

    beforeEach(() => {
      mockStorage = new Map();
      const mockIdbFactory = {
        open: vi.fn().mockImplementation(() => {
          const req: any = {
            result: {
              objectStoreNames: { contains: () => true },
              transaction: () => ({
                objectStore: () => ({
                  get: (key: string) => {
                    const r: any = { result: mockStorage.get(key) };
                    setTimeout(() => r.onsuccess?.(), 0);
                    return r;
                  },
                  put: (rec: any) => {
                    mockStorage.set(rec.key, rec);
                    const r: any = {};
                    setTimeout(() => r.onsuccess?.(), 0);
                    return r;
                  },
                  delete: (key: string) => {
                    mockStorage.delete(key);
                    const r: any = {};
                    setTimeout(() => r.onsuccess?.(), 0);
                    return r;
                  },
                  getAll: () => {
                    const r: any = { result: Array.from(mockStorage.values()) };
                    setTimeout(() => r.onsuccess?.(), 0);
                    return r;
                  },
                }),
              }),
            },
          };
          setTimeout(() => req.onsuccess?.(), 0);
          return req;
        }),
      };
      vi.stubGlobal('indexedDB', mockIdbFactory);
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('should reject and delete records when dbVersion does not match', async () => {
      const key = geoCacheKeys.macro('USA');
      // Store record with version 1
      mockStorage.set(key, {
        key,
        data: { country: 'USA', version: 1 },
        timestamp: Date.now(),
        ttlMs: 50000,
        expiresAt: Date.now() + 50000,
        version: 1, // old version
      });

      // Initialize cache instance with dbVersion: 2
      const v2Cache = new GeoIndexedDbCache({
        dbName: 'versioned_db',
        storeName: 'versioned_store',
        dbVersion: 2,
      });

      // Async get should return null and prune the version-mismatched record
      const result = await v2Cache.get(key);
      expect(result).toBeNull();
      expect(mockStorage.has(key)).toBe(false);
    });

    it('should not preload items with mismatched dbVersion', async () => {
      const keyV1 = 'geo:item:v1';
      const keyV2 = 'geo:item:v2';

      mockStorage.set(keyV1, {
        key: keyV1,
        data: 'v1 data',
        timestamp: Date.now(),
        ttlMs: 50000,
        expiresAt: Date.now() + 50000,
        version: 1,
      });

      mockStorage.set(keyV2, {
        key: keyV2,
        data: 'v2 data',
        timestamp: Date.now(),
        ttlMs: 50000,
        expiresAt: Date.now() + 50000,
        version: 2,
      });

      const v2Cache = new GeoIndexedDbCache({ dbVersion: 2 });
      const loadedCount = await v2Cache.preload();

      expect(loadedCount).toBe(1);
      expect(v2Cache.getSync(keyV1)).toBeNull();
      expect(v2Cache.getSync(keyV2)).toBe('v2 data');
    });
  });

  describe('5. Memory Bounded Eviction & LRU Cap', () => {
    it('should evict oldest records when maxL1Entries limit is exceeded', async () => {
      const boundedCache = new GeoIndexedDbCache({
        maxL1Entries: 3,
        defaultTtlMs: 60000,
      });

      await boundedCache.set('k1', 'val1');
      await boundedCache.set('k2', 'val2');
      await boundedCache.set('k3', 'val3');
      expect(boundedCache.getTelemetry().l1Size).toBe(3);

      // Inserting 4th item should evict oldest (k1)
      await boundedCache.set('k4', 'val4');
      expect(boundedCache.getTelemetry().l1Size).toBe(3);
      expect(boundedCache.getSync('k1')).toBeNull();
      expect(boundedCache.getSync('k2')).toBe('val2');
      expect(boundedCache.getSync('k3')).toBe('val3');
      expect(boundedCache.getSync('k4')).toBe('val4');
    });
  });

  describe('6. Hook Integration: useMacroData', () => {
    it('should fetch from API on cache miss and save to geoCache', async () => {
      const mockMacro = {
        gdpGrowth: '1.2%',
        inflation: '2.1%',
        dataConfidence: 'high',
      };

      const fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockMacro,
      });
      vi.stubGlobal('fetch', fetchSpy);

      const { result } = renderHook(() => useMacroData());

      await act(async () => {
        await result.current.fetchMacroForCountry('GBR');
      });

      expect(fetchSpy).toHaveBeenCalledWith('/api/macro/GBR');
      expect(result.current.macroCache['GBR']).toBeDefined();
      expect(result.current.macroCache['GBR'].gdpGrowth).toBe('1.2%');

      // Verify it was stored in geoCache
      const cached = await geoCache.get<any>(geoCacheKeys.macro('GBR'));
      expect(cached).toBeDefined();
      expect(cached.gdpGrowth).toBe('1.2%');

      // Second call should NOT trigger fetch again (0ms instant cache hit)
      fetchSpy.mockClear();
      await act(async () => {
        await result.current.fetchMacroForCountry('GBR');
      });
      expect(fetchSpy).not.toHaveBeenCalled();

      vi.unstubAllGlobals();
    });

    it('should hit pre-existing geoCache without network fetch', async () => {
      const preloadedData: any = {
        gdpGrowth: '2.9%',
        dataConfidence: 'high',
      };

      await geoCache.set(geoCacheKeys.macro('BRA'), preloadedData, GEO_CACHE_TTLS.MACRO_DATA);

      const fetchSpy = vi.fn();
      vi.stubGlobal('fetch', fetchSpy);

      const { result } = renderHook(() => useMacroData());

      await act(async () => {
        await result.current.fetchMacroForCountry('BRA');
      });

      // No network request made
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(result.current.macroCache['BRA'].gdpGrowth).toBe('2.9%');

      vi.unstubAllGlobals();
    });

    it('should coalesce concurrent requests for the same country into a single fetch', async () => {
      let fetchCallCount = 0;
      const fetchSpy = vi.fn().mockImplementation(async () => {
        fetchCallCount++;
        await new Promise((r) => setTimeout(r, 20));
        return {
          ok: true,
          json: async () => ({ gdpGrowth: '3.1%', dataConfidence: 'high' }),
        };
      });
      vi.stubGlobal('fetch', fetchSpy);

      const { result } = renderHook(() => useMacroData());

      // Trigger two concurrent calls simultaneously
      await act(async () => {
        await Promise.all([
          result.current.fetchMacroForCountry('MEX'),
          result.current.fetchMacroForCountry('MEX'),
        ]);
      });

      // Exactly 1 network fetch should have been dispatched
      expect(fetchCallCount).toBe(1);
      expect(result.current.macroCache['MEX'].gdpGrowth).toBe('3.1%');

      vi.unstubAllGlobals();
    });

    it('should bypass cache when forceRefresh is true', async () => {
      await geoCache.set(geoCacheKeys.macro('USA'), { gdpGrowth: '2.0%', dataConfidence: 'high' });

      const fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ gdpGrowth: '2.8%', dataConfidence: 'high' }),
      });
      vi.stubGlobal('fetch', fetchSpy);

      const { result } = renderHook(() => useMacroData());

      // Without forceRefresh, it uses cache
      await act(async () => {
        await result.current.fetchMacroForCountry('USA', false);
      });
      expect(fetchSpy).not.toHaveBeenCalled();

      // With forceRefresh, it fetches fresh data
      await act(async () => {
        await result.current.fetchMacroForCountry('USA', true);
      });
      expect(fetchSpy).toHaveBeenCalledWith('/api/macro/USA');
      expect(result.current.macroCache['USA'].gdpGrowth).toBe('2.8%');

      vi.unstubAllGlobals();
    });
  });

  describe('7. Hook Integration: useLlmCausalAnalysis', () => {
    it('should not trigger fetch if isPanelOpen is false', async () => {
      const fetchSpy = vi.fn();
      vi.stubGlobal('fetch', fetchSpy);

      const activeData = { iso: 'CHL', name: 'Chile', risk: 30 };
      const activeMacro = { dataConfidence: 'high' };

      renderHook(() => useLlmCausalAnalysis(false, activeData, activeMacro));

      await new Promise((r) => setTimeout(r, 20));
      expect(fetchSpy).not.toHaveBeenCalled();

      vi.unstubAllGlobals();
    });

    it('should serve cached causal analysis from geoCache without network call', async () => {
      const iso = 'TWN';
      const cachedAnalysis = 'Taiwán exhibe un fuerte superávit comercial impulsado por semiconductores.';
      await geoCache.set(geoCacheKeys.analysis(iso), cachedAnalysis, GEO_CACHE_TTLS.CAUSAL_ANALYSIS);

      const fetchSpy = vi.fn();
      vi.stubGlobal('fetch', fetchSpy);

      const activeData = { iso: 'TWN', name: 'Taiwan', risk: 35 };
      const activeMacro = { dataConfidence: 'high' };

      const { result } = renderHook(() => useLlmCausalAnalysis(true, activeData, activeMacro));

      await waitFor(() => {
        expect(result.current.llmAnalysis).toBe(cachedAnalysis);
      });

      expect(fetchSpy).not.toHaveBeenCalled();
      expect(result.current.llmLoading).toBe(false);

      vi.unstubAllGlobals();
    });

    it('should preserve and restore analysis when toggling isPanelOpen', async () => {
      const iso = 'NOR';
      const analysisText = 'Noruega mantiene un fondo soberano robusto contra shocks energéticos.';

      const fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ analysis: analysisText }),
      });
      vi.stubGlobal('fetch', fetchSpy);

      const activeData = { iso, name: 'Norway', risk: 10 };
      const activeMacro = { dataConfidence: 'high' };

      let isOpen = true;
      const { result, rerender } = renderHook(() =>
        useLlmCausalAnalysis(isOpen, activeData, activeMacro)
      );

      await waitFor(() => {
        expect(result.current.llmAnalysis).toBe(analysisText);
      });

      // User closes panel
      isOpen = false;
      rerender();

      // User reopens panel for the same country
      isOpen = true;
      rerender();

      // Analysis should be restored immediately from state/L1 without calling fetch again
      await waitFor(() => {
        expect(result.current.llmAnalysis).toBe(analysisText);
      });
      expect(fetchSpy).toHaveBeenCalledTimes(1);

      vi.unstubAllGlobals();
    });

    it('should handle API 500 failure properly without caching the error message', async () => {
      const iso = 'ERR';
      const fetchSpy = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'LLM Rate Limit / Quota Exceeded' }),
      });
      vi.stubGlobal('fetch', fetchSpy);

      const activeData = { iso: 'ERR', name: 'Errorland', risk: 90 };
      const activeMacro = { dataConfidence: 'high' };

      const { result } = renderHook(() => useLlmCausalAnalysis(true, activeData, activeMacro));

      await waitFor(() => {
        expect(result.current.llmError).toBeTruthy();
      });

      expect(result.current.llmLoading).toBe(false);

      // Verify that geoCache did NOT store the error message
      const cached = await geoCache.get(geoCacheKeys.analysis(iso));
      expect(cached).toBeNull();

      vi.unstubAllGlobals();
    });
  });

  describe('8. Hook Integration: useCountryVideos', () => {
    it('should cache empty video list and treat as hit without refetching', async () => {
      const mockFetch = vi.mocked(fetchCountryEconomyVideosAction);
      mockFetch.mockResolvedValue({ success: true, videos: [] });

      const activeData = { name: 'Iceland' };
      const isOpen = true;

      const { result, rerender } = renderHook(() => useCountryVideos(isOpen, activeData));

      await waitFor(() => {
        expect(result.current.videosLoading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second render / inspection of same country: must recognize [] as hit and NOT refetch
      mockFetch.mockClear();
      rerender();

      await new Promise((r) => setTimeout(r, 20));
      expect(mockFetch).not.toHaveBeenCalled();
      expect(result.current.countryVideos).toEqual([]);
    });
  });

  describe('9. API Route: /api/dev/geo-macro-analysis Server Cache & Bypass', () => {
    it('should return service telemetry on GET without iso parameter', async () => {
      const req = new NextRequest('http://localhost:3000/api/dev/geo-macro-analysis');
      const res = await geoMacroGet(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.service).toBe('geo-macro-analysis');
      expect(data.status).toBe('active');
      expect(Array.isArray(data.cachedCountries)).toBe(true);
    });

    it('should validate missing countryName or iso on POST', async () => {
      const req = new NextRequest('http://localhost:3000/api/dev/geo-macro-analysis', {
        method: 'POST',
        body: JSON.stringify({ countryName: 'Test' }), // missing iso
      });

      const res = await geoMacroPost(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('iso are required');
    });

    it('should return explanation when dataConfidence is none', async () => {
      const req = new NextRequest('http://localhost:3000/api/dev/geo-macro-analysis', {
        method: 'POST',
        body: JSON.stringify({
          countryName: 'Small Nation',
          iso: 'SMN',
          macro: { dataConfidence: 'none' },
        }),
      });

      const res = await geoMacroPost(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.confidence).toBe('none');
      expect(data.analysis).toContain('Datos macroeconómicos insuficientes');
    });
  });
});
