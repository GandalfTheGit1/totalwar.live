/**
 * @file useCountryResources.ts
 * @description Hooks de datos para recursos por país (/api/resources), con caché en memoria
 * por sesión: el dataset solo cambia al regenerarlo con `npm run build:resources`.
 */

'use client';

import { useEffect, useState } from 'react';
import { CommodityStats, CountryResourcesDataset } from '@/lib/services/country-resources/types';
import { CeasedResourceEntry, CountryResourceEntry, ProducerEntry } from '@/lib/services/country-resources/query';

type Meta = CountryResourcesDataset['meta'];

export interface ResourceCatalogPayload { meta: Meta; commodities: CommodityStats[] }
export interface CountryResourcesPayload {
  meta: Meta;
  country: { iso2: string; iso3: string | null; nameEs: string };
  resources: CountryResourceEntry[];
  ceased: CeasedResourceEntry[];
}
export interface ResourceProducersPayload { meta: Meta; commodity: CommodityStats; producers: ProducerEntry[] }

const cache = new Map<string, Promise<unknown>>();

function fetchCached<T>(url: string): Promise<T> {
  let pending = cache.get(url) as Promise<T> | undefined;
  if (!pending) {
    pending = fetch(url).then(async (res) => {
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `Error ${res.status} al cargar recursos`);
      }
      return res.json() as Promise<T>;
    });
    // Un fallo no debe quedar cacheado: el siguiente intento vuelve a pedirlo.
    pending.catch(() => cache.delete(url));
    cache.set(url, pending);
  }
  return pending;
}

/** Solo para tests. */
export function clearResourcesCache(): void {
  cache.clear();
}

interface AsyncState<T> { data: T | null; loading: boolean; error: string | null }

function useFetch<T>(url: string | null): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: !!url, error: null });

  useEffect(() => {
    if (!url) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    let cancelled = false;
    setState((prev) => ({ data: prev.data, loading: true, error: null }));
    fetchCached<T>(url)
      .then((data) => { if (!cancelled) setState({ data, loading: false, error: null }); })
      .catch((err: unknown) => {
        if (!cancelled) setState({ data: null, loading: false, error: err instanceof Error ? err.message : String(err) });
      });
    return () => { cancelled = true; };
  }, [url]);

  return state;
}

export function useResourceCatalog(enabled = true): AsyncState<ResourceCatalogPayload> {
  return useFetch<ResourceCatalogPayload>(enabled ? '/api/resources?catalog=1' : null);
}

export function useCountryResources(countryCode: string | null | undefined): AsyncState<CountryResourcesPayload> {
  const code = countryCode && countryCode !== 'N/A' ? countryCode.trim().toUpperCase() : null;
  return useFetch<CountryResourcesPayload>(code ? `/api/resources?country=${encodeURIComponent(code)}` : null);
}

export function useResourceProducers(commodityId: string | null): AsyncState<ResourceProducersPayload> {
  return useFetch<ResourceProducersPayload>(
    commodityId ? `/api/resources?commodity=${encodeURIComponent(commodityId)}` : null
  );
}
