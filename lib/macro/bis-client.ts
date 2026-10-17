// Module: lib/macro/bis-client.ts
// Client for downloading and parsing BIS SDMX CSV datasets for credit and DSR.

import { rateLimitedFetch } from './rate-limited-queue';

export interface BisObservation {
  period: string; // 'YYYY-QX'
  value: number;
  stale: boolean;
}

/**
 * Parses a standard BIS CSV response and returns observation points.
 */
export function parseBisCsv(csvText: string): BisObservation[] {
  const lines = csvText.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
  if (lines.length < 2) return [];

  const header = lines[0];
  // Split header by comma, ignoring commas in quotes
  const headers = header.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(h => h.replace(/"/g, '').trim());
  
  const periodIndex = headers.indexOf('TIME_PERIOD');
  const valueIndex = headers.indexOf('OBS_VALUE');

  if (periodIndex === -1 || valueIndex === -1) {
    console.error('[BIS] CSV header does not contain TIME_PERIOD or OBS_VALUE:', headers);
    return [];
  }

  const observations: BisObservation[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(p => p.replace(/"/g, '').trim());
    
    if (parts.length <= Math.max(periodIndex, valueIndex)) continue;

    const period = parts[periodIndex]; // e.g., '1947-Q4' or '2025-Q1'
    const valueStr = parts[valueIndex];
    const value = parseFloat(valueStr);

    if (period && !isNaN(value)) {
      observations.push({
        period,
        value,
        stale: false
      });
    }
  }

  // Sort chronological ascending (oldest first)
  return observations.sort((a, b) => {
    const [yA, qA] = a.period.split('-Q').map(Number);
    const [yB, qB] = b.period.split('-Q').map(Number);
    if (yA !== yB) return yA - yB;
    return qA - qB;
  });
}

/**
 * Calculates current quarter based on date.
 */
export function getCurrentQuarter(date: Date = new Date()): { year: number; quarter: number } {
  const month = date.getMonth(); // 0-11
  const year = date.getFullYear();
  const quarter = Math.floor(month / 3) + 1; // 1-4
  return { year, quarter };
}

/**
 * Converts a period string 'YYYY-QX' to a numeric quarter code for calculations.
 */
export function periodToQuarterCode(period: string): number {
  const [yearStr, qStr] = period.split('-Q');
  const year = parseInt(yearStr);
  const q = parseInt(qStr);
  if (isNaN(year) || isNaN(q)) return 0;
  return year * 4 + (q - 1);
}

/**
 * Converts numeric quarter code back to 'YYYY-QX'.
 */
export function quarterCodeToPeriod(code: number): string {
  const year = Math.floor(code / 4);
  const q = (code % 4) + 1;
  return `${year}-Q${q}`;
}

/**
 * Applies linear extrapolation if the latest data point is more than 3 quarters older than the target quarter.
 */
export function extrapolateStaleData(
  observations: BisObservation[],
  targetYear: number,
  targetQuarter: number
): BisObservation[] {
  if (observations.length === 0) return [];

  const latest = observations[observations.length - 1];
  const latestCode = periodToQuarterCode(latest.period);
  const targetCode = targetYear * 4 + (targetQuarter - 1);

  const diffQuarters = targetCode - latestCode;

  // If latest data is not stale (<= 3 quarters old) or we have no trend, return as-is
  if (diffQuarters <= 3 || observations.length < 2) {
    return observations;
  }

  const results = [...observations];
  const secondLatest = observations[observations.length - 2];
  const secondLatestCode = periodToQuarterCode(secondLatest.period);

  const codeDiff = latestCode - secondLatestCode;
  if (codeDiff <= 0) return observations; // Safe guard against corrupt dates

  // Linear trend slope: delta value per quarter
  const slope = (latest.value - secondLatest.value) / codeDiff;

  // Project forward quarterly up to targetCode
  for (let c = latestCode + 1; c <= targetCode; c++) {
    const elapsed = c - latestCode;
    const projectedValue = latest.value + slope * elapsed;
    results.push({
      period: quarterCodeToPeriod(c),
      value: Math.round(projectedValue * 100) / 100, // round to 2 decimals
      stale: true
    });
  }

  return results;
}

/**
 * Fetches Credit to Private Non-financial Sector (% GDP) for a country.
 */
export async function fetchBisPrivateCredit(
  countryCode: string,
  targetYear: number,
  targetQuarter: number
): Promise<BisObservation[]> {
  const code = countryCode.toUpperCase();
  const url = `https://stats.bis.org/api/v2/data/dataflow/BIS/WS_TC/2.0/Q.${code}.P.A.M.770.A?format=csv`;

  try {
    console.log(`[BIS] Fetching private credit for ${code} from: ${url}`);
    const res = await rateLimitedFetch(url, { revalidateSeconds: 86400 * 7 }); // Cache 7 days
    if (!res.ok) {
      console.warn(`[BIS] Private credit fetch failed for ${code}: ${res.status}`);
      return [];
    }

    const csvText = await res.text();
    const parsed = parseBisCsv(csvText);
    return extrapolateStaleData(parsed, targetYear, targetQuarter);
  } catch (err) {
    console.error(`[BIS] Error fetching private credit for ${code}:`, err);
    return [];
  }
}

/**
 * Fetches Debt Service Ratio (DSR) for a country.
 */
export async function fetchBisDsr(
  countryCode: string,
  targetYear: number,
  targetQuarter: number
): Promise<BisObservation[]> {
  const code = countryCode.toUpperCase();
  const url = `https://stats.bis.org/api/v2/data/dataflow/BIS/WS_DSR/1.0/Q.${code}.P?format=csv`;

  try {
    console.log(`[BIS] Fetching DSR for ${code} from: ${url}`);
    const res = await rateLimitedFetch(url, { revalidateSeconds: 86400 * 7 }); // Cache 7 days
    if (!res.ok) {
      console.warn(`[BIS] DSR fetch failed for ${code}: ${res.status}`);
      return [];
    }

    const csvText = await res.text();
    const parsed = parseBisCsv(csvText);
    return extrapolateStaleData(parsed, targetYear, targetQuarter);
  } catch (err) {
    console.error(`[BIS] Error fetching DSR for ${code}:`, err);
    return [];
  }
}
