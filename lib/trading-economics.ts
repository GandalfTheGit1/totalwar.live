/**
 * lib/trading-economics.ts
 *
 * Trading Economics scraping adapter and macro data enricher.
 * Retrieves, standardizes, and caches international macroeconomic indicators,
 * sovereign ratings, currency exchange rates, and Dalio debt cycle classifications.
 */

import type { CountryEconomicData } from './geographic-data';
import { getCachedApiResponse, setCachedApiResponse } from './api-cache';
import { getLiveExchangeRates } from './trading-economics/exchange-rates';
import {
  parseTradingEconomicsHtml,
  buildBaseEconomicData,
} from './trading-economics/html-parser';
import {
  enrichWithUsFred,
  enrichWithSupabaseMarket,
} from './trading-economics/market-enricher';

export { getLiveExchangeRates };
export {
  mapCreditRating,
  formatPercent,
  formatGdpPerCapita,
  formatTradeBalance,
} from './trading-economics/formatters';

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
};

async function fetchHtml(cleanSlug: string): Promise<string | null> {
  const url = `https://tradingeconomics.com/${cleanSlug}/indicators`;
  console.log(`[TradingEconomics] Cache MISS. Fetching slug: ${cleanSlug} from url: ${url}`);
  try {
    const res = await fetch(url, { headers: HEADERS, next: { revalidate: 3600 } });
    if (!res.ok) {
      console.error(`[TradingEconomics] Fetch failed for ${cleanSlug} with status ${res.status}`);
      return null;
    }
    return await res.text();
  } catch (err) {
    console.error(`[TradingEconomics] Network error fetching ${cleanSlug}:`, err);
    return null;
  }
}

/**
 * Fetches country economic indicators from Trading Economics, parses, formats, and caches them.
 */
export async function fetchCountryEconomics(
  slug: string,
  countryCode?: string,
): Promise<CountryEconomicData | null> {
  const cleanSlug = slug.toLowerCase().trim();
  const cacheKey = `trading-economics:country:${cleanSlug}`;

  const cached = await getCachedApiResponse(cacheKey);
  if (cached && (cached as CountryEconomicData).dalioDebtCycle) {
    console.log(`[TradingEconomics] DB Cache HIT for slug: ${cleanSlug}`);
    return cached as CountryEconomicData;
  }

  const html = await fetchHtml(cleanSlug);
  if (!html) return null;

  try {
    const parsed = parseTradingEconomicsHtml(html, cleanSlug);
    const data = buildBaseEconomicData(cleanSlug, countryCode, parsed);
    const code = countryCode?.toUpperCase() || '';

    if (code === 'US') {
      await enrichWithUsFred(data);
    }

    const liveRates = await getLiveExchangeRates();
    const exchangeRate = liveRates[code] || 1.0;
    await enrichWithSupabaseMarket(code, data, exchangeRate);

    await setCachedApiResponse(cacheKey, 'trading-economics', 'country', data, 24);
    console.log(`[TradingEconomics] Successfully parsed and cached country in DB: ${cleanSlug}`);
    return data;
  } catch (err) {
    console.error(`[TradingEconomics] Scraper exception for ${cleanSlug}:`, err);
    return null;
  }
}
