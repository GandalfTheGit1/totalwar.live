/**
 * lib/services/geopolitical/country-resolver.ts
 *
 * Resolves country identifiers (ISO-2, ISO-3, Wikidata QID, multilingual names,
 * and trade aliases) to canonical ISO-2 country codes.
 */

import {
  GEOPOLITICAL_45_COUNTRIES,
  COUNTRY_BY_CODE,
  COUNTRY_BY_QID,
  COUNTRY_BY_ISO3
} from '../../data/geopolitical-countries';
import {
  findCountryByCode,
  findCountryByIso3,
  findCountryByName
} from '../../data/all-198-countries';
import { COMMON_COUNTRY_ALIASES } from './country-aliases';

/**
 * Searches the 45 curated countries by Spanish or English name.
 */
function findIn45ByName(identifier: string): string | null {
  const lower = identifier.toLowerCase();
  const match = GEOPOLITICAL_45_COUNTRIES.find(
    c => c.nameEs.toLowerCase() === lower || c.nameEn.toLowerCase() === lower
  );
  return match ? match.code : null;
}

/**
 * Resolves a country identifier from ISO-2, ISO-3, QID, or name.
 */
export function resolveCountryCode(identifier: string): string | null {
  if (!identifier || typeof identifier !== 'string') return null;
  const clean = identifier.trim().toUpperCase();

  // Check trade and multilingual aliases (e.g. 'UK' -> 'GB', 'UAE' -> 'AE')
  if (COMMON_COUNTRY_ALIASES[clean]) {
    return COMMON_COUNTRY_ALIASES[clean];
  }

  // Check 45-country indexed maps
  if (COUNTRY_BY_CODE.has(clean)) return clean;
  if (COUNTRY_BY_ISO3.has(clean)) return COUNTRY_BY_ISO3.get(clean)!.code;
  if (COUNTRY_BY_QID.has(clean)) return COUNTRY_BY_QID.get(clean)!.code;

  // Search canonical 198 countries catalog
  const codeCandidate = findCountryByCode(clean);
  if (codeCandidate) return codeCandidate.code;

  const iso3Candidate = findCountryByIso3(clean);
  if (iso3Candidate) return iso3Candidate.code;

  const nameCandidate = findCountryByName(identifier.trim());
  if (nameCandidate) return nameCandidate.code;

  return findIn45ByName(identifier.trim());
}
