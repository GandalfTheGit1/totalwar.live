/**
 * @file useIndicators.ts
 * @description Hooks de datos para los indicadores de Trading Economics (/api/indicators).
 */

'use client';

import type { TeIndicator, TeIndicatorValues } from '@/lib/trading-economics/country-list';
import { AsyncState, useFetch } from './useCountryResources';

export function useIndicatorCatalog(enabled = true): AsyncState<{ indicators: TeIndicator[] }> {
  return useFetch(enabled ? '/api/indicators?catalog=1' : null);
}

export function useIndicatorValues(slug: string | null): AsyncState<TeIndicatorValues> {
  return useFetch(slug ? `/api/indicators?slug=${encodeURIComponent(slug)}` : null);
}
