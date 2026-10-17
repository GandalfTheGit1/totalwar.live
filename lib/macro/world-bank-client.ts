// Module: lib/macro/world-bank-client.ts
// Canonical, strongly-typed client for the World Bank (Banco Mundial / BIRF) API v2.
// Implements rate-limiting via rateLimitedFetch, error envelope parsing, batch fetching,
// Logistics Performance Index (LPI) extraction, and macro profile aggregation.

import { rateLimitedFetch } from './rate-limited-queue';
import {
  type WorldBankObservation,
  type WorldBankLpiScoreMap,
  type WorldBankFetchOptions,
  type WorldBankMacroProfile,
  WORLD_BANK_INDICATORS,
} from './world-bank-types';
import {
  normalizeCountryCode,
  buildWorldBankUrl,
  parseWorldBankResponse,
} from './world-bank-parser';

// Re-export types and parsers for 100% backward compatibility
export * from './world-bank-types';
export * from './world-bank-parser';

/**
 * Fetches an indicator for a single country code (or 'all').
 */
export async function fetchWorldBankIndicator(
  countryCode: string,
  indicatorId: string,
  options: WorldBankFetchOptions = {}
): Promise<WorldBankObservation[]> {
  const normalizedCountry = countryCode.trim() || 'all';
  const url = buildWorldBankUrl(normalizedCountry, indicatorId, options);
  const revalidateSeconds = options.revalidateSeconds ?? 86400 * 7;

  console.log(`[WorldBank] Fetching indicator "${indicatorId}" for "${normalizedCountry}" from: ${url}`);

  const res = await rateLimitedFetch(url, { revalidateSeconds });
  if (!res.ok) {
    const errorMsg = `[WorldBank] HTTP error ${res.status} (${res.statusText}) fetching indicator "${indicatorId}" for "${normalizedCountry}"`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch (parseErr: any) {
    const errorMsg = `[WorldBank] Failed to parse JSON response from ${url}: ${parseErr?.message || parseErr}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  const parsed = parseWorldBankResponse(json, options.filterNullValues);
  return parsed.records;
}

/**
 * Fetches an indicator for multiple country codes using World Bank semicolon syntax
 * e.g., 'country/USA;MEX;BRA/indicator/...'.
 */
export async function fetchWorldBankCountryIndicators(
  indicatorId: string,
  countryCodes: string[],
  options: WorldBankFetchOptions = {}
): Promise<WorldBankObservation[]> {
  const normalizedCodes = countryCodes ? countryCodes.map(c => normalizeCountryCode(c)).filter(Boolean) : [];
  const isAll = normalizedCodes.length === 0 || normalizedCodes.some(c => c === 'ALL' || c === 'all');
  const countrySegment = isAll ? 'all' : normalizedCodes.join(';');

  return fetchWorldBankIndicator(countrySegment, indicatorId, options);
}

/**
 * Fetches multiple indicators in sequential batch requests with quota-protection delays (Rule 5).
 * Immediately halts if circuit breaker or 429/403 is encountered.
 */
export async function fetchWorldBankIndicatorsBatch(
  countryCode: string,
  indicatorIds: string[],
  options: WorldBankFetchOptions = {}
): Promise<Record<string, WorldBankObservation[]>> {
  const result: Record<string, WorldBankObservation[]> = {};
  const delayMs = options.delayBetweenRequestsMs ?? 50;
  const uniqueIndicatorIds = Array.from(new Set(indicatorIds.map(id => id.trim()).filter(Boolean)));

  for (let i = 0; i < uniqueIndicatorIds.length; i++) {
    const indicatorId = uniqueIndicatorIds[i];
    try {
      const records = await fetchWorldBankIndicator(countryCode, indicatorId, options);
      result[indicatorId] = records;
    } catch (err: any) {
      console.error(`[WorldBank] Batch request halted at indicator "${indicatorId}":`, err?.message || err);
      // Circuit breaker or rate limits must bubble up immediately (Rule 5)
      throw err;
    }

    // Delay between iterations to protect rate limits
    if (i < uniqueIndicatorIds.length - 1 && delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return result;
}

/**
 * Builds an LPI score map from an array of World Bank observations.
 */
// Refactor reason: Extracted helper to isolate dictionary aggregation and reduce cyclomatic complexity.
function buildLpiMapFromObservations(records: WorldBankObservation[]): WorldBankLpiScoreMap {
  const lpiMap: WorldBankLpiScoreMap = {};
  const yearMap: Record<string, number> = {};
  for (const record of records) {
    if (record.value !== null && !isNaN(record.value)) {
      const iso = (record.countryIso3 || record.countryCode).toUpperCase();
      if (iso) {
        const prevYear = yearMap[iso] ?? -1;
        if (record.year >= prevYear) {
          lpiMap[iso] = record.value;
          yearMap[iso] = record.year;
        }
      }
    }
  }
  return lpiMap;
}

/**
 * Fetches the Logistics Performance Index (LPI Overall: LP.LPI.OVRL.XQ).
 * - When countryCode is omitted or 'all', returns a map of ISO3 -> score.
 * - When countryCode is a single country, returns the numeric score or null if unavailable.
 */
export async function fetchWorldBankLpi(): Promise<WorldBankLpiScoreMap>;
export async function fetchWorldBankLpi(countryCode: 'all'): Promise<WorldBankLpiScoreMap>;
export async function fetchWorldBankLpi(countryCode: string): Promise<WorldBankLpiScoreMap | number | null>;
export async function fetchWorldBankLpi(
  countryCode?: string
): Promise<WorldBankLpiScoreMap | number | null> {
  const code = (countryCode || 'all').trim();
  const indicator = WORLD_BANK_INDICATORS.LPI_OVERALL;

  if (code.toLowerCase() === 'all') {
    const records = await fetchWorldBankIndicator('all', indicator, {
      mrv: 1,
      perPage: 500,
      filterNullValues: true,
    });
    return buildLpiMapFromObservations(records);
  }

  const records = await fetchWorldBankIndicator(code, indicator, {
    mrv: 1,
    perPage: 10,
    filterNullValues: true,
  });

  const validRecord = records.find(r => r.value !== null && !isNaN(r.value));
  return validRecord ? validRecord.value : null;
}

/**
 * Maps batch observation records into a structured WorldBankMacroProfile.
 */
// Refactor reason: Pure transformation extracted to ensure fetchWorldBankMacroProfile is < 40 lines.
function assembleMacroProfile(
  normCode: string,
  batch: Record<string, WorldBankObservation[]>
): WorldBankMacroProfile {
  const rawIndicators: Record<string, number | null> = {};
  let countryIso3 = normCode;
  let countryName = '';
  let latestYear = 0;

  for (const [id, obsList] of Object.entries(batch)) {
    const sorted = [...obsList].sort((a, b) => b.year - a.year);
    const latest = sorted.find(o => o.value !== null);
    rawIndicators[id] = latest ? latest.value : null;
    if (latest) {
      if (latest.countryIso3) countryIso3 = latest.countryIso3;
      if (latest.countryName) countryName = latest.countryName;
      if (latest.year > latestYear) latestYear = latest.year;
    }
  }

  return {
    countryCode: normCode,
    countryIso3,
    countryName: countryName || undefined,
    year: latestYear || undefined,
    interestPaymentsPctRevenue: rawIndicators[WORLD_BANK_INDICATORS.INTEREST_PAYMENTS_PCT_REVENUE] ?? null,
    fxReservesMonthsImport: rawIndicators[WORLD_BANK_INDICATORS.FX_RESERVES_MONTHS_IMPORT] ?? null,
    grossCapitalFormationPctGdp: rawIndicators[WORLD_BANK_INDICATORS.GROSS_CAPITAL_FORMATION_PCT_GDP] ?? null,
    manufacturingValueAddedPctGdp: rawIndicators[WORLD_BANK_INDICATORS.MANUFACTURING_PCT_GDP] ?? null,
    gdpPerCapitaUsd: rawIndicators[WORLD_BANK_INDICATORS.GDP_PER_CAPITA_USD] ?? null,
    urbanPopulationConcentrationPct: rawIndicators[WORLD_BANK_INDICATORS.URBAN_AGGLOMERATION_PCT] ?? null,
    naturalResourceRentsPctGdp: rawIndicators[WORLD_BANK_INDICATORS.NATURAL_RESOURCE_RENTS_PCT] ?? null,
    lpiOverall: rawIndicators[WORLD_BANK_INDICATORS.LPI_OVERALL] ?? null,
    lpiInfrastructure: rawIndicators[WORLD_BANK_INDICATORS.LPI_INFRASTRUCTURE] ?? null,
    lpiTrackingTracing: rawIndicators[WORLD_BANK_INDICATORS.LPI_TRACKING] ?? null,
    lpiShipments: rawIndicators[WORLD_BANK_INDICATORS.LPI_SHIPMENTS] ?? null,
    lpiCustoms: rawIndicators[WORLD_BANK_INDICATORS.LPI_CUSTOMS] ?? null,
    rawIndicators,
  };
}

/**
 * Fetches an aggregated macroeconomic profile for a country across 12 standard indicators.
 */
export async function fetchWorldBankMacroProfile(
  countryCode: string,
  options: WorldBankFetchOptions = {}
): Promise<WorldBankMacroProfile> {
  const normCode = normalizeCountryCode(countryCode);
  const profileIndicators = [
    WORLD_BANK_INDICATORS.INTEREST_PAYMENTS_PCT_REVENUE,
    WORLD_BANK_INDICATORS.FX_RESERVES_MONTHS_IMPORT,
    WORLD_BANK_INDICATORS.GROSS_CAPITAL_FORMATION_PCT_GDP,
    WORLD_BANK_INDICATORS.MANUFACTURING_PCT_GDP,
    WORLD_BANK_INDICATORS.GDP_PER_CAPITA_USD,
    WORLD_BANK_INDICATORS.URBAN_AGGLOMERATION_PCT,
    WORLD_BANK_INDICATORS.NATURAL_RESOURCE_RENTS_PCT,
    WORLD_BANK_INDICATORS.LPI_OVERALL,
    WORLD_BANK_INDICATORS.LPI_INFRASTRUCTURE,
    WORLD_BANK_INDICATORS.LPI_TRACKING,
    WORLD_BANK_INDICATORS.LPI_SHIPMENTS,
    WORLD_BANK_INDICATORS.LPI_CUSTOMS,
  ];

  const batch = await fetchWorldBankIndicatorsBatch(normCode, profileIndicators, {
    mrv: 1,
    perPage: 10,
    ...options,
  });

  return assembleMacroProfile(normCode, batch);
}
