// Module: lib/macro/fred-series-map.ts
// Defines mapping of country ISO codes to FRED series IDs.
// Extended with all variables from Ray Dalio's "How the Economic Machine Works" model.

import type { CountryFredSeries } from './fred/types';
import {
  US_FRED_SERIES,
  CA_FRED_SERIES,
  MX_FRED_SERIES,
  BR_FRED_SERIES,
} from './fred/americas';
import {
  DE_FRED_SERIES,
  FR_FRED_SERIES,
  IT_FRED_SERIES,
  ES_FRED_SERIES,
  IE_FRED_SERIES,
  GB_FRED_SERIES,
} from './fred/europe';
import {
  JP_FRED_SERIES,
  CN_FRED_SERIES,
  IN_FRED_SERIES,
  KR_FRED_SERIES,
  AU_FRED_SERIES,
} from './fred/asia-pacific';

export type { CountryFredSeries };

export const FRED_SERIES_MAP: Record<string, CountryFredSeries> = {
  US: US_FRED_SERIES,
  DE: DE_FRED_SERIES,
  FR: FR_FRED_SERIES,
  IT: IT_FRED_SERIES,
  ES: ES_FRED_SERIES,
  IE: IE_FRED_SERIES,
  JP: JP_FRED_SERIES,
  GB: GB_FRED_SERIES,
  CN: CN_FRED_SERIES,
  IN: IN_FRED_SERIES,
  BR: BR_FRED_SERIES,
  KR: KR_FRED_SERIES,
  CA: CA_FRED_SERIES,
  AU: AU_FRED_SERIES,
  MX: MX_FRED_SERIES,
};

/**
 * Returns the mapping of FRED series IDs for a country if it exists.
 */
export function getCountryFredSeriesMap(countryCode: string): CountryFredSeries | null {
  const code = countryCode.toUpperCase();
  return FRED_SERIES_MAP[code] || null;
}
