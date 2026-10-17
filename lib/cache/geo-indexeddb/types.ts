/**
 * lib/cache/geo-indexeddb/types.ts
 *
 * Types, configuration contracts, standard TTL presets, and key helpers
 * for macroeconomic and geopolitical caching.
 */

export interface GeoCacheRecord<T = unknown> {
  key: string;
  data: T;
  timestamp: number;
  ttlMs: number;
  expiresAt: number;
  version: number;
}

export interface GeoCacheConfig {
  dbName?: string;
  storeName?: string;
  dbVersion?: number;
  defaultTtlMs?: number;
  maxL1Entries?: number;
}

/**
 * Standard TTL presets for geopolitical & macroeconomic datasets.
 */
export const GEO_CACHE_TTLS = {
  MACRO_DATA: 24 * 60 * 60 * 1000,        // 24 hours (FRED/World Bank quarterly indices)
  CAUSAL_ANALYSIS: 24 * 60 * 60 * 1000,   // 24 hours (Dalio LLM deduction)
  COUNTRY_MECHANICS: 12 * 60 * 60 * 1000, // 12 hours (Hoi4/EU4 simulation coefficients)
  LPI: 7 * 24 * 60 * 60 * 1000,           // 7 days (World Bank Logistics Performance Index)
  WORLD_TENSION: 15 * 60 * 1000,          // 15 minutes (GDELT tension telemetry)
  VIDEOS: 6 * 60 * 60 * 1000,             // 6 hours (YouTube briefing playlists)
  PROPERTIES: 7 * 24 * 60 * 60 * 1000,    // 7 days (SEC 10-K Item 2 corporate facilities)
  DEFAULT: 24 * 60 * 60 * 1000,           // 24 hours
} as const;

/**
 * Helper generators for canonical cache keys across the geopolitical monitor.
 */
export const geoCacheKeys = {
  macro: (iso: string) => `geo:macro:${iso.toUpperCase().trim()}`,
  analysis: (iso: string) => `geo:analysis:${iso.toUpperCase().trim()}`,
  mechanics: () => 'geo:country-mechanics',
  lpi: () => 'geo:world-bank-lpi',
  tension: () => 'geo:world-tension',
  videos: (countryName: string) => `geo:videos:${countryName.toLowerCase().trim()}`,
  thematic: (layer: string) => `geo:thematic:${layer}`,
  properties: (ticker: string) => `geo:properties:${ticker.toUpperCase().trim()}`,
};
