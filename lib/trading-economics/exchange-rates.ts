/**
 * lib/trading-economics/exchange-rates.ts
 *
 * Live currency exchange rate provider with database caching and resilient fallbacks.
 */

import { getCachedApiResponse, setCachedApiResponse } from '../api-cache';
import { CURRENCY_MAP, DEFAULT_EXCHANGE_FALLBACKS } from './constants';

interface ErApiResponse {
  result?: string;
  rates?: Record<string, number>;
}

function resolveRatesFromPayload(rates: Record<string, number>): Record<string, number> {
  const resolved: Record<string, number> = {};
  for (const [country, cur] of Object.entries(CURRENCY_MAP)) {
    if (rates[cur]) {
      resolved[country] = Math.round((1 / rates[cur]) * 100000) / 100000;
    } else {
      resolved[country] = DEFAULT_EXCHANGE_FALLBACKS[country];
    }
  }
  return resolved;
}

export async function getLiveExchangeRates(): Promise<Record<string, number>> {
  const cacheKey = 'trading-economics:exchange_rates';
  const cached = await getCachedApiResponse(cacheKey);
  if (cached) {
    return cached as Record<string, number>;
  }

  try {
    console.log('[ExchangeRates] Fetching live currency rates from open.er-api.com...');
    const res = await fetch('https://open.er-api.com/v6/latest/USD', {
      next: { revalidate: 43200 },
    });
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const data = (await res.json()) as ErApiResponse;

    if (data && data.result === 'success' && data.rates) {
      const resolved = resolveRatesFromPayload(data.rates);
      await setCachedApiResponse(cacheKey, 'trading-economics', 'exchange-rates', resolved, 12);
      console.log('[ExchangeRates] Live rates successfully resolved and cached in DB:', resolved);
      return resolved;
    }
  } catch (err) {
    console.warn('[ExchangeRates] Live fetch failed, using static fallbacks:', err);
  }

  return DEFAULT_EXCHANGE_FALLBACKS;
}
