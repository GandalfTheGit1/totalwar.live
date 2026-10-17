// Module: lib/macro/ecb-client.ts
// Client for fetching ECB Maastricht long-term interest rates and calculating Bund spreads.

import { rateLimitedFetch } from './rate-limited-queue';

export interface EcbObservation {
  date: string;  // 'YYYY-MM-DD'
  value: number;
}

/**
 * Fetch Maastricht convergence 10-year government bond yields from the ECB API.
 * Returns sorted chronologically ascending.
 */
export async function fetchEcbMaastrichtYield(countryCode: string): Promise<EcbObservation[]> {
  const code = countryCode.toUpperCase();
  // FM dataflow: Financial Markets — Maastricht long-term government bond yields (10Y)
  // This is the correct series for sovereign bond spreads (used for Bund spread calculation).
  // Format: M.{CC}.EUR.4F.BB.U2_10Y.YLD (Monthly, Country, EUR, Government bonds, Benchmark, Eurozone, 10Y, Yield)
  const url = `https://data-api.ecb.europa.eu/service/data/FM/M.${code}.EUR.4F.BB.U2_10Y.YLD?format=jsondata&detail=dataonly`;

  try {
    console.log(`[ECB] Fetching yields for ${code} from: ${url}`);
    const res = await rateLimitedFetch(url, { revalidateSeconds: 86400 * 7 }); // Cache for 7 days
    if (!res.ok) {
      console.warn(`[ECB] Fetch failed for ${code}: ${res.status}`);
      return [];
    }

    const data = await res.json();
    if (!data || !data.dataSets || data.dataSets.length === 0 || !data.dataSets[0].series) {
      console.warn(`[ECB] No series data in response for ${code}`);
      return [];
    }

    const seriesObj = data.dataSets[0].series;
    const seriesKeys = Object.keys(seriesObj);
    if (seriesKeys.length === 0) return [];

    const observationsObj = seriesObj[seriesKeys[0]].observations;
    const dimensions = data.structure?.dimensions?.observation;
    if (!dimensions || dimensions.length === 0 || !dimensions[0].values) {
      console.warn(`[ECB] Missing dimensions in response for ${code}`);
      return [];
    }

    const periods = dimensions[0].values;
    const observations: EcbObservation[] = [];

    // Map periods to observations
    for (const key of Object.keys(observationsObj)) {
      const idx = parseInt(key);
      const valArray = observationsObj[key];
      if (idx >= 0 && idx < periods.length && valArray && valArray.length > 0) {
        const periodId = periods[idx].id; // e.g., '2026-06'
        const value = parseFloat(valArray[0]);
        if (periodId && !isNaN(value)) {
          // Convert 'YYYY-MM' to 'YYYY-MM-01' for temporal alignment compatibility
          observations.push({
            date: `${periodId}-01`,
            value
          });
        }
      }
    }

    // Sort ascending by date
    return observations.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (err) {
    console.error(`[ECB] Error fetching yields for ${code}:`, err);
    return [];
  }
}

/**
 * Calculates the sovereign yield spread vs the German Bund in basis points (pb).
 * Formula: (Yield_Country - Yield_Germany) * 100
 */
export async function fetchBundSpread(countryCode: string): Promise<{ spread: number; yieldVal: number } | null> {
  const code = countryCode.toUpperCase();
  if (code === 'DE') {
    const deYields = await fetchEcbMaastrichtYield('DE');
    const latestDe = deYields.length > 0 ? deYields[deYields.length - 1].value : 0;
    return { spread: 0, yieldVal: latestDe };
  }

  try {
    const [deYields, countryYields] = await Promise.all([
      fetchEcbMaastrichtYield('DE'),
      fetchEcbMaastrichtYield(code)
    ]);

    if (deYields.length === 0 || countryYields.length === 0) {
      console.warn(`[ECB] Insufficient data to calculate Bund spread for ${code}`);
      return null;
    }

    const latestDe = deYields[deYields.length - 1].value;
    const latestCountry = countryYields[countryYields.length - 1].value;

    const spreadBps = Math.round((latestCountry - latestDe) * 100);
    return {
      spread: spreadBps,
      yieldVal: latestCountry
    };
  } catch (err) {
    console.error(`[ECB] Error calculating Bund spread for ${code}:`, err);
    return null;
  }
}
