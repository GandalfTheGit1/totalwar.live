// Module: lib/macro/world-bank-parser.ts
// Pure parsing and normalization routines for the World Bank (BIRF) API v2 responses.

import type {
  WorldBankFetchOptions,
  WorldBankObservation,
  WorldBankPaginationHeader,
  WorldBankRawRecord,
} from './world-bank-types';

/**
 * Normalizes ISO country codes (trim, uppercase).
 */
export function normalizeCountryCode(code: string): string {
  return (code || '').trim().toUpperCase();
}

/**
 * Constructs the canonical World Bank API v2 URL.
 * Note: World Bank API allows semicolon-separated countries (e.g. USA;MEX;BRA),
 * but prohibits semicolon-separated indicators in a single path.
 */
export function buildWorldBankUrl(
  countrySegment: string,
  indicatorId: string,
  options: WorldBankFetchOptions = {}
): string {
  const { mrv, date, perPage = 300, page = 1 } = options;
  const params = new URLSearchParams();
  params.set('format', 'json');
  params.set('per_page', String(perPage));
  params.set('page', String(page));

  if (mrv !== undefined) {
    params.set('mrv', String(mrv));
  }
  if (date !== undefined) {
    params.set('date', date);
  }

  const cleanCountry = (countrySegment || '')
    .split(';')
    .map((c) => c.trim())
    .filter(Boolean)
    .join(';') || 'all';
  const cleanIndicator = encodeURIComponent(indicatorId.trim());

  return `https://api.worldbank.org/v2/country/${cleanCountry}/indicator/${cleanIndicator}?${params.toString()}`;
}

/**
 * Error raised when the World Bank API answers with an explicit error envelope
 * (e.g. `[120] The provided parameter value is not valid` for an unknown indicator).
 * Distinguishes request-level rejections from transport / rate-limit failures.
 */
export class WorldBankApiError extends Error {
  readonly apiCode?: string;

  constructor(message: string, apiCode?: string) {
    super(message);
    this.name = 'WorldBankApiError';
    this.apiCode = apiCode;
  }
}

/**
 * Validates whether the incoming payload matches an error envelope from the World Bank API.
 * Throws explicit descriptive error if an envelope is detected.
 */
// Refactor reason: Extracted from parseWorldBankResponse to keep function under 50 lines (Rule 2).
function assertNoErrorEnvelope(envelope: unknown): void {
  if (typeof envelope !== 'object' || envelope === null || !('message' in envelope)) {
    return;
  }
  const errorObj = envelope as { message: Array<{ id?: string; key?: string; value?: string }> | string };
  if (Array.isArray(errorObj.message) && errorObj.message.length > 0) {
    const err = errorObj.message[0];
    const code = err.id ? `[${err.id}] ` : '';
    const key = err.key ? ` (${err.key})` : '';
    throw new WorldBankApiError(`[WorldBank] API Error ${code}${err.value || 'Invalid request'}${key}`, err.id);
  }
  if (typeof errorObj.message === 'string') {
    throw new WorldBankApiError(`[WorldBank] API Error: ${errorObj.message}`);
  }
}

/**
 * Transforms a raw observation element from World Bank into a normalized WorldBankObservation.
 */
// Refactor reason: Pure mapping extracted to isolate numerical coercion and maintain single responsibility.
function transformRawObservation(raw: WorldBankRawRecord): WorldBankObservation {
  const indicatorId = raw.indicator?.id || '';
  const indicatorName = raw.indicator?.value || '';
  const countryCode = normalizeCountryCode(raw.country?.id || '');
  const rawIso3 = normalizeCountryCode(raw.countryiso3code || '');
  const countryIso3 = rawIso3 || countryCode;
  const countryName = raw.country?.value || '';
  const year = parseInt(raw.date, 10) || 0;
  const rawDateStr = raw.date ? String(raw.date) : (year ? String(year) : '');

  let value: number | null = null;
  if (raw.value !== null && raw.value !== undefined) {
    const parsedNum = typeof raw.value === 'number' ? raw.value : parseFloat(String(raw.value));
    value = isNaN(parsedNum) ? null : parsedNum;
  }

  return {
    indicatorId,
    indicatorName,
    countryCode,
    countryIso3,
    countryName,
    year,
    date: rawDateStr,
    value,
  };
}

/**
 * Parses and validates the raw JSON returned by the World Bank API.
 * Throws explicit descriptive errors on API error envelopes or malformed structures.
 */
export function parseWorldBankResponse(
  json: unknown,
  filterNullValues: boolean = false
): { pagination: WorldBankPaginationHeader; records: WorldBankObservation[] } {
  if (!Array.isArray(json)) {
    assertNoErrorEnvelope(json);
    throw new Error('[WorldBank] Invalid response format: expected JSON array');
  }

  if (json.length === 0) {
    throw new Error('[WorldBank] Empty response array received from World Bank API');
  }

  // Detect error envelope inside array format: [{ message: [...] }]
  assertNoErrorEnvelope(json[0]);

  if (json.length < 2) {
    throw new Error('[WorldBank] Invalid World Bank response: missing data records element at index 1');
  }

  const pagination = json[0] as WorldBankPaginationHeader;
  const rawRecords = json[1];

  // When World Bank API returns 0 matching records, rawRecords is null: [{"page":0,"pages":0,"total":0}, null]
  if (rawRecords === null || rawRecords === undefined) {
    return { pagination, records: [] };
  }

  if (!Array.isArray(rawRecords)) {
    throw new Error('[WorldBank] Invalid World Bank records: expected array at index 1');
  }

  const records: WorldBankObservation[] = [];
  for (const raw of rawRecords as WorldBankRawRecord[]) {
    if (!raw) continue;
    const obs = transformRawObservation(raw);
    if (filterNullValues && obs.value === null) {
      continue;
    }
    records.push(obs);
  }

  return { pagination, records };
}
