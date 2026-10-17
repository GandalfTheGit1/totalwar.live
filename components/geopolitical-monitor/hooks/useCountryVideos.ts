import { useState, useRef, useEffect } from 'react';
import { fetchCountryEconomyVideosAction } from '@/app/dev/news-analyzer/actions';
import { geoCache, geoCacheKeys, GEO_CACHE_TTLS } from '@/lib/cache/geo-indexeddb-cache';

export function useCountryVideos(isPanelOpen: boolean, activeData: any) {
  const [countryVideos, setCountryVideos] = useState<any[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [videosError, setVideosError] = useState<string | null>(null);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const lastVideoCountryRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isPanelOpen) {
      setCountryVideos([]);
      setVideosError(null);
      lastVideoCountryRef.current = null;
      setSelectedVideoIndex(0);
    }
  }, [isPanelOpen]);

  useEffect(() => {
    const countryName = activeData?.name;
    if (!countryName || !isPanelOpen) return;
    if (lastVideoCountryRef.current === countryName && countryVideos.length > 0) return;

    const cacheKey = geoCacheKeys.videos(countryName);

    // 1. Sync L1 hit (0ms) - Array.isArray handles valid empty lists without redundant re-fetch
    const syncCached = geoCache.getSync<any[]>(cacheKey);
    if (Array.isArray(syncCached)) {
      setCountryVideos(syncCached);
      lastVideoCountryRef.current = countryName;
      setVideosLoading(false);
      setVideosError(null);
      return;
    }

    let isCancelled = false;

    // 2. Async IndexedDB L2 check
    (async () => {
      const idbCached = await geoCache.get<any[]>(cacheKey);
      if (isCancelled) return;

      if (Array.isArray(idbCached)) {
        setCountryVideos(idbCached);
        lastVideoCountryRef.current = countryName;
        setVideosLoading(false);
        setVideosError(null);
        return;
      }

      setVideosLoading(true);
      setVideosError(null);
      setCountryVideos([]);
      setSelectedVideoIndex(0);

      try {
        const res = await fetchCountryEconomyVideosAction(countryName, 5);
        if (isCancelled) return;

        if (res.success && Array.isArray(res.videos)) {
          setCountryVideos(res.videos);
          geoCache.set(cacheKey, res.videos, GEO_CACHE_TTLS.VIDEOS).catch(() => {});
        } else {
          setVideosError(res.error || 'Error fetching videos');
        }
        setVideosLoading(false);
        lastVideoCountryRef.current = countryName;
      } catch (err) {
        if (isCancelled) return;
        console.error('[GeoSidebar] Videos fetch failed:', err);
        setVideosError('Failed to load videos.');
        setVideosLoading(false);
        lastVideoCountryRef.current = countryName;
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [activeData?.name, isPanelOpen]);

  return { countryVideos, videosLoading, videosError, selectedVideoIndex, setSelectedVideoIndex };
}
