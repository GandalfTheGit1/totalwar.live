/**
 * components/geographic-operations/facilities/useCorporateFacilities.ts
 *
 * Custom hook managing corporate facilities state, cache, and GeoJSON fetching.
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { Company } from '@/lib/types';
import {
  CorporateFacility,
  secPropertiesService,
  FacilityStats
} from '@/lib/services/geographic/sec-properties-service';
import { GEOJSON_URL } from '@/components/dev/geopolitical-monitor/utils/geo-helpers';
import { geoCache, geoCacheKeys, GEO_CACHE_TTLS } from '@/lib/cache/geo-indexeddb-cache';
import { FacilityCategoryFilter, PopoverPosition } from './types';

async function fetchFromApi(ticker: string, cacheKey: string): Promise<CorporateFacility[]> {
  const res = await fetch(`/api/stocks/${encodeURIComponent(ticker)}/facilities`);
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.detail || errJson.error || `HTTP ${res.status}`);
  }
  const data = await res.json();
  const loaded: CorporateFacility[] = data.facilities || [];
  if (loaded.length > 0) {
    geoCache.set(cacheKey, loaded, GEO_CACHE_TTLS.PROPERTIES).catch(console.warn);
  }
  return loaded;
}

async function loadFacilities(ticker: string): Promise<CorporateFacility[]> {
  const syncFacilities = secPropertiesService.getCuratedFacilities(ticker);
  if (syncFacilities.length > 0) return syncFacilities;

  const cacheKey = geoCacheKeys.properties(ticker);
  const cached = await geoCache.get<CorporateFacility[]>(cacheKey);
  if (cached && Array.isArray(cached) && cached.length > 0) return cached;

  return fetchFromApi(ticker, cacheKey);
}

function useGeoJsonTopologyData() {
  const [geoData, setGeoData] = useState<Array<{ properties?: { ISO_A2?: string; ISO_A3?: string } }>>([]);
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    fetch(GEOJSON_URL, { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        if (!isMounted || !data?.features) return;
        setGeoData(data.features.filter((f: { properties?: { ISO_A3?: string } }) => f.properties?.ISO_A3 !== 'ATA'));
      })
      .catch(err => {
        if (err.name !== 'AbortError' && isMounted) {
          console.warn('[CorporateFacilitiesMap] Could not fetch GeoJSON topology:', err);
        }
      });
    return () => { isMounted = false; controller.abort(); };
  }, []);
  return geoData;
}

function useFacilitiesDataLoader(ticker: string) {
  const [facilities, setFacilities] = useState<CorporateFacility[]>(() => secPropertiesService.getCuratedFacilities(ticker));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    loadFacilities(ticker)
      .then(loaded => {
        if (!isMounted) return;
        setFacilities(loaded);
        setIsLoading(false);
      })
      .catch(err => {
        if (!isMounted) return;
        console.error('[CorporateFacilitiesMap] Failed to load facilities from API:', err);
        setError(`Error al extraer instalaciones corporativas de ${ticker}: ${err.message}`);
        setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, [ticker]);

  return { facilities, isLoading, error };
}

export function useCorporateFacilities(company: Company) {
  const { facilities, isLoading, error } = useFacilitiesDataLoader(company.ticker);
  const [functionalFilter, setFunctionalFilter] = useState<FacilityCategoryFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredFacility, setHoveredFacility] = useState<CorporateFacility | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<CorporateFacility | null>(null);
  const [popoverPos, setPopoverPos] = useState<PopoverPosition>({ x: 20, y: 20 });
  const geoData = useGeoJsonTopologyData();

  const filteredFacilities = useMemo(() => {
    return facilities.filter((f) => {
      if (functionalFilter !== 'ALL' && f.functionalType !== functionalFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return f.name.toLowerCase().includes(q) || f.city.toLowerCase().includes(q) || f.country.toLowerCase().includes(q);
    });
  }, [facilities, functionalFilter, searchQuery]);

  const stats: FacilityStats = useMemo(() => secPropertiesService.computeFacilityStats(facilities), [facilities]);

  return {
    facilities, isLoading, error, functionalFilter, setFunctionalFilter,
    searchQuery, setSearchQuery, hoveredFacility, setHoveredFacility,
    selectedFacility, setSelectedFacility, popoverPos, setPopoverPos,
    geoData, filteredFacilities, stats
  };
}
